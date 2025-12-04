import { Jogo, Time } from "@/types";

/**
 * Verifica se todas as quartas de final foram finalizadas
 */
export function verificarQuartasCompletas(jogos: Jogo[]): boolean {
  const quartasFinal = jogos.filter((jogo) => jogo.fase === "quartas");

  if (quartasFinal.length === 0) {
    return false; // Não há quartas de final
  }

  // Todas as quartas devem estar finalizadas
  return quartasFinal.every((jogo) => jogo.finalizado);
}

/**
 * Verifica se todas as semifinais foram finalizadas
 */
export function verificarSemifinaisCompletas(jogos: Jogo[]): boolean {
  const semifinais = jogos.filter((jogo) => jogo.fase === "semifinal");

  if (semifinais.length === 0) {
    return false; // Não há semifinais
  }

  // Todas as semifinais devem estar finalizadas
  return semifinais.every((jogo) => jogo.finalizado);
}

/**
 * Verifica se a final foi finalizada
 */
export function verificarFinalCompleta(jogos: Jogo[]): boolean {
  const final = jogos.filter((jogo) => jogo.fase === "final");

  if (final.length === 0) {
    return false; // Não há final
  }

  // A final deve estar finalizada
  return final.every((jogo) => jogo.finalizado);
}

/**
 * Obtém os vencedores das quartas de final
 */
export function obterVencedoresQuartas(jogos: Jogo[]): string[] {
  const quartasFinal = jogos.filter(
    (jogo) => jogo.fase === "quartas" && jogo.finalizado
  );

  return quartasFinal.map((jogo) => {
    if (jogo.golsTimeA === undefined || jogo.golsTimeB === undefined) {
      throw new Error(`Jogo ${jogo.id} não tem resultado definido`);
    }

    // Primeiro verifica placar no tempo normal
    if (jogo.golsTimeA > jogo.golsTimeB) {
      return jogo.timeA;
    } else if (jogo.golsTimeB > jogo.golsTimeA) {
      return jogo.timeB;
    } else {
      // Empate no tempo normal - verificar pênaltis
      if (
        jogo.penaltisTimeA !== undefined &&
        jogo.penaltisTimeB !== undefined
      ) {
        if (jogo.penaltisTimeA > jogo.penaltisTimeB) {
          return jogo.timeA;
        } else if (jogo.penaltisTimeB > jogo.penaltisTimeA) {
          return jogo.timeB;
        }
      }
      throw new Error(
        `Jogo ${jogo.id} terminou empatado - defina o placar dos pênaltis`
      );
    }
  });
}

/**
 * Obtém os vencedores das semifinais
 */
export function obterVencedoresSemifinais(jogos: Jogo[]): string[] {
  const semifinais = jogos.filter(
    (jogo) => jogo.fase === "semifinal" && jogo.finalizado
  );

  return semifinais.map((jogo) => {
    if (jogo.golsTimeA === undefined || jogo.golsTimeB === undefined) {
      throw new Error(`Jogo ${jogo.id} não tem resultado definido`);
    }

    // Primeiro verifica placar no tempo normal
    if (jogo.golsTimeA > jogo.golsTimeB) {
      return jogo.timeA;
    } else if (jogo.golsTimeB > jogo.golsTimeA) {
      return jogo.timeB;
    } else {
      // Empate no tempo normal - verificar pênaltis
      if (
        jogo.penaltisTimeA !== undefined &&
        jogo.penaltisTimeB !== undefined
      ) {
        if (jogo.penaltisTimeA > jogo.penaltisTimeB) {
          return jogo.timeA;
        } else if (jogo.penaltisTimeB > jogo.penaltisTimeA) {
          return jogo.timeB;
        }
      }
      throw new Error(
        `Jogo ${jogo.id} terminou empatado - defina o placar dos pênaltis`
      );
    }
  });
}

/**
 * Obtém o vencedor da final (campeão)
 */
export function obterCampeao(jogos: Jogo[]): string | null {
  const final = jogos.find((jogo) => jogo.fase === "final" && jogo.finalizado);

  if (!final) {
    return null;
  }

  if (final.golsTimeA === undefined || final.golsTimeB === undefined) {
    throw new Error(`Final não tem resultado definido`);
  }

  if (final.golsTimeA > final.golsTimeB) {
    return final.timeA;
  } else if (final.golsTimeB > final.golsTimeA) {
    return final.timeB;
  } else {
    throw new Error(
      `Final terminou empatada - não é possível determinar campeão`
    );
  }
}

/**
 * Gera os confrontos das semifinais baseado nos vencedores das quartas
 * Semifinal 1: Vencedor (1º A x 2º B) x Vencedor (1º B x 2º A)
 * Semifinal 2: Vencedor (1º C x 2º D) x Vencedor (1º D x 2º C)
 */
export function gerarConfrontosSemifinais(jogos: Jogo[]): {
  jogo1: { time1: string; time2: string };
  jogo2: { time1: string; time2: string };
} | null {
  if (!verificarQuartasCompletas(jogos)) {
    return null;
  }

  const vencedores = obterVencedoresQuartas(jogos);

  if (vencedores.length !== 4) {
    return null;
  }

  // Os vencedores devem estar na ordem dos jogos das quartas
  // jogo1: 1º A x 2º B, jogo2: 1º B x 2º A, jogo3: 1º C x 2º D, jogo4: 1º D x 2º C
  return {
    jogo1: {
      time1: vencedores[0], // Vencedor (1º A x 2º B)
      time2: vencedores[1], // Vencedor (1º B x 2º A)
    },
    jogo2: {
      time1: vencedores[2], // Vencedor (1º C x 2º D)
      time2: vencedores[3], // Vencedor (1º D x 2º C)
    },
  };
}

/**
 * Gera o confronto da final baseado nos vencedores das semifinais
 */
export function gerarConfrontoFinal(jogos: Jogo[]): {
  jogo1: { time1: string; time2: string };
} | null {
  if (!verificarSemifinaisCompletas(jogos)) {
    return null;
  }

  const vencedores = obterVencedoresSemifinais(jogos);

  if (vencedores.length !== 2) {
    return null;
  }

  return {
    jogo1: {
      time1: vencedores[0], // Vencedor Semifinal 1
      time2: vencedores[1], // Vencedor Semifinal 2
    },
  };
}

/**
 * Verifica se já existem jogos de uma determinada fase
 */
export function verificarFaseExiste(
  jogos: Jogo[],
  fase: "quartas" | "semifinal" | "final"
): boolean {
  return jogos.some((jogo) => jogo.fase === fase);
}
