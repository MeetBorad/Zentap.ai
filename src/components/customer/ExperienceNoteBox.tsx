"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Globe, RotateCcw, AlertCircle, Loader2 } from "lucide-react";

export interface ExperienceNoteChangePayload {
  text: string;
  lang: string;
}

interface ExperienceNoteBoxProps {
  initialText?: string;
  onNoteChange?: (payload: ExperienceNoteChangePayload) => void;
  accentTextClass?: string;
  innerBgClass?: string;
  innerBorderClass?: string;
  selectedLang?: string;
  onLanguageChange?: (lang: string) => void;
}

const SUPPORTED_LANGS = [
  { code: "en-IN", label: "English", speechCode: "en-IN" },
  { code: "hi-IN", label: "Hindi (Hinglish)", speechCode: "hi-IN" },
  { code: "gu-IN", label: "Gujarati (Gujlish)", speechCode: "gu-IN" },
];

export default function ExperienceNoteBox({
  initialText = "",
  onNoteChange,
  accentTextClass = "text-amber-400",
  innerBgClass = "bg-[#181c24]",
  innerBorderClass = "border-white/5",
  selectedLang: propSelectedLang,
  onLanguageChange,
}: ExperienceNoteBoxProps) {
  const [text, setText] = useState(initialText);
  const [selectedLang, setSelectedLang] = useState(propSelectedLang || "en-IN"); // Default English

  // Sync external language change
  useEffect(() => {
    if (propSelectedLang && propSelectedLang !== selectedLang) {
      setSelectedLang(propSelectedLang);
    }
  }, [propSelectedLang]);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // Translation states
  const [translateToEnglish, setTranslateToEnglish] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [preTranslationText, setPreTranslationText] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const baseTextBeforeSpeechRef = useRef("");

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
      }
    }
  }, []);

  // Emit debounced note:change event (600ms)
  const emitChange = useCallback(
    (newText: string, lang: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const payload: ExperienceNoteChangePayload = { text: newText.trim(), lang };
        if (onNoteChange) onNoteChange(payload);

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("note:change", {
              detail: payload,
            })
          );
        }
      }, 600);
    },
    [onNoteChange]
  );

  // Sync when initial text changes externally
  useEffect(() => {
    if (initialText !== text && !isListening) {
      setText(initialText);
    }
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 500);
    setText(val);
    setPreTranslationText(null);
    setTranslateToEnglish(false);
    emitChange(val, selectedLang);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    emitChange(text, newLang);
  };

  // Web Speech API Recording
  const startListening = () => {
    setSpeechError(null);
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setSpeechError("Voice input is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      baseTextBeforeSpeechRef.current = text ? text.trim() + " " : "";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        const combined = (baseTextBeforeSpeechRef.current + transcript).slice(0, 500);
        setText(combined);
        emitChange(combined, selectedLang);
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] Error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setSpeechError("Microphone permission blocked. Please allow mic access.");
        } else if (event.error === "no-speech") {
          setSpeechError("No speech detected. Please try speaking closer to mic.");
        } else if (event.error === "network") {
          setSpeechError("Network error during speech recognition.");
        } else if (event.error === "audio-capture") {
          setSpeechError("No microphone found on your device.");
        } else {
          setSpeechError(`Voice error: ${event.error || "unknown"}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      setSpeechError("Could not start voice recording. Please type instead.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Translation: "Write in English"
  const handleTranslateToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setTranslateToEnglish(checked);

    if (checked) {
      if (!text.trim()) return;
      setPreTranslationText(text);
      setIsTranslating(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.trim(),
            from: selectedLang,
            to: "en",
          }),
        });

        const data = await res.json();
        if (res.ok && data.text) {
          setText(data.text);
          emitChange(data.text, "en-IN");
        } else {
          setSpeechError(data.error || "Translation failed");
          setTranslateToEnglish(false);
        }
      } catch (err: any) {
        setSpeechError("Could not translate text right now.");
        setTranslateToEnglish(false);
      } finally {
        setIsTranslating(false);
      }
    } else {
      // Revert if unchecked
      if (preTranslationText) {
        setText(preTranslationText);
        emitChange(preTranslationText, selectedLang);
        setPreTranslationText(null);
      }
    }
  };

  const handleUndoTranslation = () => {
    if (preTranslationText) {
      setText(preTranslationText);
      emitChange(preTranslationText, selectedLang);
      setPreTranslationText(null);
      setTranslateToEnglish(false);
    }
  };

  const handleClear = () => {
    if (isListening) stopListening();
    setText("");
    setPreTranslationText(null);
    setTranslateToEnglish(false);
    emitChange("", selectedLang);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header bar: Label, Language Select & Clear button */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold flex items-center gap-1.5">
          <span className="text-base">✍️</span>
          <span>Write about your experience in short</span>
          <span className="text-[10px] font-normal opacity-60">(Optional)</span>
        </label>
        {text && (
          <button
            type="button"
            onClick={handleClear}
            className={`text-[10.5px] font-semibold ${accentTextClass} hover:opacity-80 transition-colors cursor-pointer`}
          >
            Clear
          </button>
        )}
      </div>

      {/* Controls row: Language selection & Voice mic */}
      <div className="flex items-center justify-between gap-2">
        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs">
          <Globe className={`w-3.5 h-3.5 ${accentTextClass} shrink-0`} />
          <select
            value={selectedLang}
            onChange={handleLanguageChange}
            aria-label="Select spoken language"
            className="bg-transparent text-[11px] text-white focus:outline-none cursor-pointer pr-1"
          >
            {SUPPORTED_LANGS.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Speak / Stop Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={!isSpeechSupported}
          aria-label={isListening ? "Stop listening" : "Speak your experience"}
          className={`tactile-btn flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer active:scale-[0.978] ${
            !isSpeechSupported
              ? "opacity-40 cursor-not-allowed bg-zinc-800 border-zinc-700 text-zinc-400"
              : isListening
              ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
          }`}
          title={!isSpeechSupported ? "Voice input not supported in this browser" : undefined}
        >
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className={`w-3.5 h-3.5 ${accentTextClass}`} />
              <span>Speak</span>
            </>
          )}
        </button>
      </div>

      {/* Speech error indicator */}
      {speechError && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/15 border border-rose-500/30 rounded-lg text-[11px] text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="leading-tight">{speechError}</span>
        </div>
      )}

      {/* Textarea with live character counter */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleTextChange}
          rows={3}
          maxLength={500}
          placeholder="Type or speak what you bought, ordered, or experienced — e.g. 'Bought smart business card, fast delivery and very polite owner!'"
          className={`w-full ${innerBgClass} rounded-xl px-3.5 py-2.5 pb-6 text-base sm:text-xs placeholder:opacity-40 border ${innerBorderClass} focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none shadow-inner leading-relaxed`}
        />
        <div className="absolute bottom-2 right-3 flex items-center gap-2 pointer-events-none text-[10px] opacity-50">
          {isListening && (
            <span className="text-rose-400 font-semibold animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Listening...
            </span>
          )}
          <span>{text.length}/500</span>
        </div>
      </div>

      {/* Translation & Undo Bar */}
      <div className="flex items-center justify-between text-xs px-0.5">
        <label className="flex items-center gap-1.5 cursor-pointer select-none opacity-85 hover:opacity-100 transition-opacity">
          <input
            type="checkbox"
            checked={translateToEnglish}
            onChange={handleTranslateToggle}
            disabled={!text.trim() || isTranslating}
            className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-0 cursor-pointer accent-amber-500"
          />
          <span className="text-[11px] font-medium flex items-center gap-1">
            <span>Write in English</span>
            {isTranslating && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
          </span>
        </label>

        {preTranslationText && (
          <button
            type="button"
            onClick={handleUndoTranslation}
            className={`text-[11px] font-semibold ${accentTextClass} hover:opacity-80 flex items-center gap-1 transition-colors cursor-pointer`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo translation</span>
          </button>
        )}
      </div>

      <p className="text-[10px] opacity-55 leading-tight">
        Type or speak in Gujarati, Hindi or English. Review suggestions adapt instantly!
      </p>
    </div>
  );
}

