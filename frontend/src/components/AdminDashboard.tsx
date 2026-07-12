import React, { useState, useEffect } from 'react';

// Mock list of B2B quotes submitted by customers
const INITIAL_QUOTES = [
  {
    id: 'Q-082',
    ticket: '58492',
    empresa: 'Consorcio Vial Piura S.A.C.',
    material: 'Caucho Granulado Fino',
    volumen: '45.2 Tons',
    presupuesto: 'S/. 125,500',
    contacto: '+51 982 122 322',
    estado: 'Pendiente',
    fecha: '2026-07-11'
  },
  {
    id: 'Q-081',
    ticket: '39481',
    empresa: 'Aceros Arequipa S.A.',
    material: 'Acero de Llanta Siderúrgico',
    volumen: '180.0 Tons',
    presupuesto: 'S/. 324,000',
    contacto: '+51 945 889 212',
    estado: 'Aprobado',
    fecha: '2026-07-10'
  },
  {
    id: 'Q-080',
    ticket: '82048',
    empresa: 'UNACEM S.A.A.',
    material: 'Aceite Pirolítico Industrial',
    volumen: '8,500 Gls',
    presupuesto: 'S/. 142,500',
    contacto: '+51 902 443 112',
    estado: 'Despachado',
    fecha: '2026-07-09'
  },
  {
    id: 'Q-079',
    ticket: '19385',
    empresa: 'Constructora San Martín S.A.',
    material: 'Negro de Humo Recuperado (rCB)',
    volumen: '12.5 Tons',
    presupuesto: 'S/. 65,000',
    contacto: '+51 977 432 110',
    estado: 'Pendiente',
    fecha: '2026-07-08'
  }
];

export const AdminDashboard: React.FC = () => {
  const [quotes, setQuotes] = useState<any[]>([]);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/corporate-quotes');
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      } else {
        setQuotes(INITIAL_QUOTES);
      }
    } catch (err) {
      console.error(err);
      setQuotes(INITIAL_QUOTES);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/corporate-quotes/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: newStatus })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.quotes) {
          setQuotes(resData.quotes);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    setQuotes(prev =>
      prev.map(q => q.id === id ? { ...q, estado: newStatus } : q)
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* CABECERA */}
      <div className="bg-white border border-[#E7E7E1] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          
          <h2 className="text-2xl font-extrabold text-[#123524] mt-2 tracking-tight">Consola de Operaciones RevoLink</h2>
          <p className="text-xs text-[#5B6570] mt-0.5">
            Supervise solicitudes de cotización corporativas y controle el flujo de valorización.
          </p>
        </div>
      </div>

      

      {/* DETALLE DE SOLICITUDES DE COTIZACIÓN */}
      <div className="bg-white border border-[#E7E7E1] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E1] bg-[#F7F7F2]">
          <h3 className="font-bold text-sm text-[#14181A]">Solicitudes de Cotización Corporativas</h3>
          <p className="text-[11px] text-[#5B6570]">Control y despacho de requerimientos enviados por clientes.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F7F2] border-b border-[#E7E7E1] text-[#5B6570] font-bold">
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Ticket</th>
                <th className="px-6 py-3.5">Cliente / Empresa</th>
                <th className="px-6 py-3.5">Insumo Requerido</th>
                <th className="px-6 py-3.5">Volumen</th>
                <th className="px-6 py-3.5">Presupuesto</th>
                <th className="px-6 py-3.5">Fecha</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-center">Acciones de Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#14181A]">{quote.id}</td>
                  <td className="px-6 py-4 font-mono text-[#5b6570] font-semibold">{quote.ticket}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#14181A]">{quote.empresa}</div>
                    <div className="text-[10px] text-[#96A0A8]">{quote.contacto}</div>
                  </td>
                  <td className="px-6 py-4 text-[#14181A] font-medium">{quote.material}</td>
                  <td className="px-6 py-4 font-mono text-[#5B6570]">{quote.volumen}</td>
                  <td className="px-6 py-4 font-mono font-bold text-[#14181A]">{quote.presupuesto}</td>
                  <td className="px-6 py-4 text-[#96A0A8]">{quote.fecha}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex font-bold px-2 py-0.5 rounded text-[9px] ${
                      quote.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      quote.estado === 'Aprobado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-slate-100 text-[#5B6570]'
                    }`}>
                      {quote.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1.5">
                      {quote.estado === 'Pendiente' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'Aprobado')}
                            className="bg-[#123524] hover:bg-[#0B2A1B] text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition-all shadow-sm"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'Rechazado')}
                            className="border border-[#E7E7E1] hover:bg-red-50 hover:text-red-700 text-[#5B6570] px-2 py-1 rounded text-[10px] font-bold uppercase transition-all"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {quote.estado === 'Aprobado' && (
                        <button
                          onClick={() => handleUpdateStatus(quote.id, 'Despachado')}
                          className="bg-[#9EB93A] hover:bg-[#86A02E] text-[#123524] px-2 py-1 rounded text-[10px] font-bold uppercase transition-all shadow-sm"
                        >
                          Marcar Despachado
                        </button>
                      )}
                      {quote.estado === 'Despachado' && (
                        <span className="text-[10px] text-[#2E9E5B] font-bold">✓ Entregado</span>
                      )}
                      {quote.estado === 'Rechazado' && (
                        <span className="text-[10px] text-red-600 font-bold">✗ Cancelado</span>
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
  );
};
