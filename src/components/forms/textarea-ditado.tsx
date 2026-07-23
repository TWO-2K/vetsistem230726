"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return (ctor as (new () => SpeechRecognitionLike) | undefined) ?? null;
}

export function TextareaDitado({
  id,
  name,
  rows,
  defaultValue,
}: {
  id: string;
  name: string;
  rows?: number;
  defaultValue?: string;
}) {
  const [suportado, setSuportado] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [valor, setValor] = useState(defaultValue ?? "");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextoRef = useRef("");

  useEffect(() => {
    setSuportado(getSpeechRecognitionCtor() !== null);
  }, []);

  function alternarDitado() {
    if (gravando) {
      recognitionRef.current?.stop();
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    baseTextoRef.current = valor ? valor + " " : "";

    recognition.onresult = (event) => {
      let transcricaoFinal = "";
      let transcricaoParcial = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultado = event.results[i];
        if (resultado.isFinal) {
          transcricaoFinal += resultado[0].transcript;
        } else {
          transcricaoParcial += resultado[0].transcript;
        }
      }
      if (transcricaoFinal) {
        baseTextoRef.current += transcricaoFinal + " ";
      }
      setValor(baseTextoRef.current + transcricaoParcial);
    };

    recognition.onerror = () => setGravando(false);
    recognition.onend = () => setGravando(false);

    recognitionRef.current = recognition;
    recognition.start();
    setGravando(true);
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Textarea
          id={id}
          name={name}
          rows={rows}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="pr-10"
        />
        {suportado && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={alternarDitado}
            title={gravando ? "Parar ditado" : "Ditar por voz"}
            className={cn(
              "absolute right-1 top-1 h-7 w-7",
              gravando && "text-destructive animate-pulse"
            )}
          >
            {gravando ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
      </div>
      {gravando && (
        <p className="text-xs text-muted-foreground">Ouvindo… fale a prescrição.</p>
      )}
    </div>
  );
}
