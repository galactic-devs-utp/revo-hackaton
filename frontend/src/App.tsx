import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ChatMessage } from './components/ChatMessage';
import type { Message } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('terra');
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

  const handleSendMessage = (text: string) => {
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

    // Simulate Terra AI response
    setTimeout(() => {
      let replyContent = 'Gracias por escribir. Como asistente de <strong>RevoLink</strong>, estoy aquí para ayudarte con la economía circular y la regulación de NFU.';
      let snippet = undefined;
      let button = undefined;

      const cleanText = text.toLowerCase();
      if (cleanText.includes('certificado') || cleanText.includes('descargar')) {
        replyContent = '¡Por supuesto! Puedes descargar el certificado de valorización directamente aquí. Este documento acredita el ingreso de los neumáticos fuera de uso al sistema de reciclaje autorizado.';
        button = {
          label: 'Descargar Certificado PDF',
          icon: 'download',
          actionType: 'download_certificate'
        };
      } else if (cleanText.includes('norma') || cleanText.includes('ley') || cleanText.includes('malla')) {
        replyContent = 'Nuestros productos de <strong>Caucho Granulado</strong> cumplen con los más altos estándares de calidad y apoyan el cumplimiento normativo ambiental.';
        snippet = {
          title: 'Regulación Ambiental',
          text: 'Las empresas que incorporen materiales reciclados en sus compras públicas o privadas obtienen puntaje adicional en evaluaciones de sostenibilidad y certificaciones verdes.'
        };
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: replyContent,
        lawSnippet: snippet,
        actionButton: button,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleActionClick = (actionType: string) => {
    if (actionType === 'download_certificate') {
      alert('Iniciando descarga del Certificado de Valorización de RevoLink...');
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-background font-body-md">
      <Header />
      
      <main className="pt-[88px] pb-[180px] px-margin-mobile md:px-margin-desktop md:max-w-3xl md:mx-auto min-h-screen flex flex-col gap-gutter">
        <div className="text-center font-label-sm text-label-sm text-on-surface-variant mt-2 mb-4">
          Hoy, 10:42 AM
        </div>

        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            onActionClick={handleActionClick}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start w-full animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-[20px] border border-white/40 shadow-sm text-on-surface rounded-xl rounded-tl-none p-4 max-w-[95%] md:max-w-[85%] flex items-center gap-2">
              <span className="font-label-sm text-on-surface-variant">Terra AI está escribiendo</span>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
      </main>

      <ChatInput onSendMessage={handleSendMessage} />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
