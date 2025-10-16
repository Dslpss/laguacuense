import { ClassificacaoTime, Jogo, Time } from "@/types";

/**
 * Calcula a classificação dos times seguindo os critérios do Art. 46º
 * 1 - Maior número de pontos
 * 2 - Vitórias
 * 3 - Saldo de gols
 * 4 - Maior número de gols marcados
 * 5 - Menor número de gols sofridos
 * 6 - Derrotas
 * 7 - Cartões vermelhos
 * 8 - Cartões amarelos
 * 9 - Sorteio
 */
export function calcularClassificacao(
  jogos: Jogo[],
  times: Time[]
): ClassificacaoTime[] {
  const classificacao: { [timeId: string]: ClassificacaoTime } = {};

  // Inicializa a classificação para todos os times
  times.forEach((time) => {
    classificacao[time.id] = {
      timeId: time.id,
      nomeTime: time.nome,
      grupo: time.grupo || "A",
      pontos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsMarcados: 0,
      golsSofridos: 0,
      saldoGols: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0,
      jogos: 0,
    };
  });

  // Processa os jogos finalizados
  jogos
    .filter(
      (jogo) =>
        jogo.finalizado &&
        jogo.golsTimeA !== undefined &&
        jogo.golsTimeB !== undefined
    )
    .forEach((jogo) => {
      const timeA = classificacao[jogo.timeA];
      const timeB = classificacao[jogo.timeB];

      if (!timeA || !timeB) return;

      // Atualiza gols
      timeA.golsMarcados += jogo.golsTimeA!;
      timeA.golsSofridos += jogo.golsTimeB!;
      timeB.golsMarcados += jogo.golsTimeB!;
      timeB.golsSofridos += jogo.golsTimeA!;

      // Atualiza cartões
      timeA.cartoesAmarelos += jogo.cartoesAmarelosTimeA || 0;
      timeA.cartoesVermelhos += jogo.cartoesVermelhoTimeA || 0;
      timeB.cartoesAmarelos += jogo.cartoesAmarelosTimeB || 0;
      timeB.cartoesVermelhos += jogo.cartoesVermelhoTimeB || 0;

      // Atualiza jogos
      timeA.jogos++;
      timeB.jogos++;

      // Determina resultado
      if (jogo.golsTimeA! > jogo.golsTimeB!) {
        // Time A venceu
        timeA.vitorias++;
        timeA.pontos += 3;
        timeB.derrotas++;
      } else if (jogo.golsTimeB! > jogo.golsTimeA!) {
        // Time B venceu
        timeB.vitorias++;
        timeB.pontos += 3;
        timeA.derrotas++;
      } else {
        // Empate
        timeA.empates++;
        timeB.empates++;
        timeA.pontos += 1;
        timeB.pontos += 1;
      }
    });

  // Calcula saldo de gols
  Object.values(classificacao).forEach((time) => {
    time.saldoGols = time.golsMarcados - time.golsSofridos;
  });

  // Ordena seguindo os critérios do regulamento
  return Object.values(classificacao).sort((a, b) => {
    // 1 - Maior número de pontos
    if (a.pontos !== b.pontos) return b.pontos - a.pontos;

    // 2 - Vitórias
    if (a.vitorias !== b.vitorias) return b.vitorias - a.vitorias;

    // 3 - Saldo de gols
    if (a.saldoGols !== b.saldoGols) return b.saldoGols - a.saldoGols;

    // 4 - Maior número de gols marcados
    if (a.golsMarcados !== b.golsMarcados)
      return b.golsMarcados - a.golsMarcados;

    // 5 - Menor número de gols sofridos
    if (a.golsSofridos !== b.golsSofridos)
      return a.golsSofridos - b.golsSofridos;

    // 6 - Derrotas (menor número)
    if (a.derrotas !== b.derrotas) return a.derrotas - b.derrotas;

    // 7 - Cartões vermelhos (menor número)
    if (a.cartoesVermelhos !== b.cartoesVermelhos)
      return a.cartoesVermelhos - b.cartoesVermelhos;

    // 8 - Cartões amarelos (menor número)
    if (a.cartoesAmarelos !== b.cartoesAmarelos)
      return a.cartoesAmarelos - b.cartoesAmarelos;

    // 9 - Sorteio (ordem alfabética como fallback)
    return a.nomeTime.localeCompare(b.nomeTime);
  });
}

/**
 * Agrupa a classificação por grupos
 */
export function agruparClassificacaoPorGrupo(
  classificacao: ClassificacaoTime[]
) {
  return classificacao.reduce((grupos, time) => {
    if (!grupos[time.grupo]) {
      grupos[time.grupo] = [];
    }
    grupos[time.grupo].push(time);
    return grupos;
  }, {} as { [grupo: string]: ClassificacaoTime[] });
}

/**
 * Obtém os dois melhores de cada grupo para as semifinais
 */
export function obterClassificadosParaSemifinais(
  classificacao: ClassificacaoTime[]
) {
  const grupos = agruparClassificacaoPorGrupo(classificacao);

  const primeiros: ClassificacaoTime[] = [];
  const segundos: ClassificacaoTime[] = [];

  ["A", "B", "C", "D"].forEach((grupo) => {
    const timesDoGrupo = grupos[grupo] || [];
    if (timesDoGrupo.length >= 2) {
      primeiros.push(timesDoGrupo[0]);
      segundos.push(timesDoGrupo[1]);
    }
  });

  return { primeiros, segundos };
}
