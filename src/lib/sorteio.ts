import { Time } from "@/types";

/**
 * Embaralha um array usando o algoritmo Fisher-Yates
 * Baseado na biblioteca shuffle-js
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Divide os times em 4 grupos de forma aleatória
 */
export function dividirTimesEmGrupos(times: Time[]) {
  if (times.length !== 16) {
    throw new Error(
      "É necessário ter exatamente 16 times para formar 4 grupos de 4"
    );
  }

  const timesEmbaralhados = shuffle(times);

  return {
    A: timesEmbaralhados.slice(0, 4),
    B: timesEmbaralhados.slice(4, 8),
    C: timesEmbaralhados.slice(8, 12),
    D: timesEmbaralhados.slice(12, 16),
  };
}

/**
 * Sorteia os confrontos das semifinais
 * 1º A vs 2º B, 1º C vs 2º D (seguindo critério do regulamento)
 */
export function sortearSemifinais(
  primeiroColocados: Time[],
  segundoColocados: Time[]
) {
  const primeiros = shuffle(primeiroColocados);
  const segundos = shuffle(segundoColocados);

  return {
    jogo1: {
      time1: primeiros[0], // 1º do grupo A ou C
      time2: segundos[0], // 2º do grupo B ou D
    },
    jogo2: {
      time1: primeiros[1], // 1º do grupo restante
      time2: segundos[1], // 2º do grupo restante
    },
  };
}
