import React, { useState, useEffect } from 'react';

export interface Tender {
  id: string;
  proyecto: string;
  contratista: string;
  demanda: number;
  match: number;
  estado: 'cotizar' | 'pendiente' | 'cerrado';
  ubicacion: string;
  fecha_limite: string;
  presupuesto?: string;
  producto_afin?: string;
}

export const Dashboard: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matchmaking');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tenders');
      if (res.ok) {
        const data = await res.json();
        setTenders(data.tenders);
      }
    } catch (error) {
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setTenders(MOCK_TENDERS);
  };

  const handleCotizar = async (tenderId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tender_id: tenderId })
      });
      if (res.ok) {
        setTenders(prev => prev.map(t =>
          t.id === tenderId ? { ...t, estado: 'pendiente' as const } : t
        ));
      }
    } catch (error) {
      setTenders(prev => prev.map(t =>
        t.id === tenderId ? { ...t, estado: 'pendiente' as const } : t
      ));
    }
  };

  const filteredTenders = tenders.filter(t =>
    t.proyecto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contratista.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ubicacion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Tabs */}
      <div className="px-6 max-w-7xl mx-auto w-full">
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
          {[
            { id: 'matchmaking', label: 'MATCHMAKING COMERCIAL', icon: 'handshake' },
            { id: 'inventario', label: 'INVENTARIO Y PRECIOS', icon: 'inventory_2' },
            { id: 'historial', label: 'HISTORIAL DE COTIZACIONES', icon: 'history' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] notranslate" translate="no">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matchmaking Content */}
      {activeTab === 'matchmaking' && (
        <div className="px-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
          {/* Banner */}
          <div className="bg-slate-800 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-[20px] notranslate" translate="no">psychology</span>
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">B2B Supply Matchmaker: Suministro a Constructoras (SEACE)</h2>
                <p className="text-gray-400 text-xs mt-1">Analizamos pliegos técnicos del SEACE para detectar constructoras/contratistas con demanda de materiales circulares y automatizar tu oferta comercial.</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px] notranslate" translate="no">auto_awesome</span>
              Buscar Nuevas con IA
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] notranslate" translate="no">search</span>
              <input
                type="text"
                placeholder="Buscar por proyecto, contratista, ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <select className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:border-emerald-500 outline-none">
              <option>Todos los Productos</option>
              <option>Aceite de Pirólisis</option>
              <option>Caucho Granulado</option>
              <option>Mulch de Caucho</option>
            </select>
            <select className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:border-emerald-500 outline-none">
              <option>Todos los Orígenes</option>
              <option>Lima</option>
              <option>Callao</option>
              <option>Trujillo</option>
            </select>
          </div>

          {/* Tenders Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Proyecto Requerido</th>
                    <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Contratista / Constructora</th>
                    <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Demanda (Tons)</th>
                    <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Producto Afín</th>
                    <th className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Match AI</th>
                    <th className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Acción Comercial</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenders.map((tender) => (
                    <tr key={tender.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-gray-800">{tender.proyecto}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                              <span className="material-symbols-outlined text-[12px] notranslate" translate="no">location_on</span>
                              {tender.ubicacion}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">SEACE</span>
                          </div>
                          <span className="text-[10px] text-gray-400">Publicado: {tender.fecha_limite}</span>
                          {tender.presupuesto && (
                            <span className="text-[10px] text-gray-500">Presupuesto: {tender.presupuesto}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">{tender.contratista}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-800">{tender.demanda.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 ml-1">Tons</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">{tender.producto_afin || 'Caucho Recuperado'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                            tender.match >= 90 ? 'bg-emerald-100 text-emerald-600' :
                            tender.match >= 70 ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-500'
                          }`}>
                            {tender.match}%
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-[16px] notranslate" translate="no">visibility</span>
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-[16px] notranslate" translate="no">delete</span>
                          </button>
                          {tender.estado === 'cotizar' ? (
                            <button
                              onClick={() => handleCotizar(tender.id)}
                              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px] notranslate" translate="no">send</span>
                              Ofrecer Suministro
                            </button>
                          ) : tender.estado === 'pendiente' ? (
                            <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                              <span className="material-symbols-outlined text-[14px] notranslate" translate="no">schedule</span>
                              Pendiente
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
                              <span className="material-symbols-outlined text-[14px] notranslate" translate="no">lock</span>
                              Cerrado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventario Tab */}
      {activeTab === 'inventario' && (
        <div className="px-6 max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-gray-300 notranslate" translate="no">inventory_2</span>
            <h3 className="text-lg font-semibold text-gray-700 mt-3">Inventario y Precios</h3>
            <p className="text-sm text-gray-500 mt-1">Gestión de stock y precios de productos reciclados.</p>
          </div>
        </div>
      )}

      {/* Historial Tab */}
      {activeTab === 'historial' && (
        <div className="px-6 max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-gray-300 notranslate" translate="no">history</span>
            <h3 className="text-lg font-semibold text-gray-700 mt-3">Historial de Cotizaciones</h3>
            <p className="text-sm text-gray-500 mt-1">Registro de propuestas comerciales enviadas.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// MOCK DATA
export const MOCK_TENDERS: Tender[] = [
  {
    id: 'tender-001',
    proyecto: 'Refuerzo de Cimentación de Canalizaciones',
    contratista: 'Constructora Graña y Montero S.A.',
    demanda: 236,
    match: 93,
    estado: 'cotizar',
    ubicacion: 'Trujillo, Perú',
    fecha_limite: '2026-07-11',
    presupuesto: 'S/ 250,000',
    producto_afin: 'Acero Recuperado'
  },
  {
    id: 'tender-002',
    proyecto: 'Hornos Térmicos y Generación - Planta Industrial',
    contratista: 'Consorcio Vial Interoceánico',
    demanda: 574,
    match: 95,
    estado: 'cotizar',
    ubicacion: 'Lima, Perú',
    fecha_limite: '2026-07-11',
    presupuesto: 'USD $120,000',
    producto_afin: 'Aceite de Pirólisis'
  },
  {
    id: 'tender-003',
    proyecto: 'Mejoras de Carpeta de Pavimento - Ciclovías y Parques de Playa',
    contratista: 'Consorcio Vial del Norte',
    demanda: 180,
    match: 88,
    estado: 'cotizar',
    ubicacion: 'Lima, Perú',
    fecha_limite: '2026-07-12',
    presupuesto: 'S/ 180,000',
    producto_afin: 'Caucho Recuperado'
  },
  {
    id: 'tender-004',
    proyecto: 'Construcción de Nuevo Terminal Portuario',
    contratista: 'Cosco Shipping Ports Perú',
    demanda: 420,
    match: 91,
    estado: 'cotizar',
    ubicacion: 'Callao, Perú',
    fecha_limite: '2026-07-13',
    presupuesto: 'USD $350,000',
    producto_afin: 'Acero Recuperado'
  },
  {
    id: 'tender-005',
    proyecto: 'Ampliación de Aeropuerto Internacional',
    contratista: 'Lima Airport Partners',
    demanda: 680,
    match: 87,
    estado: 'cotizar',
    ubicacion: 'Lima, Perú',
    fecha_limite: '2026-07-14',
    presupuesto: 'USD $500,000',
    producto_afin: 'Caucho Recuperado'
  }
];

export default Dashboard;