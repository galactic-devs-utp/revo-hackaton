import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="fixed bottom-[64px] md:bottom-0 left-0 w-full px-margin-mobile md:px-margin-desktop bg-gradient-to-t from-background via-background to-transparent pb-4 pt-12 z-40"
    >
      <div className="md:max-w-3xl md:mx-auto">
        <div className="relative flex items-center bg-surface-container-lowest shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] rounded-lg border border-outline-variant focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all overflow-hidden group">
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-transparent border-none py-4 pl-4 pr-14 font-body-md text-body-md text-on-surface focus:ring-0 placeholder:text-outline-variant focus:outline-none" 
            placeholder="Pregúntale cualquier cosa a Terra..." 
            type="text"
          />
          <button 
            type="submit"
            className="absolute right-2 p-2.5 bg-secondary-container text-on-secondary-container rounded-lg hover:bg-secondary hover:text-on-secondary transition-colors flex items-center justify-center shadow-sm"
          >
            <span 
              className="material-symbols-outlined text-[20px]" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              send
            </span>
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="font-label-sm text-[10px] text-on-surface-variant/60">
            Terra AI puede cometer errores. Verifique la información regulatoria crítica.
          </span>
        </div>
      </div>
    </form>
  );
};
