import { useState, useEffect } from "react";
import { obterJogos } from "@/lib/firebase/firestore";
import { Jogo } from "@/types";

/**
 * Hook para gerenciar dados dos jogos com atualização em tempo real
 */
export function useJogos() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = obterJogos((jogosData) => {
      setJogos(jogosData);
      setCarregando(false);
      setErro(null);
    });

    return () => unsubscribe();
  }, []);

  return { jogos, carregando, erro };
}
