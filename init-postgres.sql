-- Cria a extensão citext (para emails case-insensitive, como recomendado)
-- Ela é criada no schema 'public' por padrão.
--CREATE DATABASE sistema_reserva;
\connect sistema_reserva;
CREATE EXTENSION IF NOT EXISTS citext;

-- Cria schemas separados para cada microserviço, garantindo isolamento lógico.
-- Isso é o que substitui a necessidade de múltiplos bancos de dados.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS rooms;
CREATE SCHEMA IF NOT EXISTS resources;
CREATE SCHEMA IF NOT EXISTS bookings;
CREATE SCHEMA IF NOT EXISTS notifications;

-- 3. (OPCIONAL, mas recomendável) Define o search_path para o usuário padrão
-- Isso garante que as extensões no schema public (como citext) sejam encontradas
-- pelos schemas dos microserviços, resolvendo o 'Ponto crítico identificado' do guia
-- ATENÇÃO: Se o seu serviço já configura o search_path via TypeORM (como recomendado pelo guia), este passo pode ser redundante, mas é uma segurança.
ALTER ROLE admin SET search_path TO "$user", public;