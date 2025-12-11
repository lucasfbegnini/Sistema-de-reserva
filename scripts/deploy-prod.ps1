# --- 1. GARANTIR CONFIGURAÇÃO ---
Write-Host "Verificando arquivo de configuracao .env.prod..."

if (-not (Test-Path ".env.prod")) {
    # Assume que .env.prod.example existe
    if (Test-Path ".env.prod.example") {
        Copy-Item -Path ".env.prod.example" -Destination ".env.prod"
        Write-Host "Arquivo .env.prod criado a partir do template."
        Write-Warning "!!! ATENÇÃO: Edite o .env.prod com seus segredos (passwords, JWT) antes de prosseguir. !!!"
    } else {
        Write-Error "ERRO: O arquivo .env.prod ou .env.prod.example não foi encontrado."
        exit 1
    }
}

# Carregar variáveis do arquivo .env.prod para a sessão atual do PowerShell
# (Equivalente ao "source .env.prod")
$envContent = Get-Content ".env.prod"
foreach ($line in $envContent) {
    # Ignora comentários e linhas vazias
    if ($line -match "^\s*([^#=]+)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim("'").Trim('"') # Remove aspas se houver
        Set-Variable -Name $name -Value $value -Scope Script
    }
}

# Define valores padrão se não existirem no arquivo (Equivalente ao :-latest)
if (-not $REPO_OWNER) { $REPO_OWNER = "lucasfbegnini" } # Fallback de segurança
if (-not $AUTH_IMAGE_TAG) { $AUTH_IMAGE_TAG = "latest" }
if (-not $USER_IMAGE_TAG) { $USER_IMAGE_TAG = "latest" }
if (-not $ROOM_IMAGE_TAG) { $ROOM_IMAGE_TAG = "latest" }
if (-not $RESOURCES_IMAGE_TAG) { $RESOURCES_IMAGE_TAG = "latest" }
if (-not $BOOKING_IMAGE_TAG) { $BOOKING_IMAGE_TAG = "latest" }
if (-not $NOTIFICATION_IMAGE_TAG) { $NOTIFICATION_IMAGE_TAG = "latest" }
if (-not $GATEWAY_IMAGE_TAG) { $GATEWAY_IMAGE_TAG = "latest" }

Write-Host "Baixando imagens oficiais do ghcr.io (usando tags do .env.prod)..." -ForegroundColor Cyan

# Microserviços
docker pull "ghcr.io/$REPO_OWNER/auth-service:$AUTH_IMAGE_TAG"
docker pull "ghcr.io/$REPO_OWNER/users-service:$USER_IMAGE_TAG"
docker pull "ghcr.io/$REPO_OWNER/rooms-service:$ROOM_IMAGE_TAG"
docker pull "ghcr.io/$REPO_OWNER/resources-service:$RESOURCES_IMAGE_TAG"
docker pull "ghcr.io/$REPO_OWNER/bookings-service:$BOOKING_IMAGE_TAG"
docker pull "ghcr.io/$REPO_OWNER/notification-service:$NOTIFICATION_IMAGE_TAG"
# Gateway
docker pull "ghcr.io/$REPO_OWNER/gateway:$GATEWAY_IMAGE_TAG"

# --- 3. SUBIR CONTÊINERES ---
Write-Host "Subindo o ambiente Docker Compose..." -ForegroundColor Cyan
# Usa o arquivo de deploy e o .env.prod para as variáveis
docker compose -f docker-compose.deploy.yml --env-file .env.prod up -d

# --- 4. VERIFICAR SAÚDE ---
Write-Host "Aguardando 15 segundos para os servicos iniciarem e rodarem migracoes" -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "Realizando Health Checks" -ForegroundColor Cyan

# Função auxiliar para verificar saúde (Equivalente aos blocos if curl...)
function Check-Health {
    param (
        [string]$Url,
        [string]$ServiceName
    )
    try {
        # Tenta acessar a URL. Se falhar (404, 500, conexão recusada), cai no catch.
        $response = Invoke-RestMethod -Uri $Url -ErrorAction Stop
        
        # Verifica se a resposta contém status: ok
        # (Adaptação: Invoke-RestMethod já converte JSON para objeto, então verificamos a propriedade)
        if ($response.status -eq "ok" -or $response -match '"status":"ok"' -or $response -match "Hello") {
            Write-Host " $ServiceName esta UP." -ForegroundColor Green
        } else {
            Write-Host "⚠️ $ServiceName respondeu, mas com conteúdo inesperado: $response" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " $ServiceName falhou no Health Check." -ForegroundColor Red
    }
}

Check-Health -Url "http://localhost:3000/health" -ServiceName "Gateway Service"
Check-Health -Url "http://localhost:3001/" -ServiceName "Auth Service"
Check-Health -Url "http://localhost:3002/" -ServiceName "Notification Service"
Check-Health -Url "http://localhost:3003/" -ServiceName "User Service"
Check-Health -Url "http://localhost:3004/" -ServiceName "Room Service"
Check-Health -Url "http://localhost:3005/" -ServiceName "Resources Service"
Check-Health -Url "http://localhost:3006/" -ServiceName "Booking Service"

Write-Host "Deploy e verificacao feito!" -ForegroundColor Green