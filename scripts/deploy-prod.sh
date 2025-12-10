# --- 1. GARANTIR CONFIGURAÇÃO ---
echo "Verificando arquivo de configuração .env.prod..."
if [ ! -f .env.prod ]; then
    # Assume que .env.prod.example existe
    if [ -f .env.prod.example ]; then
        cp .env.prod.example .env.prod
        echo "Arquivo .env.prod criado a partir do template."
        echo "!!! ATENÇÃO: Edite o .env.prod com seus segredos (passwords, JWT) antes de prosseguir. !!!"
    else
        echo "ERRO: O arquivo .env.prod ou .env.prod.example não foi encontrado."
        exit 1
    fi
fi

source .env.prod

echo "Baixando imagens oficiais do ghcr.io (usando tags do .env.prod)..."
# Microserviços
docker pull ghcr.io/$REPO_OWNER/auth-service:${AUTH_IMAGE_TAG:-latest}
docker pull ghcr.io/$REPO_OWNER/user-service:${USER_IMAGE_TAG:-latest}
docker pull ghcr.io/$REPO_OWNER/room-service:${ROOM_IMAGE_TAG:-latest}
docker pull ghcr.io/$REPO_OWNER/resources-service:${RESOURCES_IMAGE_TAG:-latest}
docker pull ghcr.io/$REPO_OWNER/booking-service:${BOOKING_IMAGE_TAG:-latest}
docker pull ghcr.io/$REPO_OWNER/notification-service:${NOTIFICATION_IMAGE_TAG:-latest}
# Gateway
docker pull ghcr.io/$REPO_OWNER/gateway:${GATEWAY_IMAGE_TAG:-latest}

# --- 3. SUBIR CONTÊINERES ---
echo "Subindo o ambiente Docker Compose..."
# Usa o arquivo de deploy e o .env.prod para as variáveis
docker compose -f docker-compose.deploy.yml --env-file .env.prod up -d

# --- 4. VERIFICAR SAÚDE ---
echo "Aguardando 15 segundos para os serviços iniciarem e rodarem migrações..."
sleep 15 
echo "Realizando Health Checks básicos..."
if curl --fail http://localhost:3000/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ Gateway Service está UP e saudável."
else
    echo "❌ Gateway Service falhou no Health Check."
fi
#--
if curl --fail http://localhost:3001/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ Auth Service está UP e saudável."
else
    echo "❌ Auth Service falhou no Health Check."
fi
#--
if curl --fail http://localhost:3002/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ Notification Service está UP e saudável."
else
    echo "❌ Notification Service falhou no Health Check."
fi
#--
if curl --fail http://localhost:3003/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ User Service está UP e saudável."
else
    echo "❌ User Service falhou no Health Check."
fi
#--
if curl --fail http://localhost:3004/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ Room Service está UP e saudável."
else
    echo "❌ Room Service falhou no Health Check."
fi
#--
if curl --fail http://localhost:3005/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ Resources Service está UP e saudável."
else
    echo "❌ Resources Service falhou no Health Check."
fi
#--
if curl --fail http://localhost:3006/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ Booking Service está UP e saudável."
else
    echo "❌ Booking Service falhou no Health Check."
fi
echo "Deploy e verificação concluídos!"