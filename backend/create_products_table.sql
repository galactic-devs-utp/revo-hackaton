-- 1. Crear la tabla de productos (inventario)
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  usage text,
  characteristics text[], -- Almacena una lista de características
  price numeric(10, 2) not null,
  unit text not null, -- ej: 'galón', 'tonelada', 'kg'
  image_path text, -- apunta al archivo local del backend
  stock numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Insertar los 2 productos iniciales con sus datos correspondientes
insert into products (name, description, usage, characteristics, price, unit, image_path, stock)
values 
(
  'Aceite de Pirólisis (Tire Pyrolysis Oil - TPO)', 
  'Combustible industrial líquido obtenido a partir de la pirólisis de neumáticos fuera de uso (NFU), ideal como sustituto del diésel industrial o fuel oil.', 
  'Uso en calderas, hornos industriales, generación de energía y plantas de asfalto.', 
  array['Alto poder calorífico (aprox. 10,000 kcal/kg)', 'Baja viscosidad', 'Color ámbar oscuro'], 
  2.80, 
  'galón', 
  '/static/products/pyrolysis_oil.png', 
  1200
),
(
  'Gránulo Grueso (Chip o Mulch de Caucho)', 
  'Chips y mulch de caucho reciclado proveniente de trituración de neumáticos, diseñado para coberturas protectoras y paisajismo.', 
  'Cobertura de suelos en parques infantiles, paisajismo, control de erosión y pistas ecuestres.', 
  array['Excelente amortiguación de impactos', 'Altamente resistente a la intemperie', 'Excelente drenaje de agua'], 
  350.00, 
  'tonelada', 
  '/static/products/rubber_mulch.png', 
  40
);
