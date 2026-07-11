import React from 'react';

export interface LawSnippet {
  title: string;
  text: string;
}

export interface ActionButton {
  label: string;
  icon: string;
  actionType?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  lawSnippet?: LawSnippet;
  actionButton?: ActionButton;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  onActionClick?: (actionType: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end w-full animate-fadeIn">
        <div className="bg-surface-container-highest text-on-surface rounded-xl rounded-tr-none p-4 max-w-[85%] md:max-w-[75%] shadow-sm">
          <p className="font-body-md text-body-md">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full animate-fadeInLong">
      <div className="bg-white/80 backdrop-blur-[20px] border border-white/40 shadow-[0_12px_40px_-12px_rgba(0,24,16,0.08)] text-on-surface rounded-xl rounded-tl-none p-5 max-w-[95%] md:max-w-[85%] relative overflow-hidden group">
        {/* Terra AI Ambient Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-secondary-container/30 rounded-full blur-2xl pointer-events-none group-hover:bg-secondary-container/40 transition-colors duration-500"></div>
        <div className="relative z-10 flex flex-col gap-sm">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-secondary/10 p-1.5 rounded-full flex items-center justify-center">
              <span 
                className="material-symbols-outlined text-secondary font-headline-md text-headline-md" 
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface">Terra AI</span>
          </div>

          {/* Content */}
          <div 
            className="font-body-md text-body-md text-on-surface"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />

          {/* Law Snippet Card */}
          {message.lawSnippet && (
            <div className="bg-surface-container-lowest/50 border border-outline-variant p-4 rounded-lg my-2 border-l-4 border-l-secondary shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[64px]">gavel</span>
              </div>
              <h4 className="font-label-sm text-label-sm text-secondary mb-2 uppercase tracking-wider">
                {message.lawSnippet.title}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                "{message.lawSnippet.text}"
              </p>
            </div>
          )}

          {/* Call to Action */}
          {message.actionButton && (
            <button 
              onClick={() => onActionClick && onActionClick(message.actionButton?.actionType || '')}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all shadow-md"
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {message.actionButton.icon}
              </span>
              {message.actionButton.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
