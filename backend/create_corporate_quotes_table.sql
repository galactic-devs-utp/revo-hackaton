-- Run this script in the Supabase SQL Editor to create the corporate_quotes table
-- and populate it with initial mock data.

CREATE TABLE IF NOT EXISTS corporate_quotes (
    id TEXT PRIMARY KEY,
    ticket TEXT NOT NULL,
    empresa TEXT NOT NULL,
    material TEXT NOT NULL,
    volumen TEXT NOT NULL,
    presupuesto TEXT NOT NULL,
    contacto TEXT,
    estado TEXT NOT NULL,
    fecha DATE NOT NULL
);

-- Enable row-level security (RLS) if needed, or leave open for the hackathon
ALTER TABLE corporate_quotes DISABLE ROW LEVEL SECURITY;

-- Insert initial mock data
INSERT INTO corporate_quotes (id, ticket, empresa, material, volumen, presupuesto, contacto, estado, fecha)
VALUES 
  ('Q-082', '58492', 'Consorcio Vial Piura S.A.C.', 'Caucho Granulado Fino', '45.2 Tons', 'S/. 125,500', '+51 982 122 322', 'Pendiente', '2026-07-11')
ON CONFLICT (id) DO NOTHING;

INSERT INTO corporate_quotes (id, ticket, empresa, material, volumen, presupuesto, contacto, estado, fecha)
VALUES 
  ('Q-081', '39481', 'Aceros Arequipa S.A.', 'Acero de Llanta Siderúrgico', '180.0 Tons', 'S/. 324,000', '+51 945 889 212', 'Aprobado', '2026-07-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO corporate_quotes (id, ticket, empresa, material, volumen, presupuesto, contacto, estado, fecha)
VALUES 
  ('Q-080', '82048', 'UNACEM S.A.A.', 'Aceite Pirolítico Industrial', '8,500 Gls', 'S/. 142,500', '+51 902 443 112', 'Despachado', '2026-07-09')
ON CONFLICT (id) DO NOTHING;

INSERT INTO corporate_quotes (id, ticket, empresa, material, volumen, presupuesto, contacto, estado, fecha)
VALUES 
  ('Q-079', '19385', 'Constructora San Martín S.A.', 'Negro de Humo Recuperado (rCB)', '12.5 Tons', 'S/. 65,000', '+51 977 432 110', 'Pendiente', '2026-07-08')
ON CONFLICT (id) DO NOTHING;
