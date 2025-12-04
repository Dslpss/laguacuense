"use client";

import { useTimes } from "@/hooks/useTimes";
import { useJogos } from "@/hooks/useJogos";
import {
  verificarFaseExiste,
  obterVencedoresQuartas,
  obterVencedoresSemifinais,
  obterCampeao,
} from "@/lib/eliminatorias";
import { calcularClassificacao } from "@/lib/classificacao";
import { Time, ClassificacaoTime } from "@/types";
import { verificarFaseGruposCompleta } from "@/lib/finalizacao-grupos";
import Image from "next/image";
import { Trophy, Users, Target, Award } from "lucide-react";

interface TeamCardProps {
  timeId?: string;
  timeName?: string;
  grupo?: string;
  logoUrl?: string;
  isWinner?: boolean;
  isLoser?: boolean;
  placar?: number;
  compact?: boolean;
}

function TeamCard({
  timeId,
  timeName,
  grupo,
  logoUrl,
  isWinner,
  isLoser,
  placar,
  compact = false,
}: TeamCardProps) {
  if (!timeName) {
    return (
      <div
        className={`flex items-center gap-2 p-2 bg-muted/50 border border-border rounded-lg ${
          compact ? "min-h-[45px]" : "min-h-[50px]"
        }`}>
        <div
          className={`${
            compact ? "w-6 h-6" : "w-8 h-8"
          } bg-muted rounded-full flex items-center justify-center`}>
          <span className="text-xs text-muted-foreground">?</span>
        </div>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">Aguardando...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 border rounded-lg transition-all ${
        compact ? "min-h-[45px]" : "min-h-[50px]"
      } ${
        isWinner
          ? "bg-secondary/20 border-secondary text-secondary-foreground shadow-lg"
          : isLoser
          ? "bg-muted/20 border-muted-foreground/30 text-muted-foreground"
          : "bg-primary/10 border-primary/30 text-foreground hover:border-primary/50"
      }`}>
      <div className={`${compact ? "w-6 h-6" : "w-8 h-8"} relative`}>
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`Logo ${timeName}`}
            width={compact ? 24 : 32}
            height={compact ? 24 : 32}
            className="rounded-full object-cover"
          />
        ) : (
          <div
            className={`${
              compact ? "w-6 h-6" : "w-8 h-8"
            } bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center`}>
            <span
              className={`${
                compact ? "text-xs" : "text-sm"
              } font-bold text-primary-foreground`}>
              {timeName?.charAt(0) || "?"}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium ${compact ? "text-xs" : "text-sm"} truncate`}>
          {timeName}
        </div>
        {grupo && !compact && (
          <div className="text-xs text-muted-foreground">Grupo {grupo}</div>
        )}
      </div>
      {placar !== undefined && (
        <div className={`${compact ? "text-sm" : "text-lg"} font-bold`}>
          {placar}
        </div>
      )}
    </div>
  );
}

interface MatchProps {
  timeA?: string;
  timeB?: string;
  grupoA?: string;
  grupoB?: string;
  logoA?: string;
  logoB?: string;
  placardA?: number;
  placardB?: number;
  finalizado?: boolean;
  vencedor?: string;
  compact?: boolean;
  placeholder?: boolean;
}

function Match({
  timeA,
  timeB,
  grupoA,
  grupoB,
  logoA,
  logoB,
  placardA,
  placardB,
  finalizado,
  vencedor,
  compact = false,
  placeholder = false,
}: MatchProps) {
  const isAWinner = finalizado && vencedor === timeA;
  const isBWinner = finalizado && vencedor === timeB;

  return (
    <div className={`space-y-1 ${compact ? "w-32" : "w-40"}`}>
      <TeamCard
        timeName={timeA}
        grupo={grupoA}
        logoUrl={logoA}
        isWinner={isAWinner}
        isLoser={finalizado && !isAWinner}
        placar={placardA}
        compact={compact}
      />
      <TeamCard
        timeName={timeB}
        grupo={grupoB}
        logoUrl={logoB}
        isWinner={isBWinner}
        isLoser={finalizado && !isBWinner}
        placar={placardB}
        compact={compact}
      />
    </div>
  );
}

export function ChaveamentoPublico() {
  const { times, carregando: carregandoTimes } = useTimes();
  const { jogos, carregando: carregandoJogos } = useJogos();

  if (carregandoTimes || carregandoJogos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando chaveamento...</p>
        </div>
      </div>
    );
  }

  const classificacao = calcularClassificacao(jogos, times);

  // Verificar fases
  const temQuartas = verificarFaseExiste(jogos, "quartas");
  const temSemifinais = verificarFaseExiste(jogos, "semifinal");
  const temFinal = verificarFaseExiste(jogos, "final");

  // Verificar se a fase de grupos está completa
  const faseGruposCompleta = verificarFaseGruposCompleta(jogos);

  // Obter jogos das fases eliminatórias
  const jogosQuartas = jogos.filter((j) => j.fase === "quartas");
  const jogosSemifinais = jogos.filter((j) => j.fase === "semifinal");
  const jogoFinal = jogos.find((j) => j.fase === "final");

  // Função para obter informações do time
  const getTimeInfo = (timeId?: string) => {
    if (!timeId) return { nome: undefined, grupo: undefined, logo: undefined };
    const time = times.find((t) => t.id === timeId);
    const classificacaoTime = classificacao.find((c) => c.timeId === timeId);
    return {
      nome: time?.nome,
      grupo: classificacaoTime?.grupo,
      logo: time?.logoUrl,
    };
  };

  // Função para obter classificados por grupo (para placeholders das quartas)
  const getClassificadosPorGrupo = () => {
    const grupos = ["A", "B", "C", "D"];
    const classificados: { [key: string]: ClassificacaoTime[] } = {};

    grupos.forEach((grupo) => {
      const timesDoGrupo = classificacao
        .filter((time) => time.grupo === grupo)
        .sort((a, b) => {
          if (b.pontos !== a.pontos) return b.pontos - a.pontos;
          if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
          return b.golsMarcados - a.golsMarcados;
        })
        .slice(0, 2); // Primeiros 2 colocados

      classificados[grupo] = timesDoGrupo;
    });

    return classificados;
  };

  const classificadosPorGrupo = getClassificadosPorGrupo();

  let campeao: string | null = null;
  try {
    campeao = obterCampeao(jogos);
  } catch {
    // Final pode estar empatada sem vencedor nos pênaltis definido
    campeao = null;
  }
  const timeInfo = campeao ? getTimeInfo(campeao) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4 rounded-3xl">
      <div className="max-w-7xl mx-auto bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-accent to-accent/80 p-4 rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform">
                <Trophy className="h-12 w-12 text-accent-foreground" />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-secondary rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-secondary to-secondary/80 p-4 rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform">
                <Users className="h-12 w-12 text-secondary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Chaveamento do Campeonato
          </h1>
          <p className="text-green-200 text-lg">
            Acompanhe o caminho até a final
          </p>
          <div className="w-24 h-1 bg-accent mx-auto mt-4"></div>
        </div>

        {/* Aviso sobre mudanças no chaveamento */}
        {!faseGruposCompleta && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-500 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-amber-200 font-semibold text-lg">
                  Chaveamento Ilustrativo
                </h3>
              </div>
              <p className="text-amber-100 leading-relaxed">
                ⚠️ <strong>Atenção:</strong> Este chaveamento pode sofrer
                alterações, pois a fase de grupos ainda não foi concluída. As
                posições e confrontos mostrados são baseados na classificação
                atual e serão definidos oficialmente quando todos os jogos da
                fase de grupos forem finalizados pelo administrador.
              </p>
            </div>
          </div>
        )}

        {/* Grupos */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Fase de Grupos
            </h2>
            <p className="text-gray-300">
              Os 2 primeiros colocados de cada grupo se classificam para as
              quartas de final
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["A", "B", "C", "D"].map((grupo) => {
              const timesDoGrupo = classificacao
                .filter((time) => time.grupo === grupo)
                .sort((a, b) => {
                  if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                  if (b.saldoGols !== a.saldoGols)
                    return b.saldoGols - a.saldoGols;
                  return b.golsMarcados - a.golsMarcados;
                });

              const corGrupo =
                grupo === "A"
                  ? "from-yellow-500 to-yellow-600"
                  : grupo === "B"
                  ? "from-blue-500 to-blue-600"
                  : grupo === "C"
                  ? "from-green-500 to-green-600"
                  : "from-purple-500 to-purple-600";

              return (
                <div
                  key={grupo}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
                  <div
                    className={`bg-gradient-to-r ${corGrupo} text-white text-center py-3 rounded-xl mb-4 shadow-lg`}>
                    <h3 className="text-xl font-bold">Grupo {grupo}</h3>
                  </div>

                  <div className="space-y-3">
                    {timesDoGrupo.map((time, timeIndex) => {
                      const timeCompleto = times.find(
                        (t) => t.id === time.timeId
                      );
                      const isClassificado = timeIndex < 2;

                      return (
                        <div
                          key={`grupo-${grupo}-${time.timeId}-${timeIndex}`}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isClassificado
                              ? "bg-green-900/30 border border-green-500/30 shadow-lg"
                              : "bg-slate-700/30 border border-slate-600/30"
                          }`}>
                          <div className="w-8 h-8 relative">
                            {timeCompleto?.logoUrl ? (
                              <Image
                                src={timeCompleto.logoUrl}
                                alt={`Logo ${time.nomeTime}`}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-primary-foreground">
                                  {time.nomeTime?.charAt(0) || "?"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white">
                                {time.nomeTime}
                              </span>
                              <span className="text-sm text-gray-300">
                                {time.pontos} pts
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {time.vitorias}V {time.empates}E {time.derrotas}D
                              | SG: {time.saldoGols > 0 ? "+" : ""}
                              {time.saldoGols}
                            </div>
                          </div>
                          {isClassificado && (
                            <div className="text-green-400">
                              <Target className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chaveamento das Eliminatórias */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Fase Eliminatória
            </h2>
            <p className="text-gray-300">
              {temQuartas
                ? "Acompanhe os confrontos das eliminatórias"
                : "Chaveamento será definido após a conclusão da fase de grupos"}
            </p>
          </div>
        </div>

        {/* Main Tournament Bracket */}
        <div className="relative overflow-x-auto">
          <div className="min-w-[1000px] relative">
            {/* Tournament Structure */}
            <div className="flex justify-center items-center min-h-[600px] relative">
              {/* Left Side - Quartas */}
              <div className="flex flex-col justify-center space-y-16">
                {/* Quarta 1: 1º A vs 2º B */}
                {(() => {
                  const jogo = jogosQuartas.find(
                    (j) =>
                      (classificadosPorGrupo.A[0] &&
                        j.timeA === classificadosPorGrupo.A[0].timeId &&
                        classificadosPorGrupo.B[1] &&
                        j.timeB === classificadosPorGrupo.B[1].timeId) ||
                      (classificadosPorGrupo.A[0] &&
                        j.timeB === classificadosPorGrupo.A[0].timeId &&
                        classificadosPorGrupo.B[1] &&
                        j.timeA === classificadosPorGrupo.B[1].timeId)
                  );

                  if (jogo) {
                    const timeAInfo = getTimeInfo(jogo.timeA);
                    const timeBInfo = getTimeInfo(jogo.timeB);
                    const vencedor = jogo.finalizado
                      ? (jogo.golsTimeA || 0) > (jogo.golsTimeB || 0)
                        ? jogo.timeA
                        : jogo.timeB
                      : undefined;

                    return (
                      <div key={jogo.id} className="relative">
                        <Match
                          timeA={timeAInfo.nome}
                          timeB={timeBInfo.nome}
                          grupoA={timeAInfo.grupo}
                          grupoB={timeBInfo.grupo}
                          logoA={timeAInfo.logo}
                          logoB={timeBInfo.logo}
                          placardA={jogo.golsTimeA}
                          placardB={jogo.golsTimeB}
                          finalizado={jogo.finalizado}
                          vencedor={vencedor}
                          compact={true}
                        />
                      </div>
                    );
                  } else {
                    // Placeholder para quarta 1
                    const time1 = classificadosPorGrupo.A[0];
                    const time2 = classificadosPorGrupo.B[1];

                    return (
                      <div key="quarta-1-placeholder" className="relative">
                        <Match
                          timeA={time1?.nomeTime || "1º Grupo A"}
                          timeB={time2?.nomeTime || "2º Grupo B"}
                          grupoA="A"
                          grupoB="B"
                          logoA={
                            time1
                              ? times.find((t) => t.id === time1.timeId)
                                  ?.logoUrl
                              : undefined
                          }
                          logoB={
                            time2
                              ? times.find((t) => t.id === time2.timeId)
                                  ?.logoUrl
                              : undefined
                          }
                          placardA={undefined}
                          placardB={undefined}
                          finalizado={false}
                          vencedor={undefined}
                          compact={true}
                          placeholder={!temQuartas}
                        />
                      </div>
                    );
                  }
                })()}

                {/* Quarta 2: 1º C vs 2º D */}
                {(() => {
                  const jogo = jogosQuartas.find(
                    (j) =>
                      (classificadosPorGrupo.C[0] &&
                        j.timeA === classificadosPorGrupo.C[0].timeId &&
                        classificadosPorGrupo.D[1] &&
                        j.timeB === classificadosPorGrupo.D[1].timeId) ||
                      (classificadosPorGrupo.C[0] &&
                        j.timeB === classificadosPorGrupo.C[0].timeId &&
                        classificadosPorGrupo.D[1] &&
                        j.timeA === classificadosPorGrupo.D[1].timeId)
                  );

                  if (jogo) {
                    const timeAInfo = getTimeInfo(jogo.timeA);
                    const timeBInfo = getTimeInfo(jogo.timeB);
                    const vencedor = jogo.finalizado
                      ? (jogo.golsTimeA || 0) > (jogo.golsTimeB || 0)
                        ? jogo.timeA
                        : jogo.timeB
                      : undefined;

                    return (
                      <div key={jogo.id} className="relative">
                        <Match
                          timeA={timeAInfo.nome}
                          timeB={timeBInfo.nome}
                          grupoA={timeAInfo.grupo}
                          grupoB={timeBInfo.grupo}
                          logoA={timeAInfo.logo}
                          logoB={timeBInfo.logo}
                          placardA={jogo.golsTimeA}
                          placardB={jogo.golsTimeB}
                          finalizado={jogo.finalizado}
                          vencedor={vencedor}
                          compact={true}
                        />
                      </div>
                    );
                  } else {
                    // Placeholder para quarta 2
                    const time1 = classificadosPorGrupo.C[0];
                    const time2 = classificadosPorGrupo.D[1];

                    return (
                      <div key="quarta-2-placeholder" className="relative">
                        <Match
                          timeA={time1?.nomeTime || "1º Grupo C"}
                          timeB={time2?.nomeTime || "2º Grupo D"}
                          grupoA="C"
                          grupoB="D"
                          logoA={
                            time1
                              ? times.find((t) => t.id === time1.timeId)
                                  ?.logoUrl
                              : undefined
                          }
                          logoB={
                            time2
                              ? times.find((t) => t.id === time2.timeId)
                                  ?.logoUrl
                              : undefined
                          }
                          placardA={undefined}
                          placardB={undefined}
                          finalizado={false}
                          vencedor={undefined}
                          compact={true}
                          placeholder={!temQuartas}
                        />
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Left Connectors */}
              <div className="relative w-16 h-64 mx-4">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 64 256"
                  preserveAspectRatio="none">
                  <path
                    d="M 0 64 L 32 64 L 32 128 L 64 128"
                    stroke="oklch(0.6 0.15 260)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 0 192 L 32 192 L 32 128"
                    stroke="oklch(0.6 0.15 260)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Left Semifinal */}
              <div className="flex flex-col justify-center">
                {(() => {
                  if (temSemifinais && jogosSemifinais[0]) {
                    const jogo = jogosSemifinais[0];
                    const timeAInfo = getTimeInfo(jogo.timeA);
                    const timeBInfo = getTimeInfo(jogo.timeB);
                    const vencedor = jogo.finalizado
                      ? (jogo.golsTimeA || 0) > (jogo.golsTimeB || 0)
                        ? jogo.timeA
                        : jogo.timeB
                      : undefined;

                    return (
                      <Match
                        timeA={timeAInfo.nome}
                        timeB={timeBInfo.nome}
                        grupoA={timeAInfo.grupo}
                        grupoB={timeBInfo.grupo}
                        logoA={timeAInfo.logo}
                        logoB={timeBInfo.logo}
                        placardA={jogo.golsTimeA}
                        placardB={jogo.golsTimeB}
                        finalizado={jogo.finalizado}
                        vencedor={vencedor}
                        compact={true}
                      />
                    );
                  } else {
                    // Placeholder para semifinal esquerda
                    return (
                      <Match
                        timeA="Vencedor Quarta 1"
                        timeB="Vencedor Quarta 2"
                        grupoA=""
                        grupoB=""
                        logoA={undefined}
                        logoB={undefined}
                        placardA={undefined}
                        placardB={undefined}
                        finalizado={false}
                        vencedor={undefined}
                        compact={true}
                        placeholder={!temSemifinais}
                      />
                    );
                  }
                })()}
              </div>

              {/* Center Connector to Final */}
              <div className="relative w-16 h-32 mx-4">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 64 128"
                  preserveAspectRatio="none">
                  <path
                    d="M 0 64 L 64 64"
                    stroke="oklch(0.7 0.18 140)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Center - Trophy and Champion */}
              <div className="flex flex-col items-center space-y-6">
                {/* Trophy */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-b from-accent to-accent/80 rounded-full flex items-center justify-center shadow-2xl">
                    <Trophy className="h-12 w-12 text-accent-foreground" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent rounded-full opacity-60"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full opacity-60"></div>
                  <div className="absolute -bottom-2 -left-3 w-8 h-8 bg-accent rounded-full opacity-40"></div>
                  <div className="absolute -bottom-2 -right-3 w-8 h-8 bg-accent rounded-full opacity-40"></div>
                </div>

                {/* Champion */}
                {campeao && timeInfo ? (
                  <div className="bg-gradient-to-r from-accent to-accent/80 px-6 py-3 rounded-full shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 relative">
                        {timeInfo.logo ? (
                          <Image
                            src={timeInfo.logo}
                            alt={`Logo ${timeInfo.nome}`}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-accent">
                              {timeInfo.nome?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-accent-foreground font-bold text-lg">
                        CAMPEÃO
                      </div>
                    </div>
                    <div className="text-center text-accent-foreground/90 font-medium mt-1">
                      {timeInfo.nome}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted px-6 py-3 rounded-full">
                    <div className="text-foreground font-bold text-lg">
                      CAMPEÃO
                    </div>
                  </div>
                )}

                {/* Final Match */}
                <div className="mt-4">
                  {(() => {
                    if (temFinal && jogoFinal) {
                      const timeAInfo = getTimeInfo(jogoFinal.timeA);
                      const timeBInfo = getTimeInfo(jogoFinal.timeB);
                      const vencedor = jogoFinal.finalizado
                        ? (jogoFinal.golsTimeA || 0) >
                          (jogoFinal.golsTimeB || 0)
                          ? jogoFinal.timeA
                          : jogoFinal.timeB
                        : undefined;

                      return (
                        <Match
                          timeA={timeAInfo.nome}
                          timeB={timeBInfo.nome}
                          grupoA={timeAInfo.grupo}
                          grupoB={timeBInfo.grupo}
                          logoA={timeAInfo.logo}
                          logoB={timeBInfo.logo}
                          placardA={jogoFinal.golsTimeA}
                          placardB={jogoFinal.golsTimeB}
                          finalizado={jogoFinal.finalizado}
                          vencedor={vencedor}
                        />
                      );
                    } else {
                      // Placeholder para final
                      return (
                        <Match
                          timeA="Vencedor Semifinal 1"
                          timeB="Vencedor Semifinal 2"
                          grupoA=""
                          grupoB=""
                          logoA={undefined}
                          logoB={undefined}
                          placardA={undefined}
                          placardB={undefined}
                          finalizado={false}
                          vencedor={undefined}
                          placeholder={!temFinal}
                        />
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Right Connector from Final */}
              <div className="relative w-16 h-32 mx-4">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 64 128"
                  preserveAspectRatio="none">
                  <path
                    d="M 0 64 L 64 64"
                    stroke="oklch(0.7 0.18 140)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Right Semifinal */}
              <div className="flex flex-col justify-center">
                {(() => {
                  if (temSemifinais && jogosSemifinais[1]) {
                    const jogo = jogosSemifinais[1];
                    const timeAInfo = getTimeInfo(jogo.timeA);
                    const timeBInfo = getTimeInfo(jogo.timeB);
                    const vencedor = jogo.finalizado
                      ? (jogo.golsTimeA || 0) > (jogo.golsTimeB || 0)
                        ? jogo.timeA
                        : jogo.timeB
                      : undefined;

                    return (
                      <Match
                        timeA={timeAInfo.nome}
                        timeB={timeBInfo.nome}
                        grupoA={timeAInfo.grupo}
                        grupoB={timeBInfo.grupo}
                        logoA={timeAInfo.logo}
                        logoB={timeBInfo.logo}
                        placardA={jogo.golsTimeA}
                        placardB={jogo.golsTimeB}
                        finalizado={jogo.finalizado}
                        vencedor={vencedor}
                        compact={true}
                      />
                    );
                  } else {
                    // Placeholder para semifinal direita
                    return (
                      <Match
                        timeA="Vencedor Quarta 3"
                        timeB="Vencedor Quarta 4"
                        grupoA=""
                        grupoB=""
                        logoA={undefined}
                        logoB={undefined}
                        placardA={undefined}
                        placardB={undefined}
                        finalizado={false}
                        vencedor={undefined}
                        compact={true}
                        placeholder={!temSemifinais}
                      />
                    );
                  }
                })()}
              </div>

              {/* Right Connectors */}
              <div className="relative w-16 h-64 mx-4">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 64 256"
                  preserveAspectRatio="none">
                  <path
                    d="M 64 64 L 32 64 L 32 128 L 0 128"
                    stroke="oklch(0.6 0.15 260)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 64 192 L 32 192 L 32 128"
                    stroke="oklch(0.6 0.15 260)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Right Side - Quartas */}
              <div className="flex flex-col justify-center space-y-16">
                {/* Quarta 3: 1º B vs 2º A */}
                {(() => {
                  const jogo = jogosQuartas.find(
                    (j) =>
                      (classificadosPorGrupo.B[0] &&
                        j.timeA === classificadosPorGrupo.B[0].timeId &&
                        classificadosPorGrupo.A[1] &&
                        j.timeB === classificadosPorGrupo.A[1].timeId) ||
                      (classificadosPorGrupo.B[0] &&
                        j.timeB === classificadosPorGrupo.B[0].timeId &&
                        classificadosPorGrupo.A[1] &&
                        j.timeA === classificadosPorGrupo.A[1].timeId)
                  );

                  if (jogo) {
                    const timeAInfo = getTimeInfo(jogo.timeA);
                    const timeBInfo = getTimeInfo(jogo.timeB);
                    const vencedor = jogo.finalizado
                      ? (jogo.golsTimeA || 0) > (jogo.golsTimeB || 0)
                        ? jogo.timeA
                        : jogo.timeB
                      : undefined;

                    return (
                      <div key={jogo.id} className="relative">
                        <Match
                          timeA={timeAInfo.nome}
                          timeB={timeBInfo.nome}
                          grupoA={timeAInfo.grupo}
                          grupoB={timeBInfo.grupo}
                          logoA={timeAInfo.logo}
                          logoB={timeBInfo.logo}
                          placardA={jogo.golsTimeA}
                          placardB={jogo.golsTimeB}
                          finalizado={jogo.finalizado}
                          vencedor={vencedor}
                          compact={true}
                        />
                      </div>
                    );
                  } else {
                    // Placeholder para quarta 3
                    const time1 = classificadosPorGrupo.B[0];
                    const time2 = classificadosPorGrupo.A[1];

                    return (
                      <div key="quarta-3-placeholder" className="relative">
                        <Match
                          timeA={time1?.nomeTime || "1º Grupo B"}
                          timeB={time2?.nomeTime || "2º Grupo A"}
                          grupoA="B"
                          grupoB="A"
                          logoA={
                            time1
                              ? times.find((t) => t.id === time1.timeId)
                                  ?.logoUrl
                              : undefined
                          }
                          logoB={
                            time2
                              ? times.find((t) => t.id === time2.timeId)
                                  ?.logoUrl
                              : undefined
                          }
                          placardA={undefined}
                          placardB={undefined}
                          finalizado={false}
                          vencedor={undefined}
                          compact={true}
                          placeholder={!temQuartas}
                        />
                      </div>
                    );
                  }
                })()}

                {/* Quarta 4: 1º D vs 2º C */}
                {(() => {
                  const jogo = jogosQuartas.find(
                    (j) =>
                      (classificadosPorGrupo.D[0] &&
                        j.timeA === classificadosPorGrupo.D[0].timeId &&
                        classificadosPorGrupo.C[1] &&
                        j.timeB === classificadosPorGrupo.C[1].timeId) ||
                      (classificadosPorGrupo.D[0] &&
                        j.timeB === classificadosPorGrupo.D[0].timeId &&
                        classificadosPorGrupo.C[1] &&
                        j.timeA === classificadosPorGrupo.C[1].timeId)
                  );

                  if (jogo) {
                    const timeAInfo = getTimeInfo(jogo.timeA);
                    const timeBInfo = getTimeInfo(jogo.timeB);
                    const vencedor = jogo.finalizado
                      ? (jogo.golsTimeA || 0) > (jogo.golsTimeB || 0)
                        ? jogo.timeA
                        : jogo.timeB
                      : undefined;

                    return (
                      <div key={jogo.id} className="relative">
                        <Match
                          timeA={timeAInfo.nome}
                          timeB={timeBInfo.nome}
                          grupoA={timeAInfo.grupo}
                          grupoB={timeBInfo.grupo}
                          logoA={timeAInfo.logo}
                          logoB={timeBInfo.logo}
                          placardA={jogo.golsTimeA}
                          placardB={jogo.golsTimeB}
                          finalizado={jogo.finalizado}
                          vencedor={vencedor}
                          compact={true}
                        />
                      </div>
                    );
                  } else {
                    // Placeholder para quarta 4
                    const time1 = classificadosPorGrupo.D[0];
                    const time2 = classificadosPorGrupo.C[1];

                    return (
                      <div key="quarta-4-placeholder" className="relative">
                        <Match
                          timeA={time1?.nomeTime || "1º Grupo D"}
                          timeB={time2?.nomeTime || "2º Grupo C"}
                          grupoA="D"
                          grupoB="C"
                          logoA={
                            time1
                              ? times.find((t) => t.id === time1.timeId)
                                  ?.logoUrl
                              : undefined
                          }
                          logoB={
                            time2
                              ? times.find((t) => t.id === time2.timeId)
                                  ?.logoUrl
                              : undefined
                          }
                          placardA={undefined}
                          placardB={undefined}
                          finalizado={false}
                          vencedor={undefined}
                          compact={true}
                          placeholder={!temQuartas}
                        />
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Groups Section - Referência dos classificados */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <h3 className="text-2xl font-bold text-white text-center mb-6">
            Classificados por Grupo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["A", "B", "C", "D"].map((grupo, index) => {
              const classificados = classificacao
                .filter((t) => t.grupo === grupo)
                .slice(0, 2);
              const colors = [
                "from-accent to-accent/80",
                "from-primary to-primary/80",
                "from-secondary to-secondary/80",
                "from-purple-600 to-purple-700",
              ];

              return (
                <div
                  key={grupo}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4">
                  <div
                    className={`bg-gradient-to-r ${colors[index]} rounded-lg p-3 mb-3 text-center`}>
                    <h4 className="text-lg font-bold text-white">
                      Grupo {grupo}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {classificados.map((time, timeIndex) => {
                      const timeCompleto = times.find(
                        (t) => t.id === time.timeId
                      );
                      return (
                        <div
                          key={`grupo-${grupo}-${time.timeId}-${timeIndex}`}
                          className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 relative">
                            {timeCompleto?.logoUrl ? (
                              <Image
                                src={timeCompleto.logoUrl}
                                alt={`Logo ${time.nomeTime}`}
                                width={20}
                                height={20}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-primary-foreground">
                                  {time.nomeTime?.charAt(0) || "?"}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="flex-1 truncate text-white">
                            {time.nomeTime}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
