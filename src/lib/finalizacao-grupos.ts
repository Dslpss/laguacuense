import { Jogo, Time, ClassificacaoTime } from "@/types";
import { calcularClassificacao } from "./classificacao";

/**
 * Verifica se a fase de grupos está completa
 * Para estar completa, todos os jogos da fase de grupos devem estar finalizados
 */
export function verificarFaseGruposCompleta(jogos: Jogo[]): boolean {
  const jogosGrupos = jogos.filter((jogo) => jogo.fase === "grupos");

  if (jogosGrupos.length === 0) {
    return false; // Não há jogos da fase de grupos
  }

  // Verifica se todos os jogos da fase de grupos estão finalizados
  return jogosGrupos.every((jogo) => jogo.finalizado);
}

/**
 * Obtém os times classificados para as semifinais
 * Retorna os 2 melhores de cada grupo (8 times no total)
 */
export function obterClassificados(
  jogos: Jogo[],
  times: Time[]
): { grupo: string; classificados: ClassificacaoTime[] }[] {
  const grupos = ["A", "B", "C", "D"] as const;
  const classificadosPorGrupo: {
    grupo: string;
    classificados: ClassificacaoTime[];
  }[] = [];

  for (const grupo of grupos) {
    // Filtra times do grupo
    const timesDoGrupo = times.filter((time) => time.grupo === grupo);

    if (timesDoGrupo.length === 0) continue;

    // Filtra jogos do grupo
    const jogosDoGrupo = jogos.filter(
      (jogo) =>
        jogo.fase === "grupos" && jogo.grupo === grupo && jogo.finalizado
    );

    // Calcula classificação do grupo
    const classificacaoGrupo = calcularClassificacao(
      jogosDoGrupo,
      timesDoGrupo
    );

    // Pega os 2 melhores (classificados)
    const classificados = classificacaoGrupo.slice(0, 2);

    classificadosPorGrupo.push({
      grupo,
      classificados,
    });
  }

  return classificadosPorGrupo;
}

/**
 * Verifica se há times suficientes classificados para as semifinais
 * Deve haver exatamente 8 times classificados (2 de cada grupo)
 */
export function verificarClassificadosSuficientes(
  jogos: Jogo[],
  times: Time[]
): boolean {
  const classificadosPorGrupo = obterClassificados(jogos, times);

  // Deve haver 4 grupos com 2 classificados cada
  if (classificadosPorGrupo.length !== 4) return false;

  // Cada grupo deve ter exatamente 2 classificados
  return classificadosPorGrupo.every(
    (grupo) => grupo.classificados.length === 2
  );
}

/**
 * Gera os confrontos das quartas de final baseado nos classificados
 * Seguindo a regra:
 * - Quarta 1: 1º A x 2º B
 * - Quarta 2: 1º B x 2º A
 * - Quarta 3: 1º C x 2º D
 * - Quarta 4: 1º D x 2º C
 */
export function gerarConfrontosQuartas(
  jogos: Jogo[],
  times: Time[]
): {
  jogo1: { time1: string; time2: string };
  jogo2: { time1: string; time2: string };
  jogo3: { time1: string; time2: string };
  jogo4: { time1: string; time2: string };
} | null {
  const classificadosPorGrupo = obterClassificados(jogos, times);

  if (!verificarClassificadosSuficientes(jogos, times)) {
    return null;
  }

  // Organiza os classificados por grupo
  const grupoA =
    classificadosPorGrupo.find((g) => g.grupo === "A")?.classificados || [];
  const grupoB =
    classificadosPorGrupo.find((g) => g.grupo === "B")?.classificados || [];
  const grupoC =
    classificadosPorGrupo.find((g) => g.grupo === "C")?.classificados || [];
  const grupoD =
    classificadosPorGrupo.find((g) => g.grupo === "D")?.classificados || [];

  if (
    grupoA.length < 2 ||
    grupoB.length < 2 ||
    grupoC.length < 2 ||
    grupoD.length < 2
  ) {
    return null;
  }

  // Quartas de Final conforme especificado
  return {
    jogo1: {
      time1: grupoA[0].timeId, // 1º do Grupo A
      time2: grupoB[1].timeId, // 2º do Grupo B
    },
    jogo2: {
      time1: grupoB[0].timeId, // 1º do Grupo B
      time2: grupoA[1].timeId, // 2º do Grupo A
    },
    jogo3: {
      time1: grupoC[0].timeId, // 1º do Grupo C
      time2: grupoD[1].timeId, // 2º do Grupo D
    },
    jogo4: {
      time1: grupoD[0].timeId, // 1º do Grupo D
      time2: grupoC[1].timeId, // 2º do Grupo C
    },
  };
}

/**
 * Retorna um resumo dos classificados para exibição
 */
export function obterResumoClassificados(jogos: Jogo[], times: Time[]): string {
  const classificadosPorGrupo = obterClassificados(jogos, times);

  let resumo = "🏆 CLASSIFICADOS PARA AS QUARTAS DE FINAL:\n\n";

  for (const { grupo, classificados } of classificadosPorGrupo) {
    resumo += `Grupo ${grupo}:\n`;
    classificados.forEach((time, index) => {
      const posicao = index === 0 ? "1º" : "2º";
      resumo += `  ${posicao} - ${time.nomeTime} (${time.pontos} pts)\n`;
    });
    resumo += "\n";
  }

  const confrontos = gerarConfrontosQuartas(jogos, times);
  if (confrontos) {
    const timesMap = new Map(times.map((t) => [t.id, t]));
    resumo += "🥊 CONFRONTOS DAS QUARTAS DE FINAL:\n\n";
    resumo += `Quarta 1: ${timesMap.get(confrontos.jogo1.time1)?.nome} vs ${
      timesMap.get(confrontos.jogo1.time2)?.nome
    }\n`;
    resumo += `Quarta 2: ${timesMap.get(confrontos.jogo2.time1)?.nome} vs ${
      timesMap.get(confrontos.jogo2.time2)?.nome
    }\n`;
    resumo += `Quarta 3: ${timesMap.get(confrontos.jogo3.time1)?.nome} vs ${
      timesMap.get(confrontos.jogo3.time2)?.nome
    }\n`;
    resumo += `Quarta 4: ${timesMap.get(confrontos.jogo4.time1)?.nome} vs ${
      timesMap.get(confrontos.jogo4.time2)?.nome
    }\n`;
  }

  return resumo;
}

/**
 * Retorna os classificados organizados por grupo para exibição no modal
 */
export function obterClassificadosPorGrupo(
  jogos: Jogo[],
  times: Time[]
): Record<"A" | "B" | "C" | "D", ClassificacaoTime[]> {
  const classificadosPorGrupo = obterClassificados(jogos, times);

  const resultado: Record<"A" | "B" | "C" | "D", ClassificacaoTime[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
  };

  for (const { grupo, classificados } of classificadosPorGrupo) {
    if (grupo === "A" || grupo === "B" || grupo === "C" || grupo === "D") {
      resultado[grupo] = classificados;
    }
  }

  return resultado;
}
