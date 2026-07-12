import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ChatMessage } from './components/ChatMessage';
import type { Message } from './components/ChatMessage';
import { ProductsSimulator } from './components/ProductsSimulator';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

interface Opportunity {
  id: number;
  entidad: string;
  objeto: string;
  monto: number;
  fecha_publicacion: string;
  estado: string;
  enlace_seace: string;
  puntaje_sostenible: number;
  viabilidad: string;
  correo_contacto?: string;
}

export const App: React.FC = () => {
  // Start on products tab by default or auth selection
  const [activeTab, setActiveTab] = useState('store');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/opportunities');
        if (res.ok) {
          const data = await res.json();
          setOpportunities(data);
        }
      } catch (err) {
        console.error("Error fetching opportunities:", err);
      }
    };
    fetchOpportunities();
  }, []);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      content: '¿Cómo ayuda este material a cumplir con el D.S. 024-2021-MINAM?',
      timestamp: '10:42 AM'
    },
    {
      id: '2',
      sender: 'assistant',
      content: 'El <strong>Caucho Granulado Malla 40</strong> contribuye directamente a las metas de valorización de NFU (Neumáticos Fuera de Uso) establecidas en el D.S. 024-2021-MINAM.',
      lawSnippet: {
        title: 'Extracto Legal',
        text: 'Los productores de neumáticos están obligados a garantizar la recolección y valorización de los NFU en los porcentajes anuales establecidos. El uso de material granulado reciclado en procesos productivos es reconocido como valorización material.'
      },
      actionButton: {
        label: 'Descargar Certificado',
        icon: 'download',
        actionType: 'download_certificate'
      },
      timestamp: '10:42 AM'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when chat updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Append user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: timeString
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      });
      
      if (!response.ok) {
        throw new Error('Error al conectar con el backend de RAG');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: data.content,
        lawSnippet: data.lawSnippet,
        actionButton: data.actionButton,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      
      const assistantMsg: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: 'Lo siento, no he podido establecer conexión con el asistente SofiA en el servidor. Por favor, verifica que el backend esté en ejecución.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (actionType: string) => {
    if (actionType === 'download_certificate') {
      alert('Iniciando descarga del Certificado de Valorización de RevoLink...');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="pt-[88px] pb-[100px] px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {/* CABECERA DE BIENVENIDA */}
            <div className="bg-white border border-[#E7E7E1] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#123524] tracking-tight">Portal de Contratación Sostenible B2B</h2>
                <p className="text-xs text-[#5B6570] mt-1">
                  Identifique oportunidades del Estado peruano (SEACE) que otorgan puntos adicionales por el uso de materiales de economía circular.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('store')} 
                className="bg-[#123524] hover:bg-[#0B2A1B] text-white py-2.5 px-5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap"
              >
                Simular Suministro ➔
              </button>
            </div>

            {/* INDICADORES DEL PANEL */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E7E7E1] rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F4FAE0] flex items-center justify-center mb-3">
                  <span className="text-[#9EB93A] font-bold text-sm">🏛️</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight">OSCE</p>
                <p className="text-[10px] font-bold text-[#5B6570] uppercase tracking-wide mt-1">Fuente Homologada</p>
              </div>
              <div className="bg-white border border-[#E7E7E1] rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#E4F5E7] flex items-center justify-center mb-3">
                  <span className="text-[#2E9E5B] font-bold text-sm">📈</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight">{opportunities.length}</p>
                <p className="text-[10px] font-bold text-[#5B6570] uppercase tracking-wide mt-1">Licitaciones Activas</p>
              </div>
              <div className="bg-white border border-[#E7E7E1] rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F4FAE0] flex items-center justify-center mb-3">
                  <span className="text-[#9EB93A] font-bold text-sm">⚡</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight">100%</p>
                <p className="text-[10px] font-bold text-[#5B6570] uppercase tracking-wide mt-1">Suministro Asegurado</p>
              </div>
              <div className="bg-white border border-[#E7E7E1] rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#E4F5E7] flex items-center justify-center mb-3">
                  <span className="text-[#2E9E5B] font-bold text-sm">🎖️</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight">+15 PTS</p>
                <p className="text-[10px] font-bold text-[#5B6570] uppercase tracking-wide mt-1">Puntaje Máximo Extra</p>
              </div>
            </div>

            {/* TABLA DE OPORTUNIDADES SEACE */}
            <div className="bg-white border border-[#E7E7E1] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E7E7E1] bg-[#F7F7F2]">
                <h3 className="font-bold text-sm text-[#14181A]">Convocatorias del Estado (Asfalto y Obras Viales)</h3>
                <p className="text-[11px] text-[#5B6570]">Actualizado en tiempo real desde el portal de datos abiertos del SEACE.</p>
              </div>

              {/* TABLE CONTAINER FOR DESKTOP, CARDS FOR MOBILE */}
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs hidden md:table">
                  <thead>
                    <tr className="bg-[#F7F7F2] border-b border-[#E7E7E1] text-[#5B6570] font-bold">
                      <th className="px-6 py-3.5">Entidad Pública</th>
                      <th className="px-6 py-3.5">Objeto del Requerimiento</th>
                      <th className="px-6 py-3.5">Presupuesto</th>
                      <th className="px-6 py-3.5">Bases Ecológicas</th>
                      <th className="px-6 py-3.5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {opportunities.map((opp) => (
                      <tr key={opp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#14181A] max-w-[180px] truncate">{opp.entidad}</td>
                        <td className="px-6 py-4 text-[#5B6570] max-w-[280px] break-words">{opp.objeto}</td>
                        <td className="px-6 py-4 font-mono font-bold text-[#14181A]">S/. {opp.monto.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 bg-[#E4F5E7] text-[#2E9E5B] font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                            +{opp.puntaje_sostenible} Pts
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => setActiveTab('store')}
                              className="bg-[#123524] hover:bg-[#0B2A1B] text-white px-2.5 py-1.5 rounded font-bold uppercase text-[9px] tracking-wide transition-all shadow-sm"
                            >
                              Cotizar
                            </button>
                            {opp.correo_contacto && (
                              <a
                                href={`mailto:${opp.correo_contacto}?subject=Propuesta de Suministro Sostenible - RevoLink&body=Estimados señores de ${opp.entidad},%0D%0A%0D%0ANos ponemos en contacto en relación a su convocatoria pública: "${opp.objeto}".%0D%0A%0D%0AContamos con la disponibilidad de suministrar insumos ecológicos homologados (caucho granulado, acero siderúrgico y combustibles pirolíticos) que otorgan puntaje adicional por cumplimiento del D.S. 024-2021-MINAM.%0D%0A%0D%0AQuedamos atentos a sus comentarios.%0D%0A%0D%0AAtentamente,%0D%0AArea de Suministro B2B - RevoLink`}
                                className="bg-[#9EB93A] hover:bg-[#86A02E] text-[#123524] px-2.5 py-1.5 rounded font-bold uppercase text-[9px] tracking-wide transition-all shadow-sm flex items-center justify-center"
                              >
                                Contactar
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* MOBILE VIEW CARD LIST */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-[#14181A] uppercase tracking-wide truncate max-w-[70%]">{opp.entidad}</span>
                        <span className="bg-[#E4F5E7] text-[#2E9E5B] font-bold px-2 py-0.5 rounded text-[9px] whitespace-nowrap">
                          +{opp.puntaje_sostenible} Pts Extra
                        </span>
                      </div>
                      <p className="text-xs text-[#5B6570] leading-relaxed">{opp.objeto}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-mono font-bold text-xs text-[#14181A]">S/. {opp.monto.toLocaleString()}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setActiveTab('store')}
                            className="bg-[#123524] text-white px-3 py-1.5 rounded font-bold uppercase text-[9px] tracking-wide shadow-sm"
                          >
                            Cotizar
                          </button>
                          {opp.correo_contacto && (
                            <a
                              href={`mailto:${opp.correo_contacto}?subject=Propuesta de Suministro Sostenible - RevoLink&body=Estimados señores de ${opp.entidad},%0D%0A%0D%0ANos ponemos en contacto en relación a su convocatoria pública: "${opp.objeto}".%0D%0A%0D%0AContamos con la disponibilidad de suministrar insumos ecológicos homologados (caucho granulado, acero siderúrgico y combustibles pirolíticos) que otorgan puntaje adicional por cumplimiento del D.S. 024-2021-MINAM.%0D%0A%0D%0AQuedamos atentos a sus comentarios.%0D%0A%0D%0AAtentamente,%0D%0AArea de Suministro B2B - RevoLink`}
                              className="bg-[#9EB93A] text-[#123524] px-3 py-1.5 rounded font-bold uppercase text-[9px] tracking-wide shadow-sm flex items-center justify-center"
                            >
                              Contactar
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="pt-[88px] pb-[100px] px-margin-mobile md:px-margin-desktop md:max-w-3xl md:mx-auto min-h-screen flex flex-col justify-center items-center text-center gap-4 animate-fadeIn">
            <div className="bg-white/80 border border-slate-100 p-8 rounded-2xl shadow-sm max-w-lg">
              <span className="text-4xl">👤</span>
              <h2 className="text-xl font-bold text-[#123524] mt-4 tracking-tight">Perfil de Empresa</h2>
              <p className="text-xs text-[#5B6570] mt-2 font-mono">
                Usuario: <span className="font-bold">{userEmail}</span>
              </p>
              <p className="text-xs text-[#5B6570] mt-1 font-mono">
                ID Comercial: B2B-REVOLINK-8921
              </p>
              <p className="text-xs text-[#5B6570] mt-1 font-mono">
                Rol: Gestor de Adquisiciones de Suministro
              </p>
            </div>
          </div>
        );
      case 'cart':
        return (
          <div className="pt-[88px] pb-[100px] px-margin-mobile md:px-margin-desktop md:max-w-3xl md:mx-auto min-h-screen flex flex-col justify-center items-center text-center gap-4 animate-fadeIn">
            <div className="bg-white/80 border border-slate-100 p-8 rounded-2xl shadow-sm max-w-lg">
              <span className="text-4xl">🛒</span>
              <h2 className="text-xl font-bold text-[#123524] mt-4 tracking-tight">Carrito de Cotizaciones</h2>
              <p className="text-sm text-[#5B6570] mt-2">
                Para formalizar una orden o estimar costos, configure sus requerimientos volumétricos en el simulador B2B.
              </p>
              <button 
                onClick={() => setActiveTab('store')} 
                className="mt-6 bg-[#123524] text-white py-2.5 px-6 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#0B2A1B] transition-colors"
              >
                Volver al Simulador
              </button>
            </div>
          </div>
        );
      case 'admin_dashboard':
        return (
          <div className="pt-[88px] pb-[100px] animate-fadeIn">
            <Dashboard />
          </div>
        );
      case 'store':
      default:
        return (
          <div className="pt-[88px] pb-[100px] animate-fadeIn">
            <ProductsSimulator />
          </div>
        );
    }
  };

  if (!userRole) {
    return (
      <Login 
        onLogin={(role, email) => {
          setUserRole(role);
          setUserEmail(email);
          if (role === 'admin') {
            setActiveTab('admin_dashboard');
          } else {
            setActiveTab('store');
          }
        }} 
      />
    );
  }

  return (
    <div className="bg-[#F7F7F2] min-h-screen text-[#14181A] font-body-md overflow-x-hidden">
      <Header onLogout={() => setUserRole(null)} userRole={userRole} />
      {renderContent()}
      
      {userRole === 'user' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      )}

      {/* FLOATING CHAT WIDGET - Available for Logged In Users */}
      {userRole && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end">
          {/* Chat Window */}
          {isChatOpen && (
            <div className="bg-white/95 backdrop-blur-[15px] border border-[#E7E7E1] w-[calc(100vw-48px)] sm:w-[400px] h-[480px] max-h-[70vh] sm:max-h-[500px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-fadeIn select-none border-l-4 border-l-[#123524]">
              {/* Header */}
              <div className="bg-[#F7F7F2] border-b border-[#E7E7E1] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src="/female_ai_avatar.png" 
                    alt="SofiA Avatar" 
                    className="w-8 h-8 rounded-lg object-cover border border-[#E7E7E1]"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-[#14181A]">SofiA</h3>
                    <p className="text-[9px] text-[#2E9E5B] font-semibold">Online • Soporte Circular</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-[#96A0A8] hover:text-[#14181A] text-sm font-bold flex items-center justify-center p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Message Area */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg) => (
                  <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    onActionClick={handleActionClick}
                  />
                ))}

                {isTyping && (
                  <div className="flex justify-start w-full animate-fadeIn">
                    <div className="bg-white border border-[#E7E7E1] shadow-sm text-on-surface rounded-xl rounded-tl-none p-3.5 max-w-[85%] flex items-center gap-2">
                      <span className="text-[11px] text-[#5B6570]">Escribiendo</span>
                      <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-[#2E9E5B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#2E9E5B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#2E9E5B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area (Custom Styling for Widget) */}
              <div className="border-t border-[#E7E7E1] p-3 bg-white">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('message') as HTMLInputElement;
                    if (input.value.trim()) {
                      handleSendMessage(input.value);
                      input.value = '';
                    }
                  }}
                  className="flex items-center gap-2 bg-[#F7F7F2] border border-[#E7E7E1] rounded-lg p-1 focus-within:border-[#123524] transition-all"
                >
                  <input 
                    name="message"
                    type="text"
                    placeholder="Pregúntale a SofiA..."
                    className="flex-grow bg-transparent border-none py-1.5 px-2.5 text-xs text-[#14181A] focus:outline-none placeholder:text-[#96A0A8]"
                  />
                  <button 
                    type="submit"
                    className="p-1.5 bg-[#123524] text-white rounded-md hover:bg-[#0B2A1B] transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px] notranslate" translate="no">send</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Floating Action Button (FAB) - Square with Avatar */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-white border-2 border-[#123524] w-18 h-18 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-150 relative overflow-hidden group"
            aria-label="Abrir Asistente SofiA"
          >
            {isChatOpen ? (
              <span className="material-symbols-outlined text-[32px] text-[#123524] notranslate" translate="no">close</span>
            ) : (
              <img 
                src="/female_ai_avatar.png" 
                alt="SofiA" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
            )}
            {!isChatOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6E24C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C6E24C] text-[9px] font-bold text-[#123524] justify-center items-center">!</span>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
