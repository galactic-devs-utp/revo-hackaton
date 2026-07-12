import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { supabase } from '../supabaseClient';

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
  correo_contacto?: string;
}

const MOCK_SENT_QUOTES = [
  {
    id: 'COT-SEACE-892',
    proyecto: 'Mejoras de Carpeta de Pavimento - Ciclovías',
    entidad: 'Municipalidad Distrital de San Isidro',
    monto: 'S/. 160,000',
    fecha: '2026-07-05',
    estado: 'En Proceso'
  },
  {
    id: 'COT-SEACE-891',
    proyecto: 'Conservación tramo Chiclayo - Piura NFU',
    entidad: 'PROVIAS NACIONAL (MTC)',
    monto: 'S/. 4,200,000',
    fecha: '2026-07-08',
    estado: 'Pendiente'
  }
];

export const Dashboard: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sentQuotes, setSentQuotes] = useState<any[]>(MOCK_SENT_QUOTES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matchmaking');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States for Add/Edit Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formImage, setFormImage] = useState('');
  const [formUnit, setFormUnit] = useState('Tons');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Error loading products for admin inventory:", err);
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormName(product.name || '');
    setFormPrice(product.price || 0);
    setFormStock(product.stock || 0);
    setFormImage(product.image_path || '');
    setFormUnit(product.unit || 'Tons');
    setFormDescription(product.description || '');
    setIsProductModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice(0);
    setFormStock(0);
    setFormImage('');
    setFormUnit('Tons');
    setFormDescription('');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
      name: formName,
      price: Number(formPrice),
      stock: Number(formStock),
      image_path: formImage,
      unit: formUnit,
      description: formDescription
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productPayload } : p));
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productPayload])
          .select();
        if (error) throw error;
        if (data && data.length > 0) {
          setProducts(prev => [...prev, data[0]]);
        } else {
          fetchProducts();
        }
      }
      setIsProductModalOpen(false);
      alert("Operación completada exitosamente.");
    } catch (err) {
      console.error(err);
      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productPayload } : p));
      } else {
        const mockNew = { id: `prod-${Date.now()}`, ...productPayload };
        setProducts(prev => [...prev, mockNew]);
      }
      setIsProductModalOpen(false);
      alert("Operación completada localmente.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Está seguro que desea eliminar este producto del catálogo?")) return;
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert("Producto eliminado exitosamente.");
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert("Eliminado de la lista local.");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        const mappedTenders: Tender[] = data.map((opp: any) => ({
          id: String(opp.id),
          proyecto: opp.objeto,
          contratista: opp.entidad,
          demanda: Math.round(opp.monto / 10000) || 50,
          match: opp.puntaje_sostenible * 6 + 10,
          estado: opp.estado === 'Adjudicado' ? 'cerrado' : 'cotizar',
          ubicacion: 'Lima, Perú',
          fecha_limite: opp.fecha_publicacion,
          presupuesto: `S/. ${opp.monto.toLocaleString()}`,
          producto_afin: opp.objeto.toLowerCase().includes('asfal') ? 'Mezcla Asfáltica (Caucho)' :
                         opp.objeto.toLowerCase().includes('piso') || opp.objeto.toLowerCase().includes('baldosa') ? 'Pisos de Caucho' :
                         opp.objeto.toLowerCase().includes('aceite') ? 'Aceite de Pirólisis' : 'Acero Reciclado',
          correo_contacto: opp.correo_contacto
        }));
        setTenders(mappedTenders);
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
    const tender = tenders.find(t => t.id === tenderId);
    if (!tender) return;
    
    const confirmMessage = `¿Está seguro que desea enviar la propuesta técnica y económica oficial a "${tender.contratista}"?\n\nObjeto: ${tender.proyecto}\nPresupuesto Estimado B2B: ${tender.presupuesto || 'S/. 0'}`;
    if (!confirm(confirmMessage)) return;

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

    if (tender) {
      const newSentQuote = {
        id: `COT-SEACE-${Math.floor(100 + Math.random() * 900)}`,
        proyecto: tender.proyecto,
        entidad: tender.contratista,
        monto: tender.presupuesto || 'S/. 0',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'Pendiente'
      };
      setSentQuotes(prev => [newSentQuote, ...prev]);
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
            { id: 'aprobaciones', label: 'GESTIÓN DE COTIZACIONES', icon: 'gavel' },
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
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleCotizar(tender.id)}
                                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                              >
                                <span className="material-symbols-outlined text-[13px] notranslate" translate="no">send</span>
                                Ofrecer
                              </button>
                              {tender.correo_contacto && (
                                <a
                                  href={`mailto:${tender.correo_contacto}?subject=Propuesta de Suministro Sostenible - RevoLink&body=Estimados señores de ${tender.contratista},%0D%0A%0D%0ANos ponemos en contacto en relación a su requerimiento de: "${tender.proyecto}".%0D%0A%0D%0AContamos con la disponibilidad de suministrar insumos ecológicos homologados (caucho granulado, acero siderúrgico y combustibles pirolíticos) que otorgan puntaje adicional por cumplimiento del D.S. 024-2021-MINAM.%0D%0A%0D%0AQuedamos atentos a sus comentarios.%0D%0A%0D%0AAtentamente,%0D%0AArea de Suministro B2B - RevoLink`}
                                  className="bg-[#9EB93A] hover:bg-[#86A02E] text-[#123524] px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center justify-center whitespace-nowrap"
                                >
                                  Contactar
                                </a>
                              )}
                            </div>
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

      {/* Gestión de Cotizaciones Tab */}
      {activeTab === 'aprobaciones' && (
        <div className="px-6 max-w-7xl mx-auto w-full">
          <AdminDashboard />
        </div>
      )}

      {/* Inventario Tab */}
      {activeTab === 'inventario' && (
        <div className="px-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-white font-semibold text-sm">Inventario de Productos en Tiempo Real (Supabase)</h2>
              <p className="text-gray-400 text-xs mt-1">
                Administre el catálogo de insumos circulares de RevoLink. Los cambios impactan directamente a la tienda del cliente.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px] notranslate" translate="no">add</span>
              Añadir Producto
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold">
                    <th className="px-6 py-3.5">Imagen</th>
                    <th className="px-6 py-3.5">Nombre del Producto</th>
                    <th className="px-6 py-3.5">Precio B2B</th>
                    <th className="px-6 py-3.5">Stock Disponible</th>
                    <th className="px-6 py-3.5">Unidad</th>
                    <th className="px-6 py-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <img 
                          src={prod.image_path || "https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?auto=format&fit=crop&w=100&q=80"} 
                          alt={prod.name} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-sm">{prod.name}</div>
                        <div className="text-[10px] text-gray-400 max-w-[250px] truncate">{prod.description}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-800 text-sm">
                        S/. {prod.price}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-700">
                        {prod.stock}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{prod.unit}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border border-emerald-500/20"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border border-red-500/10"
                          >
                            Eliminar
                          </button>
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

      {/* Historial Tab */}
      {activeTab === 'historial' && (
        <div className="px-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-white font-semibold text-sm">Historial de Ofertas Comerciales (Enviadas proactivamente al SEACE)</h2>
            <p className="text-gray-400 text-xs mt-1">
              Registro histórico de las propuestas comerciales y de suministro sostenible enviadas a las constructoras contratistas del Estado.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold">
                    <th className="px-6 py-3.5">Código Cotización</th>
                    <th className="px-6 py-3.5">Proyecto Destino</th>
                    <th className="px-6 py-3.5">Entidad Requiriente</th>
                    <th className="px-6 py-3.5">Monto Ofertado</th>
                    <th className="px-6 py-3.5">Fecha de Envío</th>
                    <th className="px-6 py-3.5 text-center">Estado de Oferta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sentQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-800">{quote.id}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">{quote.proyecto}</td>
                      <td className="px-6 py-4 text-gray-600">{quote.entidad}</td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-800">{quote.monto}</td>
                      <td className="px-6 py-4 text-gray-500">{quote.fecha}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          quote.estado === 'Aprobada' ? 'bg-[#E4F5E7] text-[#2E9E5B]' :
                          quote.estado === 'En Proceso' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {quote.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DIALOG MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-fadeIn">
            <div className="bg-[#123524] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-xs uppercase tracking-wider">
                {editingProduct ? 'Editar Insumo Circular' : 'Añadir Nuevo Insumo'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-white/80 hover:text-white flex items-center">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">Nombre del Insumo</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-xl p-3 text-xs text-[#14181A] outline-none focus:border-[#123524] focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">Precio Unitario (S/.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-xl p-3 text-xs text-[#14181A] outline-none focus:border-[#123524] focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">Stock Disponible</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={e => setFormStock(Number(e.target.value))}
                    className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-xl p-3 text-xs text-[#14181A] outline-none focus:border-[#123524] focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value)}
                    className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-xl p-3 text-xs text-[#14181A] outline-none focus:border-[#123524] focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">URL de Imagen</label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={e => setFormImage(e.target.value)}
                    className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-xl p-3 text-xs text-[#14181A] outline-none focus:border-[#123524] focus:bg-white transition-all font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">Descripción de Aplicación</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-xl p-3 text-xs text-[#14181A] outline-none focus:border-[#123524] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 border border-gray-200 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#123524] hover:bg-[#0b2217] text-white py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md"
                >
                  Guardar
                </button>
              </div>
            </form>
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