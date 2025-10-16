import { useState, useEffect } from "react";
import { calcularClassificacao } from "@/lib/classificacao";
import { useJogos } from "./useJogos";
import { useTimes } from "./useTimes";
import { ClassificacaoTime } from "@/types";

/**
 * Hook para calcular e gerenciar a classificação em tempo real
 */
export function useClassificacao() {
  const { jogos, carregando: carregandoJogos } = useJogos();
  const { times, carregando: carregandoTimes } = useTimes();
  const [classificacao, setClassificacao] = useState<ClassificacaoTime[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!carregandoJogos && !carregandoTimes && times.length > 0) {
      const novaClassificacao = calcularClassificacao(jogos, times);
      setClassificacao(novaClassificacao);
      setCarregando(false);
    }
  }, [jogos, times, carregandoJogos, carregandoTimes]);

  return { classificacao, carregando };
}
