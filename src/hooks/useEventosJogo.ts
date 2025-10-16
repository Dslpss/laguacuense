import { useEffect, useState } from "react";
import { EventoJogo } from "@/lib/firebase/eventos";
import { obterEventosJogo } from "@/lib/firebase/eventos";

export function useEventosJogo(jogoId?: string) {
  const [eventos, setEventos] = useState<EventoJogo[]>([]);
  useEffect(() => {
    if (!jogoId) return;
    const unsub = obterEventosJogo(jogoId, (evs) => setEventos(evs));
    return () => unsub();
  }, [jogoId]);
  return eventos;
}
