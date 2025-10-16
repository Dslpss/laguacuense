import { useEffect, useState } from "react";
import { Jogador } from "@/types";
import { obterJogadores } from "@/lib/firebase/firestore";

export function useJogadores(timeId?: string) {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!timeId) return;
    setCarregando(true);
    const unsub = obterJogadores(timeId, (js) => {
      setJogadores(js);
      setCarregando(false);
    });
    return () => unsub();
  }, [timeId]);

  return { jogadores, carregando };
}
