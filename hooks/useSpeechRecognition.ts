import { useState, useEffect, useRef, useCallback } from 'react';

// Shim for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = (
    onResult: (transcript: string) => void,
    onStart?: () => void,
    onError?: (error: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening until manually stopped
      recognition.interimResults = true; // Show live results
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        if (onStart) {
            onStart();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (onError) {
            onError(event.error);
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map(result => result.transcript)
            .join('');
        onResult(transcript);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser.');
    }
  }, [onResult, onStart, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
};
