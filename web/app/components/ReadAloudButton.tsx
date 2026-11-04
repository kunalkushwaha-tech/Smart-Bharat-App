"use client";

import { useEffect, useState } from "react";

type Language = "en" | "hi" | "mr";

export default function ReadAloudButton({ text, language = "en" }: { text: string; language?: Language }) {
  const languageCode = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSpeaking(false), 0);
    return () => {
      window.clearTimeout(timer);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [text]);

  function toggle() {
    if (!("speechSynthesis" in window) || !text.trim()) return;
    const synthesis = window.speechSynthesis;
    if (synthesis.speaking) {
      synthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    utterance.lang = hasDevanagari ? (language === "mr" ? "mr-IN" : "hi-IN") : "en-IN";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    const preferredLanguage = utterance.lang;
    const voice = synthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith(preferredLanguage.slice(0, 2)));
    if (voice) utterance.voice = voice;
    setSpeaking(true);
    synthesis.speak(utterance);
  }

  return <button type="button" onClick={toggle} className="min-h-11 min-w-11 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold" aria-label={speaking ? "Stop" : "Read aloud"}>{speaking ? "Stop" : "Read aloud"}</button>;
}
