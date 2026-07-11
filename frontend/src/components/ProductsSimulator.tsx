import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface ProjectType {
  id: string;
  name: string;
  factor: number;
  unit: string;
  label: string;
  badge: string;
  info: string;
}

interface ProductLocalConfig {
  key: string;
  co2Factor: number;
  imageFallback: string;
  badgeText: string;
  category: string;
  projects: ProjectType[];
}

const LOCAL_PRODUCTS_CONFIG: Record<string, ProductLocalConfig> = {
  "Caucho Granulado Fino": {
    key: "caucho",
    co2Factor: 2.4,
    imageFallback: "https://bca085d4.delivery.rocketcdn.me/wp-content/uploads/2023/07/caucho.webp",
    badgeText: "En Stock",
    category: "Modificación Reológica",
    projects: [
      {
        id: "c1",
        name: "Pavimentación Vial e Infraestructura de Tránsito Pesado",
        factor: 0.005,
        unit: "Toneladas",
        label: "Área de Pavimentación Vial (m²)",
        badge: "m²",
        info: "La adición de caucho contrarresta el agrietamiento por fatiga y las deformaciones estructurales causadas por exceso de humedad.",
      },
      {
        id: "c2",
        name: "Superficies Técnicas y Campos Deportivos Amortiguantes",
        factor: 0.008,
        unit: "Toneladas",
        label: "Área Total Proyectada (m²)",
        badge: "m²",
        info: "Garantiza niveles óptimos de elasticidad y absorción de impactos mecánicos bajo criterios técnicos de seguridad.",
      },
    ]
  },
  "Aceite Pirolítico Industrial": {
    key: "aceite",
    co2Factor: 0.0035,
    imageFallback: "https://s.alicdn.com/@sc04/kf/Ha2fa98420ffb42ada2c1167ed3462ebdH/5-35-Ton-Waste-Oil-Distillation-Recycling-Plant-Plastics-Tire-Pyrolysis-Oil-to-Diesel-or-Base-Oil-More-Than-SN150.png_300x300.jpg",
    badgeText: "Pre-Industrial Order",
    category: "Suministro Líquido",
    projects: [
      {
        id: "a1",
        name: "Co-Procesamiento Térmico (Hornos y Calderas Industriales)",
        factor: 1.2,
        unit: "Galones",
        label: "Demanda Térmica Estimada (Galones)",
        badge: "Gal",
        info: "Combustible industrial directo de alta densidad calórica para la optimización de costos operativos en sistemas de combustión pesada medido en galones estándar.",
      },
    ]
  },
  "Negro de Humo Recuperado (rCB)": {
    key: "carbon",
    co2Factor: 1.8,
    imageFallback: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6j2PKrDVeNOFN5k-A7rAVVtiDDUXp2jyGbAAJknw4BQ&s=10",
    badgeText: "En Stock",
    category: "Insumo Industrial",
    projects: [
      {
        id: "n1",
        name: "Líneas de Refuerzo de Polímeros y Masterbatch Químico",
        factor: 0.002,
        unit: "Toneladas",
        label: "Lote de Manufactura Programado (Lotes)",
        badge: "Lot",
        info: "Insumo de alta estabilidad física ideal para otorgar resistencia mecánica y protección contra la radiación ultravioleta.",
      },
    ]
  },
  "Acero de Llanta Siderúrgico": {
    key: "acero",
    co2Factor: 1.5,
    imageFallback: "https://bestonpyrolysisplant.com/wp-content/uploads/2026/01/The-remaining-steel-wires-in-batch-tyre-pyrolysis-reactor.webp",
    badgeText: "En Stock",
    category: "Materia Prima Ferrosa",
    projects: [
      {
        id: "ac1",
        name: "Fibras de Refuerzo y Carga Estructural en Fundiciones",
        factor: 0.015,
        unit: "Toneladas",
        label: "Volumen de Carga Ferrosa (Toneladas)",
        badge: "Tons",
        info: "Refuerzo físico ideal para elevar el límite de tracción estructural en fundiciones y mezclas de concreto complejas.",
      },
    ]
  }
};

interface DbProduct {
  id: string;
  name: string;
  description: string;
  usage: string;
  characteristics: string[];
  price: number;
  unit: string;
  image_path: string;
  stock: number;
}

export const ProductsSimulator: React.FC = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [maxStep, setMaxStep] = useState<number>(1);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [dimensionInput, setDimensionInput] = useState<number>(1000);
  
  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [ruc, setRuc] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [plantaAddress, setPlantaAddress] = useState<string>('');

  const WHATSAPP_DESTINO = "51948715121";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        if (data && data.length > 0) {
          setProducts(data);
          setSelectedProductId(data[0].id);
          
          // Set initial project based on first product config
          const config = LOCAL_PRODUCTS_CONFIG[data[0].name];
          if (config && config.projects.length > 0) {
            setSelectedProjectId(config.projects[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedProductConfig = selectedProduct ? LOCAL_PRODUCTS_CONFIG[selectedProduct.name] : null;
  const selectedProject = selectedProductConfig?.projects.find(proj => proj.id === selectedProjectId);

  // Calculations
  const outputQty = selectedProject && dimensionInput 
    ? parseFloat((dimensionInput * selectedProject.factor).toFixed(2)) 
    : 0;

  const outputCost = selectedProduct && outputQty 
    ? parseFloat((outputQty * selectedProduct.price).toFixed(2)) 
    : 0;

  const outputCO2 = selectedProductConfig && outputQty
    ? parseFloat((outputQty * selectedProductConfig.co2Factor).toFixed(2))
    : 0;

  const handleProductSelect = (id: string, name: string) => {
    setSelectedProductId(id);
    const config = LOCAL_PRODUCTS_CONFIG[name];
    if (config && config.projects.length > 0) {
      setSelectedProjectId(config.projects[0].id);
    }
    setActiveStep(1);
    setMaxStep(1);
  };

  const handleNextStep = (next: number) => {
    if (next > maxStep) {
      setMaxStep(next);
    }
    setActiveStep(next);
  };

  const handleGoToStep = (step: number) => {
    if (step <= maxStep) {
      setActiveStep(step);
    }
  };

  const enviarWhatsApp = () => {
    if (!companyName || !ruc || !contactName || !email || !plantaAddress || !selectedProduct || !selectedProject) {
      alert("Por favor rellene todos los campos obligatorios.");
      return;
    }

    const message = `*REQUERIMIENTO DE COTIZACIÓN B2B - REVOLINK*\n\n` +
      `*Datos del Cliente:*\n` +
      `- Razón Social: ${companyName}\n` +
      `- RUC: ${ruc}\n` +
      `- Contacto: ${contactName}\n` +
      `- Correo: ${email}\n` +
      `- Planta Destino: ${plantaAddress}\n\n` +
      `*Detalle del Proyecto:*\n` +
      `- Material Requerido: ${selectedProduct.name}\n` +
      `- Destino de Aplicación: ${selectedProject.name}\n` +
      `- Volumen Proyectado: ${dimensionInput} ${selectedProject.badge}\n` +
      `- Volumen Requerido: ${outputQty} ${selectedProject.unit}\n` +
      `- Presupuesto Estimado (F.O.B.): $${outputCost.toLocaleString()} USD\n` +
      `- Mitigación CO2 estimada: -${outputCO2} t CO2e\n\n` +
      `Favor de contactar a la brevedad para coordinar cotización formal de suministro.`;

    const url = `https://wa.me/${WHATSAPP_DESTINO}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#F7F7F2] text-[#14181A] font-sans min-h-screen py-6 px-4 md:px-8">
      {/* FRANJA DE INDICADORES */}
      <section className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-[#E7E7E1] rounded-xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#F4FAE0] flex items-center justify-center mb-3">
              <span className="text-[#9EB93A] font-bold text-sm">🌎</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight">3</p>
            <p className="text-[10px] font-bold text-[#5B6570] uppercase tracking-wide mt-1">Países LATAM</p>
          </div>
          <div className="bg-white border border-[#E7E7E1] rounded-xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#E4F5E7] flex items-center justify-center mb-3">
              <span className="text-[#2E9E5B] font-bold text-sm">🔥</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight">150+</p>
            <p className="text-[10px] font-bold text-[#5B6570] uppercase tracking-wide mt-1">Campañas Activas</p>
          </div>
          <div className="bg-white border border-[#E7E7E1] rounded-xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#F4FAE0] flex items-center justify-center mb-3">
              <span className="text-[#9EB93A] font-bold text-sm">🌱</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight">32,000+</p>
            <p className="text-[10px] font-bold text-[#5B6570] uppercase tracking-wide mt-1">Toneladas Procesadas</p>
          </div>
          <div className="bg-white border border-[#E7E7E1] rounded-xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#E4F5E7] flex items-center justify-center mb-3">
              <span className="text-[#2E9E5B] font-bold text-sm">⚙️</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight">4</p>
            <p className="text-[10px] font-bold text-[#5B6570] uppercase tracking-wide mt-1">Materiales Homologados</p>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* SECCIÓN IZQUIERDA: Catálogo de Materiales */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            
            <h2 className="text-2xl font-extrabold tracking-tight text-[#14181A] mt-3">
Catálogo Homologado            </h2>
            
          </div>

          {/* GRID DE TARJETAS DE PRODUCTOS */}
          <div className="space-y-4">
            {products.map((prod) => {
              const config = LOCAL_PRODUCTS_CONFIG[prod.name] || {
                key: prod.id,
                co2Factor: 1.0,
                imageFallback: prod.image_path || "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
                badgeText: prod.stock > 0 ? "En Stock" : "Pre-Orden",
                category: "Insumo Circular",
                projects: []
              };

              const isSelected = prod.id === selectedProductId;
              const isExpanded = expandedCardId === prod.id;

              return (
                <div
                  key={prod.id}
                  onClick={() => handleProductSelect(prod.id, prod.name)}
                  className={`bg-white border rounded-xl p-5 transition-all duration-300 cursor-pointer shadow-sm hover:border-[#123524]/40 hover:shadow-md ${
                    isSelected ? 'border-[#123524] ring-1 ring-[#123524]/20 bg-[#FCFCFA]' : 'border-[#E7E7E1]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="sm:w-1/3 aspect-[16/10] overflow-hidden rounded-lg border border-[#E7E7E1] bg-[#F7F7F2] flex-shrink-0 relative">
                      <img
                        src={prod.image_path || config.imageFallback}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = config.imageFallback;
                        }}
                      />
                      <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        config.badgeText.includes("Stock") ? 'bg-[#C6E24C] text-[#123524]' : 'bg-amber-600 text-white'
                      }`}>
                        {config.badgeText}
                      </span>
                    </div>

                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#123524] bg-[#E4F5E7] px-2 py-0.5 rounded-full">
                            {config.category}
                          </span>
                          <span className="text-sm font-bold text-[#14181A]">
                            ${prod.price.toFixed(2)}
                            <span className="text-[10px] text-[#96A0A8] font-normal">
                              {" "}USD/{prod.unit === 'galón' ? 'Gal' : 'Ton'}
                            </span>
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#14181A] mt-1">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-[#5B6570] mt-1 leading-relaxed">
                          {prod.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCardId(isExpanded ? null : prod.id);
                          }}
                          className="text-[#123524] hover:text-[#0B2A1B] font-semibold flex items-center gap-1 transition-colors"
                        >
                          Ficha Técnica Comercial {isExpanded ? '↑' : '↓'}
                        </button>
                        <span className="text-[#96A0A8] font-mono">
                          {prod.name.includes("Caucho") ? "Malla: 0.5mm - 2mm" : `Unidad: ${prod.unit}s`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ficha Técnica Comercial */}
                  {isExpanded && (
                    <div className="mt-4 p-4 bg-[#E4F5E7] rounded-lg text-xs text-[#5B6570] border border-[#2E9E5B]/15 space-y-3">
                      <div className="grid grid-cols-2 gap-2 border-b border-[#2E9E5B]/10 pb-2 text-[#14181A]">
                        <div>
                          <strong>Normativa Técnica:</strong> Homologado bajo estándares B2B.
                        </div>
                        <div>
                          <strong>Uso recomendado:</strong> {prod.usage}
                        </div>
                      </div>
                      <div>
                        <strong className="text-[#14181A] block mb-0.5">Ventajas Técnicas:</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          {prod.characteristics.map((char, index) => (
                            <li key={index}>{char}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* POR QUE REVOLINK */}
          <div className="bg-white border border-[#E7E7E1] rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#14181A] uppercase tracking-wide mb-3">
              ¿Por qué RevoLink?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex gap-2.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#9EB93A] flex-shrink-0"></span>
                <div>
                  <p className="font-bold text-revo-ink">Socio Local</p>
                  <p className="text-[#5B6570] mt-0.5">
                    Apoyamos el cumplimiento ambiental y reciclaje en cada país, promoviendo la economía circular.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#2E9E5B] flex-shrink-0"></span>
                <div>
                  <p className="font-bold text-revo-ink">Experiencia Regional</p>
                  <p className="text-[#5B6570] mt-0.5">
                    12 años en LATAM impulsando el reciclaje como parte de una economía circular.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#9EB93A] flex-shrink-0"></span>
                <div>
                  <p className="font-bold text-revo-ink">Enfoque Integral</p>
                  <p className="text-[#5B6570] mt-0.5">
                    Educamos, reciclamos y generamos conciencia ambiental para proteger el planeta.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#2E9E5B] flex-shrink-0"></span>
                <div>
                  <p className="font-bold text-revo-ink">Servicios y Alianzas</p>
                  <p className="text-[#5B6570] mt-0.5">
                    Si eres productor y necesitas cumplir con la ley, te acompañamos en todo el proceso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DERECHA: Consola de Simulación */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E7E7E1] rounded-xl p-5 shadow-sm lg:sticky lg:top-24 space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-[10px] font-bold text-[#96A0A8] uppercase tracking-wider">
                Consola de Demanda Corporativa
              </h3>
              <p className="text-sm font-semibold text-[#14181A] mt-0.5">
                Línea seleccionada:{" "}
                <span className="text-[#2E9E5B]">{selectedProduct?.name || "--"}</span>
              </p>
            </div>

            {/* PASO 1 */}
            <div className={`border border-[#E7E7E1] rounded-lg overflow-hidden transition-all duration-300`}>
              <button
                onClick={() => handleGoToStep(1)}
                className="w-full bg-[#F7F7F2] px-4 py-3 text-left text-xs font-bold text-[#14181A] flex justify-between items-center outline-none"
              >
                <span>01. Aplicación del Proyecto e Insumos</span>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${
                  activeStep === 1 ? 'bg-[#123524] text-white' : 'bg-slate-200 text-[#5B6570]'
                }`}>
                  {activeStep === 1 ? 'Activo' : 'Completado'}
                </span>
              </button>

              {activeStep === 1 && selectedProductConfig && (
                <div className="p-4 space-y-3 bg-white">
                  <div>
                    <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
                      Destino de la Materia Prima
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-lg p-2.5 text-xs font-medium text-[#14181A] focus:border-[#123524] focus:bg-white outline-none transition-all"
                    >
                      {selectedProductConfig.projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>{proj.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedProject && (
                    <div>
                      <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
                        {selectedProject.label}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={dimensionInput}
                          onChange={(e) => setDimensionInput(Math.max(1, parseInt(e.target.value) || 0))}
                          min="1"
                          className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-lg p-2.5 text-xs font-mono font-bold text-[#14181A] focus:border-[#123524] focus:bg-white outline-none transition-all"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-[#96A0A8]">
                          {selectedProject.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-[#5B6570] leading-relaxed bg-[#F7F7F2] p-3 rounded border border-[#E7E7E1] italic">
                    {selectedProject?.info}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNextStep(2)}
                    className="w-full bg-[#123524] hover:bg-[#0B2A1B] text-white font-medium py-2 rounded text-xs tracking-wide uppercase transition-all"
                  >
                    Calcular Métricas ➔
                  </button>
                </div>
              )}
            </div>

            {/* PASO 2 */}
            <div className={`border border-[#E7E7E1] rounded-lg overflow-hidden transition-all duration-300 ${
              maxStep < 2 ? 'opacity-50' : ''
            }`}>
              <button
                disabled={maxStep < 2}
                onClick={() => handleGoToStep(2)}
                className="w-full bg-[#F7F7F2] px-4 py-3 text-left text-xs font-bold flex justify-between items-center outline-none"
              >
                <span className={maxStep < 2 ? 'text-[#96A0A8]' : 'text-[#14181A]'}>02. Presupuesto Estimado e Impacto Ambiental</span>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${
                  activeStep === 2 ? 'bg-[#123524] text-white' : 'bg-slate-200 text-[#5B6570]'
                }`}>
                  {maxStep < 2 ? 'Bloqueado' : activeStep === 2 ? 'Activo' : 'Completado'}
                </span>
              </button>

              {activeStep === 2 && selectedProject && selectedProduct && (
                <div className="p-4 space-y-3 bg-white">
                  <div className="p-3.5 bg-[#F7F7F2] border border-[#E7E7E1] rounded-lg space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#5B6570] font-medium">Volumen Total Requerido:</span>
                      <span className="font-mono font-bold text-[#14181A]">
                        {outputQty} <span className="text-[10px] text-[#96A0A8] font-sans">{selectedProject.unit}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                      <span className="text-[#5B6570] font-medium">Presupuesto Estimado (F.O.B.):</span>
                      <span className="font-mono font-bold text-[#2E9E5B]">
                        ${outputCost.toLocaleString()} <span className="text-[10px] text-[#96A0A8] font-sans">USD</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                      <span className="text-[#5B6570] font-medium">Reducción de Huella Ambiental:</span>
                      <span className="font-mono font-semibold text-[#123524] bg-[#C6E24C] px-2 py-0.5 rounded-full">
                        -{outputCO2} t CO₂e
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNextStep(3)}
                    className="w-full bg-[#123524] hover:bg-[#0B2A1B] text-white font-medium py-2 rounded text-xs tracking-wide uppercase transition-all"
                  >
                    Ver Certificaciones y Garantías ➔
                  </button>
                </div>
              )}
            </div>

            {/* PASO 3 */}
            <div className={`border border-[#E7E7E1] rounded-lg overflow-hidden transition-all duration-300 ${
              maxStep < 3 ? 'opacity-50' : ''
            }`}>
              <button
                disabled={maxStep < 3}
                onClick={() => handleGoToStep(3)}
                className="w-full bg-[#F7F7F2] px-4 py-3 text-left text-xs font-bold flex justify-between items-center outline-none"
              >
                <span className={maxStep < 3 ? 'text-[#96A0A8]' : 'text-[#14181A]'}>03. Sostenibilidad Homologada y Cierre</span>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${
                  activeStep === 3 ? 'bg-[#123524] text-white' : 'bg-slate-200 text-[#5B6570]'
                }`}>
                  {maxStep < 3 ? 'Bloqueado' : 'Activo'}
                </span>
              </button>

              {activeStep === 3 && (
                <div className="p-4 space-y-3 bg-white">
                  <div className="p-3 bg-[#E4F5E7] border border-[#2E9E5B]/15 rounded-lg space-y-2">
                    <h4 className="text-[10px] font-bold text-[#123524] uppercase tracking-wider">
                      Documentación Oficial del Suministro:
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5 text-[10px] text-[#5B6570] font-medium">
                      <div>✓ Certificado Oficial de Destino Final de Residuos Industriales</div>
                      <div>✓ Balance de Emisiones Sostenibles y Mitigación Ambiental</div>
                      <div>✓ Homologación de Sello de Sostenibilidad Corporativa</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-[#123524] hover:bg-[#0B2A1B] text-white font-bold py-3 rounded-lg text-xs tracking-wider uppercase transition-all shadow-sm"
                  >
                    Generar Requerimiento de Cotización B2B
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL FORMAL DE ENVÍO */}
      {isModalOpen && selectedProduct && selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#123524]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7E7E1] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-fadeIn">
            <div className="px-6 py-4 bg-[#F7F7F2] border-b border-[#E7E7E1] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-[#14181A]">
                  Formulario Oficial de Suministro Industrial
                </h3>
                <p className="text-[11px] text-[#5B6570]">
                  Complete los datos institucionales para formalizar la orden comercial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#96A0A8] hover:text-[#14181A] text-xl font-bold transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); enviarWhatsApp(); }} className="p-6 space-y-4">
              <div className="p-3 bg-[#E4F5E7] rounded-lg border border-[#2E9E5B]/15 flex justify-between text-xs text-[#5B6570]">
                <div>
                  Material Requerido:{" "}
                  <span className="font-bold text-[#2E9E5B]">{selectedProduct.name}</span>
                </div>
                <div>
                  Estimado Comercial:{" "}
                  <span className="font-bold font-mono text-[#14181A]">${outputCost.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Empresa S.A.C."
                    className="w-full border border-[#E7E7E1] bg-[#F7F7F2] rounded-md p-2.5 text-xs outline-none focus:border-[#123524] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
                    RUC *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="\d{11}"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    placeholder="20123456789"
                    className="w-full border border-[#E7E7E1] bg-[#F7F7F2] rounded-md p-2.5 text-xs font-mono outline-none focus:border-[#123524] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
                    Nombre de Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ingeniero Encargado"
                    className="w-full border border-[#E7E7E1] bg-[#F7F7F2] rounded-md p-2.5 text-xs outline-none focus:border-[#123524] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
                    Correo Electrónico Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="compras@empresa.pe"
                    className="w-full border border-[#E7E7E1] bg-[#F7F7F2] rounded-md p-2.5 text-xs outline-none focus:border-[#123524] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
                  Dirección de Suministro / Planta Destino *
                </label>
                <input
                  type="text"
                  required
                  value={plantaAddress}
                  onChange={(e) => setPlantaAddress(e.target.value)}
                  placeholder="Zona Industrial, Lima, Perú"
                  className="w-full border border-[#E7E7E1] bg-[#F7F7F2] rounded-md p-2.5 text-xs outline-none focus:border-[#123524] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E7E7E1] rounded-md text-xs font-medium text-[#5B6570] hover:bg-[#F7F7F2] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#123524] hover:bg-[#0B2A1B] text-white rounded-md text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Enviar Requerimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
