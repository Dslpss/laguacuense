import { useState, useEffect } from "react";
import { obterTimes } from "@/lib/firebase/firestore";
import { Time } from "@/types";

/**
 * Hook para gerenciar dados dos times com atualização em tempo real
 */
export function useTimes() {
  const [times, setTimes] = useState<Time[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = obterTimes((timesData) => {
      setTimes(timesData);
      setCarregando(false);
      setErro(null);
    });

    // Cleanup da subscription quando o componente desmontar
    return () => unsubscribe();
  }, []);

  return { times, carregando, erro };
}
