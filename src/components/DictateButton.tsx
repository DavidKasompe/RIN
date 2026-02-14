'use client';

import { useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface DictateButtonProps {
  onText: (text: string) => void;
  disabled?: boolean;
}

export default function DictateButton({ onText, disabled }: DictateButtonProps) {
  const {
    listening,
    transcript,
    supported,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();

  // Store onText in a ref to avoid re-triggering the effect
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  // Only push transcript to parent while actively listening
  const prevTranscriptRef = useRef('');
  useEffect(() => {
    if (listening && transcript && transcript !== prevTranscriptRef.current) {
      prevTranscriptRef.current = transcript;
      onTextRef.current(transcript);
    }
  }, [listening, transcript]);

  // When listening stops, clear internal state so user can edit freely
  const wasListeningRef = useRef(false);
  useEffect(() => {
    if (wasListeningRef.current && !listening) {
      // Dictation just stopped — clear refs so we don't interfere
      prevTranscriptRef.current = '';
      clearTranscript();
    }
    wasListeningRef.current = listening;
  }, [listening, clearTranscript]);

  if (!supported) return null;

  return (
    <div className="relative">
      <button
        onClick={listening ? stopListening : startListening}
        disabled={disabled}
        className={`
          w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all
          ${listening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100'
          }
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
        `}
        title={listening ? 'Stop listening' : 'Dictate'}
        type="button"
      >
        {listening ? (
          /* MicOff icon */
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5m14 0v4a7 7 0 01-1.5 4.33M12 19a7 7 0 01-7-7V9m3 10h8m-4 0v3" />
            <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeWidth={2} />
          </svg>
        ) : (
          /* Mic icon */
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
          </svg>
        )}
      </button>

      {/* Listening pulse ring */}
      {listening && (
        <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-50" />
      )}

      {/* "Listening..." badge */}
      {listening && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full shadow-lg animate-pulse">
          🎙 Listening...
        </div>
      )}
    </div>
  );
}
