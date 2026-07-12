import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ChatMessage } from './components/ChatMessage';
import type { Message } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Dashboard } from './components/Dashboard';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const handleSendMessage = async (text: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error('Error al conectar con el backend');

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
      console.error('Error:', error);
      const assistantMsg: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: 'Lo siento, no he podido establecer conexión con Terra AI. Verifica que el backend esté en ejecución.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (actionType: string) => {
    if (actionType === 'download_certificate') {
      alert('Iniciando descarga del Certificado de Valorización...');
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;

      case 'store':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <span className="material-symbols-outlined text-[64px] text-outline-variant notranslate" translate="no">storefront</span>
              <h2 className="font-headline-md text-headline-md text-on-surface mt-4">Tienda</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Catálogo de productos en construcción</p>
            </div>
          </div>
        );

      case 'terra':
        return (
          <>
            <div className="text-center font-label-sm text-label-sm text-on-surface-variant mt-2 mb-4">
              Hoy, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          </>
        );

      case 'profile':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <span className="material-symbols-outlined text-[64px] text-outline-variant notranslate" translate="no">person</span>
              <h2 className="font-headline-md text-headline-md text-on-surface mt-4">Perfil</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Configuración de usuario en construcción</p>
            </div>
          </div>
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-background font-body-md">
      <Header />

      <main className={`pt-[88px] pb-[180px] px-margin-mobile md:px-margin-desktop min-h-screen flex flex-col gap-gutter ${activeTab === 'terra' ? 'md:max-w-3xl md:mx-auto' : ''}`}>
        {renderContent()}
      </main>

      {activeTab === 'terra' && <ChatInput onSendMessage={handleSendMessage} />}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;