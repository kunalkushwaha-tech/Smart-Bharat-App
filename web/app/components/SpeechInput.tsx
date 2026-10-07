"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SpeechRecognitionEventLike = Event & { results: { [index: number]: { [index: number]: { transcript: string } } } };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function SpeechInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [onChange, value]);

  useEffect(() => {
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) {
      window.setTimeout(() => setSupported(false), 0);
      return;
    }
    const recognition = new Constructor();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        const currentValue = valueRef.current;
        onChangeRef.current(`${currentValue}${currentValue.trim() ? " " : ""}${transcript}`.trim());
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  return (
    <button type="button" onClick={toggleListening} disabled={!supported} aria-label={supported ? (isListening ? "Stop voice input" : "Start voice input") : "Voice input is not supported"} title={supported ? "Speak in Hindi, Hinglish, or English" : "Voice input is not supported in this browser"} className={`rounded-lg p-2 ${isListening ? "bg-red-600 text-white" : "bg-[#0B1F3A] text-white"} disabled:cursor-not-allowed disabled:opacity-40`}>
      {isListening ? <MicOff size={19} /> : <Mic size={19} />}
    </button>
  );
}
