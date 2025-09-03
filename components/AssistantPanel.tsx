import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { User, Bot, MicIcon, SendIcon, ScreenShareIcon, StopScreenShareIcon, ClipboardIcon } from './Icons';

interface AssistantPanelProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string, withScreenshot?: boolean) => void;
  onStartScreenShare: () => void;
  isSharingScreen: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';

    const Icon = isUser ? User : Bot;
    const iconBg = isUser ? 'bg-gray-600' : 'bg-gradient-to-br from-green-500 to-emerald-600';
    const bubbleBg = isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none';
    
    if (message.role === 'bot' && !message.content.trim()) {
        return null;
    }

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            )}
            <div className={`max-w-lg px-4 py-3 rounded-2xl ${bubbleBg} prose prose-invert prose-sm break-words`}>
                 <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
            </div>
            {isUser && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>}
        </div>
    );
};

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  chatHistory,
  isLoading,
  onSendMessage,
  onStartScreenShare,
  isSharingScreen,
  inputValue,
  onInputChange
}) => {
  const [outputValue, setOutputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSpeechResult = (transcript: string) => {
    onInputChange(transcript);
    setInputError(null); 
  };
  
  const handleSpeechStart = () => {
    window.speechSynthesis.cancel();
    setInputError(null);
  }

  const handleSpeechError = (error: string) => {
    let errorMessage = `Voice error: ${error}.`;
    if (error === 'not-allowed') {
        errorMessage = "Voice error: Microphone access denied. Please allow microphone permissions in your browser settings.";
    }
    setInputError(errorMessage);
    setTimeout(() => setInputError(null), 5000);
  };

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition(handleSpeechResult, handleSpeechStart, handleSpeechError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    }
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim(), isSharingScreen);
    }
  };

  const handleOutputSubmit = () => {
      if (outputValue.trim()) {
          const message = `Please analyze the following data:\n\n\`\`\`\n${outputValue.trim()}\n\`\`\``;
          onSendMessage(message, false);
          setOutputValue('');
      }
  };
  
  const handleInputChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl flex flex-col h-[70vh] overflow-hidden border border-gray-700">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {chatHistory.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        { isLoading && <div className="flex justify-start"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-pulse"><Bot className="w-5 h-5 text-white" /></div></div>}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 bg-gray-800 border-t border-gray-700 space-y-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStartScreenShare}
            className={`flex-shrink-0 p-2 rounded-full transition-colors duration-200 ${
              isSharingScreen 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
            }`}
            title={isSharingScreen ? "Stop Screen Share" : "Start Screen Share"}
            aria-label={isSharingScreen ? "Stop Screen Share" : "Start Screen Share"}
          >
            {isSharingScreen ? <StopScreenShareIcon className="w-5 h-5" /> : <ScreenShareIcon className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChangeEvent}
            placeholder={isListening ? "Listening..." : "Describe an invoice or ask a question..."}
            className="flex-1 w-full bg-gray-700 text-gray-200 placeholder-gray-400 border-transparent rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          {isSupported && (
            <button
                type="button"
                onClick={() => isListening ? stopListening() : startListening()}
                disabled={isLoading}
                className={`flex-shrink-0 p-2 rounded-full transition-colors duration-200 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white mic-listening' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
                title={isListening ? "Stop Listening" : "Use Voice Command"}
                aria-label={isListening ? "Stop Listening" : "Use Voice Command"}
            >
                <MicIcon className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="flex-shrink-0 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            title="Send Message"
            aria-label="Send Message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center gap-3">
            <textarea
                value={outputValue}
                onChange={(e) => setOutputValue(e.target.value)}
                placeholder="Paste transaction data or other text for analysis..."
                className="flex-1 w-full bg-gray-700 text-gray-200 placeholder-gray-400 border-transparent rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={2}
                disabled={isLoading}
            />
            <button
                type="button"
                onClick={handleOutputSubmit}
                disabled={!outputValue.trim() || isLoading}
                className="flex-shrink-0 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                title="Analyze Data"
                aria-label="Analyze Data"
            >
                <ClipboardIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="h-4 text-center text-xs">
            {inputError ? (
                <p className="text-red-400">{inputError}</p>
            ) : isSharingScreen ? (
                <p className="text-green-400">Screen sharing is active. Your next message will include a screenshot.</p>
            ) : null}
        </div>

      </div>
    </div>
  );
};