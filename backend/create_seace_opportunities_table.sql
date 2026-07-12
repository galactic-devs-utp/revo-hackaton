-- Run this script in the Supabase SQL Editor to create the seace_opportunities table
-- and populate it with initial mock data.

CREATE TABLE IF NOT EXISTS seace_opportunities (
    id BIGINT PRIMARY KEY,
    entidad TEXT NOT NULL,
    objeto TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    fecha_publicacion DATE NOT NULL,
    estado TEXT NOT NULL,
    enlace_seace TEXT,
    puntaje_sostenible INTEGER,
    viabilidad TEXT,
    correo_contacto TEXT
);

-- Disable row-level security (RLS) if needed, or leave open for the hackathon
ALTER TABLE seace_opportunities DISABLE ROW LEVEL SECURITY;
