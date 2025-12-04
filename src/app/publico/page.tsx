"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ListaTimesPublica } from "@/components/tournament/ListaTimesPublica";
import { TabelaClassificacao } from "@/components/tournament/TabelaClassificacao";
import { ChaveamentoPublico } from "@/components/tournament/ChaveamentoPublico";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTimes } from "@/hooks/useTimes";
import {
  Trophy,
  Users,
  Calendar,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useJogos } from "@/hooks/useJogos";
import { useJogadoresPorIds } from "@/hooks/useJogadoresPorIds";

import { useEffect } from "react";
import { obterEventosJogo } from "@/lib/firebase/eventos";

export default function PaginaPublica() {
  const [abaSelecionada, setAbaSelecionada] = useState("times");
  const [regulamentoAberto, setRegulamentoAberto] = useState(false);
  const { times } = useTimes();
  const { jogos, carregando: carregandoJogos } = useJogos();
  const timesMap: Record<string, import("@/types").Time> = times.reduce(
    (acc, t) => {
      acc[t.id] = t;
      return acc;
    },
    {} as Record<string, import("@/types").Time>
  );

  // Estado para expand/collapse das seções de fase
  const [secaoExpandida, setSecaoExpandida] = useState<Record<string, boolean>>(
    {
      final: true,
      semifinal: true,
      quartas: true,
      grupos: true,
    }
  );

  // Adicionar estado de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const PAGE_SIZE = 6;

  // Estado para eventos de todos os jogos
  const [eventosJogos, setEventosJogos] = useState<
    Record<string, import("@/lib/firebase/eventos").EventoJogo[]>
  >({});

  // Estado para todos os gols de todos os jogos
  const [golsJogos, setGolsJogos] = useState<
    Array<{ jogadorId: string; timeId: string }>
  >([]);
  // Expand/collapse de gols por jogo (público)
  const [golsExpandidoPorJogo, setGolsExpandidoPorJogo] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const unsubList: (() => void)[] = [];
    let todosGols: Array<{ jogadorId: string; timeId: string }> = [];
    jogos.forEach((jogo) => {
      const unsub = obterEventosJogo(jogo.id, (evs) => {
        setEventosJogos((prev) => ({ ...prev, [jogo.id]: evs }));
        // Atualiza lista de gols global
        const gols = evs.filter((ev) => ev.tipo === "gol");
        todosGols = [
          ...todosGols,
          ...gols.map((g) => ({ jogadorId: g.jogadorId, timeId: g.timeId })),
        ];
        setGolsJogos(todosGols);
      });
      unsubList.push(unsub);
    });
    return () => {
      unsubList.forEach((unsub) => unsub());
    };
  }, [jogos]);

  // Garantir que a página atual seja válida quando a quantidade de jogos mudar
  useEffect(() => {
    const total = Math.max(1, Math.ceil(jogos.length / PAGE_SIZE));
    if (paginaAtual > total) {
      setPaginaAtual(total);
    }
  }, [jogos.length]);

  // Buscar nomes dos jogadores de todos os gols
  const jogadorIds = golsJogos.map((g) => g.jogadorId);
  const timeIds = golsJogos.map((g) => g.timeId);
  const jogadoresMap = useJogadoresPorIds(jogadorIds, timeIds);

  // Variáveis de paginação calculadas fora do JSX
  const totalPaginas = Math.max(1, Math.ceil(jogos.length / PAGE_SIZE));
  const inicio = (paginaAtual - 1) * PAGE_SIZE;
  const jogosVisiveis = jogos.slice(inicio, inicio + PAGE_SIZE);

  // Agrupar jogos por fase
  const jogosPorFase = useMemo(() => {
    const grupos: Record<string, typeof jogos> = {
      final: [],
      semifinal: [],
      quartas: [],
      grupos: [],
    };
    jogos.forEach((jogo) => {
      if (jogo.fase === "final") grupos.final.push(jogo);
      else if (jogo.fase === "semifinal") grupos.semifinal.push(jogo);
      else if (jogo.fase === "quartas") grupos.quartas.push(jogo);
      else grupos.grupos.push(jogo);
    });
    return grupos;
  }, [jogos]);

  // Verificar se uma fase está concluída (todos os jogos finalizados)
  const fasesConcluidas = useMemo(() => {
    return {
      final:
        jogosPorFase.final.length > 0 &&
        jogosPorFase.final.every((j) => j.finalizado),
      semifinal:
        jogosPorFase.semifinal.length > 0 &&
        jogosPorFase.semifinal.every((j) => j.finalizado),
      quartas:
        jogosPorFase.quartas.length > 0 &&
        jogosPorFase.quartas.every((j) => j.finalizado),
      grupos:
        jogosPorFase.grupos.length > 0 &&
        jogosPorFase.grupos.every((j) => j.finalizado),
    };
  }, [jogosPorFase]);

  const faseConcluida = (fase: string) => {
    return fasesConcluidas[fase as keyof typeof fasesConcluidas] ?? false;
  };

  // Identificar a fase atual (primeira fase não concluída com jogos)
  const faseAtual = useMemo(() => {
    if (jogosPorFase.final.length > 0 && !fasesConcluidas.final) return "final";
    if (jogosPorFase.semifinal.length > 0 && !fasesConcluidas.semifinal)
      return "semifinal";
    if (jogosPorFase.quartas.length > 0 && !fasesConcluidas.quartas)
      return "quartas";
    if (jogosPorFase.grupos.length > 0 && !fasesConcluidas.grupos)
      return "grupos";
    // Se todas estão concluídas, mostrar final
    if (jogosPorFase.final.length > 0) return "final";
    if (jogosPorFase.semifinal.length > 0) return "semifinal";
    if (jogosPorFase.quartas.length > 0) return "quartas";
    return "grupos";
  }, [jogosPorFase, fasesConcluidas]);

  // Função para toggle de seção
  const toggleSecao = (fase: string) => {
    setSecaoExpandida((prev) => ({ ...prev, [fase]: !prev[fase] }));
  };

  // Função para renderizar card de jogo
  const renderCardJogo = (jogo: (typeof jogos)[0]) => {
    const timeA = timesMap[jogo.timeA];
    const timeB = timesMap[jogo.timeB];
    const golsA = jogo.golsTimeA ?? 0;
    const golsB = jogo.golsTimeB ?? 0;
    const penaltisA = jogo.penaltisTimeA;
    const penaltisB = jogo.penaltisTimeB;
    const temPenaltis = penaltisA !== undefined && penaltisB !== undefined;
    const faseEliminatoria =
      jogo.fase === "quartas" ||
      jogo.fase === "semifinal" ||
      jogo.fase === "final";

    let vencedor = null as string | null;
    if (jogo.finalizado) {
      if (golsA > golsB) {
        vencedor = timeA?.nome ?? null;
      } else if (golsB > golsA) {
        vencedor = timeB?.nome ?? null;
      } else if (faseEliminatoria && temPenaltis) {
        // Empate no tempo normal, verificar pênaltis
        if (penaltisA > penaltisB) vencedor = timeA?.nome ?? null;
        else if (penaltisB > penaltisA) vencedor = timeB?.nome ?? null;
      } else {
        vencedor = "Empate";
      }
    }
    const eventos = eventosJogos[jogo.id] || [];
    const gols = eventos.filter((ev) => ev.tipo === "gol");

    return (
      <div
        key={jogo.id}
        className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl p-4 pl-6 sm:p-6 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-blue-200 font-semibold">
            {jogo.fase === "grupos"
              ? `Grupo ${jogo.grupo}`
              : jogo.fase.charAt(0).toUpperCase() + jogo.fase.slice(1)}
          </span>
          <span className="text-xs text-blue-400">
            {jogo.dataJogo?.toDate?.()?.toLocaleString?.("pt-BR")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-3">
          <div className="flex-1 basis-0 min-w-0 flex flex-col items-center">
            <span className="inline-block max-w-[130px] sm:max-w-none text-center text-sm sm:text-lg font-bold text-blue-100 whitespace-normal sm:truncate break-words">
              {timeA?.nome ?? "Time A"}
            </span>
            {timeA?.logoUrl && (
              <Image
                src={timeA.logoUrl}
                alt={timeA.nome}
                width={48}
                height={48}
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover mt-2"
              />
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-lg sm:text-2xl font-black text-white">
              {golsA} <span className="text-blue-400">x</span> {golsB}
            </span>
            {/* Placar de pênaltis - destaque quando decidido nos pênaltis */}
            {jogo.finalizado && temPenaltis && golsA === golsB && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-amber-400 font-bold mt-1 flex items-center gap-1">
                  <span className="text-amber-500">⚽</span>
                  Pênaltis: {penaltisA} x {penaltisB}
                </span>
              </div>
            )}
            {jogo.finalizado && (
              <span
                className={`mt-2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                  vencedor === "Empate"
                    ? "bg-gray-700 text-gray-200"
                    : temPenaltis && golsA === golsB
                    ? "bg-amber-600 text-white"
                    : "bg-blue-700 text-white"
                }`}>
                {vencedor === "Empate"
                  ? "Empate"
                  : temPenaltis && golsA === golsB
                  ? `🏆 ${vencedor} (pên.)`
                  : `Vencedor: ${vencedor}`}
              </span>
            )}
            {!jogo.finalizado && (
              <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-600/50 text-yellow-100">
                A disputar
              </span>
            )}
            {/* Gols marcados */}
            {gols.length > 0 && (
              <div className="mt-2 text-xs text-blue-200">
                <div className="flex items-center justify-center gap-2 font-bold">
                  <span>Gols marcados</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-blue-200 hover:text-white hover:bg-blue-800/40 border border-blue-800/30"
                    onClick={() =>
                      setGolsExpandidoPorJogo((prev) => ({
                        ...prev,
                        [jogo.id]: !prev[jogo.id],
                      }))
                    }>
                    {golsExpandidoPorJogo[jogo.id] ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
                {golsExpandidoPorJogo[jogo.id] && (
                  <div className="absolute inset-0 z-10 p-6">
                    <div className="bg-blue-950/90 backdrop-blur rounded-lg p-3 border border-blue-800/40 shadow-lg h-full flex flex-col">
                      <div className="flex items-center justify-between font-bold text-blue-100 mb-2">
                        <span className="text-xs">Gols marcados</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-blue-200 hover:text-white hover:bg-blue-800/40 border border-blue-800/30"
                          onClick={() =>
                            setGolsExpandidoPorJogo((prev) => ({
                              ...prev,
                              [jogo.id]: false,
                            }))
                          }>
                          Fechar
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-1">
                        <ul className="space-y-1 text-center text-xs text-blue-100">
                          {gols.map((gol) => (
                            <li key={gol.id}>
                              <span className="font-semibold">
                                {gol.timeId === timeA?.id
                                  ? timeA?.nome
                                  : timeB?.nome}
                              </span>{" "}
                              - Jogador:{" "}
                              <span className="font-bold">
                                {jogadoresMap[gol.jogadorId]?.nome ??
                                  gol.jogadorId}
                              </span>
                              {gol.minuto !== undefined && (
                                <>( {gol.minuto}&apos;)</>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 basis-0 min-w-0 flex flex-col items-center">
            <span className="inline-block max-w-[130px] sm:max-w-none text-center text-sm sm:text-lg font-bold text-blue-100 whitespace-normal sm:truncate break-words">
              {timeB?.nome ?? "Time B"}
            </span>
            {timeB?.logoUrl && (
              <Image
                src={timeB.logoUrl}
                alt={timeB.nome}
                width={48}
                height={48}
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover mt-2"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header e título fora do SVG */}
      <div className="relative container mx-auto py-4 px-2 sm:py-8 sm:px-4 md:py-12 md:px-8 lg:px-16 xl:px-24">
        <div className="text-center mb-6 sm:mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 sm:p-4 rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform">
                <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-green-700 p-2 sm:p-4 rounded-2xl shadow-2xl transform group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Título com gradiente premium */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-black mb-4 sm:mb-6 leading-tight flex flex-col items-center justify-center">
            <span className="flex items-center justify-center gap-1 sm:gap-2 drop-shadow-2xl whitespace-nowrap sm:whitespace-normal">
              <span className="flex-shrink-0 text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl text-black">
                ⚽
              </span>
              <span className="bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent">
                Campeonato Lagoacuense
              </span>
            </span>
            <span className="text-sm sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl bg-gradient-to-r from-green-300 via-green-100 to-green-300 bg-clip-text text-transparent">
              de Futebol 2025
            </span>
          </h1>

          <p className="text-base sm:text-xl md:text-xl lg:text-2xl xl:text-2xl text-green-100 font-light mb-6 sm:mb-10 max-w-2xl mx-auto">
            Acompanhe os times, grupos e classificações do maior torneio da
            região
          </p>

          {/* Cards de informações premium */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 sm:px-6 py-3 hover:bg-white/20 transition-all shadow-xl hover:shadow-2xl">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-300" />
                <div className="text-left">
                  <p className="text-xs text-green-200 font-medium">
                    Data de Início
                  </p>
                  <p className="text-sm sm:text-base text-white font-bold">
                    27/09/2025 às 15:30
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 sm:px-6 py-3 hover:bg-white/20 transition-all shadow-xl hover:shadow-2xl">
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-yellow-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-xs text-yellow-200 font-medium">Formato</p>
                  <p className="text-sm sm:text-base text-white font-bold">
                    16 equipes em 4 grupos
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 sm:px-6 py-3 hover:bg-white/20 transition-all shadow-xl hover:shadow-2xl">
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-xs text-blue-200 font-medium">
                    Inscrições
                  </p>
                  <p className="text-sm sm:text-base text-white font-bold">
                    {times.length}/16 times
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de regulamento premium */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <Button
              size="lg"
              onClick={() => setRegulamentoAberto(true)}
              className="h-10 sm:h-14 px-4 sm:px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-2xl hover:shadow-green-500/50 transition-all border-2 border-green-400/30 hover:scale-105 w-full sm:w-auto">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              <span className="text-sm sm:text-lg font-bold">
                Ver Regulamento Completo
              </span>
            </Button>
          </div>
        </div>

        {/* Navegação por abas premium */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
            <Button
              variant={abaSelecionada === "times" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("times")}
              className={
                abaSelecionada === "times"
                  ? "h-10 sm:h-12 px-3 sm:px-6 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl"
                  : "h-10 sm:h-12 px-3 sm:px-6 text-white hover:bg-white/10"
              }>
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm sm:text-base">Times e Grupos</span>
            </Button>
            <Button
              variant={abaSelecionada === "classificacao" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("classificacao")}
              className={
                abaSelecionada === "classificacao"
                  ? "h-10 sm:h-12 px-3 sm:px-6 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg hover:shadow-xl"
                  : "h-10 sm:h-12 px-3 sm:px-6 text-white hover:bg-white/10"
              }>
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Classificação</span>
            </Button>
            <Button
              variant={abaSelecionada === "confrontos" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("confrontos")}
              className={
                abaSelecionada === "confrontos"
                  ? "h-10 sm:h-12 px-3 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
                  : "h-10 sm:h-12 px-3 sm:px-6 text-white hover:bg-white/10"
              }>
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-sm sm:text-base">Confrontos</span>
            </Button>
            <Button
              variant={abaSelecionada === "chaveamento" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("chaveamento")}
              className={
                abaSelecionada === "chaveamento"
                  ? "h-10 sm:h-12 px-3 sm:px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl"
                  : "h-10 sm:h-12 px-3 sm:px-6 text-white hover:bg-white/10"
              }>
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm sm:text-base">Chaveamento</span>
            </Button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        <div className="space-y-4 sm:space-y-6 bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/30 shadow-lg p-4 sm:p-6">
          {abaSelecionada === "times" && (
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
              <ListaTimesPublica />
            </div>
          )}

          {abaSelecionada === "classificacao" && (
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
              <TabelaClassificacao />
            </div>
          )}

          {abaSelecionada === "confrontos" && (
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-4 text-center">
                  Confrontos do Campeonato
                </h2>
                {carregandoJogos ? (
                  <p className="text-center text-muted-foreground">
                    Carregando confrontos...
                  </p>
                ) : jogos.length === 0 ? (
                  <p className="text-center text-gray-400">
                    Nenhum confronto cadastrado ainda.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Seção Final */}
                    {jogosPorFase.final.length > 0 && (
                      <div className="rounded-xl overflow-hidden border border-yellow-500/30 shadow-lg">
                        <button
                          onClick={() => toggleSecao("final")}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-bold text-lg hover:from-yellow-700 hover:to-yellow-800 transition-all ${
                            faseConcluida("final") ? "opacity-90" : ""
                          }`}>
                          <div className="flex items-center gap-3">
                            <Trophy className="h-5 w-5" />
                            <span>🏆 Final</span>
                            {faseConcluida("final") && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                ✓ Concluída
                              </span>
                            )}
                            {faseAtual === "final" &&
                              !faseConcluida("final") && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-300 text-yellow-900 text-xs rounded-full animate-pulse">
                                  Em andamento
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm opacity-80">
                              {jogosPorFase.final.length} jogo(s)
                            </span>
                            {secaoExpandida.final ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </button>
                        {secaoExpandida.final && (
                          <div className="p-4 bg-yellow-950/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {jogosPorFase.final.map((jogo) =>
                                renderCardJogo(jogo)
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Seção Semifinais */}
                    {jogosPorFase.semifinal.length > 0 && (
                      <div className="rounded-xl overflow-hidden border border-purple-500/30 shadow-lg">
                        <button
                          onClick={() => toggleSecao("semifinal")}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition-all ${
                            faseConcluida("semifinal") ? "opacity-90" : ""
                          }`}>
                          <div className="flex items-center gap-3">
                            <span>⚔️ Semifinais</span>
                            {faseConcluida("semifinal") && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                ✓ Concluída
                              </span>
                            )}
                            {faseAtual === "semifinal" &&
                              !faseConcluida("semifinal") && (
                                <span className="ml-2 px-2 py-0.5 bg-purple-300 text-purple-900 text-xs rounded-full animate-pulse">
                                  Em andamento
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm opacity-80">
                              {jogosPorFase.semifinal.length} jogo(s)
                            </span>
                            {secaoExpandida.semifinal ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </button>
                        {secaoExpandida.semifinal && (
                          <div className="p-4 bg-purple-950/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {jogosPorFase.semifinal.map((jogo) =>
                                renderCardJogo(jogo)
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Seção Quartas de Final */}
                    {jogosPorFase.quartas.length > 0 && (
                      <div className="rounded-xl overflow-hidden border border-orange-500/30 shadow-lg">
                        <button
                          onClick={() => toggleSecao("quartas")}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all ${
                            faseConcluida("quartas") ? "opacity-90" : ""
                          }`}>
                          <div className="flex items-center gap-3">
                            <span>🏅 Quartas de Final</span>
                            {faseConcluida("quartas") && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                ✓ Concluída
                              </span>
                            )}
                            {faseAtual === "quartas" &&
                              !faseConcluida("quartas") && (
                                <span className="ml-2 px-2 py-0.5 bg-orange-300 text-orange-900 text-xs rounded-full animate-pulse">
                                  Em andamento
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm opacity-80">
                              {jogosPorFase.quartas.length} jogo(s)
                            </span>
                            {secaoExpandida.quartas ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </button>
                        {secaoExpandida.quartas && (
                          <div className="p-4 bg-orange-950/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {jogosPorFase.quartas.map((jogo) =>
                                renderCardJogo(jogo)
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Seção Fase de Grupos */}
                    {jogosPorFase.grupos.length > 0 && (
                      <div className="rounded-xl overflow-hidden border border-blue-500/30 shadow-lg">
                        <button
                          onClick={() => toggleSecao("grupos")}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all ${
                            faseConcluida("grupos") ? "opacity-90" : ""
                          }`}>
                          <div className="flex items-center gap-3">
                            <span>⚽ Fase de Grupos</span>
                            {faseConcluida("grupos") && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                ✓ Concluída
                              </span>
                            )}
                            {faseAtual === "grupos" &&
                              !faseConcluida("grupos") && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-300 text-blue-900 text-xs rounded-full animate-pulse">
                                  Em andamento
                                </span>
                              )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm opacity-80">
                              {jogosPorFase.grupos.length} jogo(s)
                            </span>
                            {secaoExpandida.grupos ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                        </button>
                        {secaoExpandida.grupos && (
                          <div className="p-4 bg-blue-950/20">
                            {/* Agrupar por grupo */}
                            {["A", "B", "C", "D"].map((grupo) => {
                              const jogosGrupo = jogosPorFase.grupos.filter(
                                (j) => j.grupo === grupo
                              );
                              if (jogosGrupo.length === 0) return null;
                              return (
                                <div key={grupo} className="mb-4">
                                  <h4 className="text-blue-200 font-bold mb-2 text-sm">
                                    Grupo {grupo}
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {jogosGrupo.map((jogo) =>
                                      renderCardJogo(jogo)
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {abaSelecionada === "chaveamento" && (
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
              <ChaveamentoPublico />
            </div>
          )}
        </div>

        {/* Modal do Regulamento */}
        <Dialog open={regulamentoAberto} onOpenChange={setRegulamentoAberto}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-green-50 border-2 border-green-200 shadow-2xl">
            <DialogHeader className="space-y-3 pb-6 border-b border-green-200">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-full shadow-lg">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                📖 Regulamento Oficial
              </DialogTitle>
              <DialogDescription className="text-center text-base text-gray-700 font-medium">
                Artigo 46º - Critérios de Classificação e Desempate
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 px-2">
              {/* Critérios de Desempate */}
              <div className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg sm:text-xl text-gray-800">
                    Critérios de Desempate
                  </h4>
                </div>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      1
                    </span>
                    <span className="font-medium pt-0.5">
                      Maior número de pontos
                    </span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      2
                    </span>
                    <span className="font-medium pt-0.5">Vitórias</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      3
                    </span>
                    <span className="font-medium pt-0.5">Saldo de gols</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      4
                    </span>
                    <span className="font-medium pt-0.5">
                      Maior número de gols marcados
                    </span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      5
                    </span>
                    <span className="font-medium pt-0.5">
                      Menor número de gols sofridos
                    </span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      6
                    </span>
                    <span className="font-medium pt-0.5">Derrotas</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      7
                    </span>
                    <span className="font-medium pt-0.5">
                      Cartões vermelhos
                    </span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      8
                    </span>
                    <span className="font-medium pt-0.5">Cartões amarelos</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 text-sm">
                      9
                    </span>
                    <span className="font-medium pt-0.5">Sorteio</span>
                  </li>
                </ol>
              </div>

              {/* Informações Gerais */}
              <div className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg sm:text-xl text-gray-800">
                    Informações Gerais
                  </h4>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-blue-600 font-bold text-xl shrink-0">
                      ⚽
                    </span>
                    <span className="font-medium pt-0.5">
                      16 times distribuídos em 4 grupos (A, B, C, D)
                    </span>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-blue-600 font-bold text-xl shrink-0">
                      🏆
                    </span>
                    <span className="font-medium pt-0.5">
                      Os 2 melhores de cada grupo se classificam
                    </span>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-blue-600 font-bold text-xl shrink-0">
                      🎲
                    </span>
                    <span className="font-medium pt-0.5">
                      Semifinais definidas por sorteio
                    </span>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-blue-600 font-bold text-xl shrink-0">
                      ⏱️
                    </span>
                    <span className="font-medium pt-0.5">
                      Tolerância de 15 minutos para início dos jogos
                    </span>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300">
                    <span className="text-blue-600 font-bold text-xl shrink-0">
                      👤
                    </span>
                    <span className="font-semibold pt-0.5">
                      Diretor: Christiano Texeira dos Santos
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="mt-6 pt-6 border-t border-blue-200 text-center">
              <p className="text-sm text-gray-600 font-medium">
                📋 Regulamento oficial do Campeonato Lagoacuense de Futebol 2025
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer Premium */}
        <div className="mt-16 pt-12 border-t border-white/20">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/10">
            <div className="flex justify-center mb-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                <Image
                  src="/SECRETARIAS.zip - 17.png"
                  alt="Liga Esportiva Lagoacuense - Diretor de Esportes: Christiano Texeira dos Santos"
                  width={450}
                  height={75}
                  className="object-contain max-w-full h-auto"
                />
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-white font-bold text-lg">
                Liga Esportiva Lagoacuense
              </p>
              <p className="text-green-200 font-medium">
                Diretor de Esportes:{" "}
                <span className="text-white">
                  Christiano Texeira dos Santos
                </span>
              </p>
              <p className="text-green-300/80 text-sm max-w-md mx-auto">
                Sistema desenvolvido para gestão e acompanhamento do Campeonato
                Lagoacuense 2025
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/login")}
                className="mt-4 text-sm text-green-300 hover:text-white hover:bg-white/10 border border-white/20">
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Área Administrativa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
