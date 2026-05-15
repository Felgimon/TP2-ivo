-- Script para crear las tablas en Supabase
-- Ejecutar en el SQL Editor del dashboard de Supabase

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Crear índice para búsquedas por username
CREATE INDEX idx_users_username ON users(username);

-- Tabla de builds guardados
CREATE TABLE saved_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  build JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Crear índice para búsquedas por usuario
CREATE INDEX idx_saved_builds_user_id ON saved_builds(user_id);
CREATE INDEX idx_saved_builds_created_at ON saved_builds(created_at DESC);

-- Habilitar RLS (Row Level Security) para mayor seguridad
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_builds ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
CREATE POLICY "Anyone can see users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own info" ON users FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para builds
CREATE POLICY "Anyone can see public builds" ON saved_builds FOR SELECT USING (true);
CREATE POLICY "Users can insert their own builds" ON saved_builds FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own builds" ON saved_builds FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own builds" ON saved_builds FOR DELETE USING (true);
