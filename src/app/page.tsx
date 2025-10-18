"use client";

import { useState } from "react";
import Image from "next/image";
import { FormularioTime } from "@/components/tournament/FormularioTime";
import { ListaTimes } from "@/components/tournament/ListaTimes";
import { TabelaClassificacao } from "@/components/tournament/TabelaClassificacao";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HeaderAdmin } from "@/components/auth/HeaderAdmin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTimes } from "@/hooks/useTimes";
import { Sorteios as SorteiosHistorico } from "@/components/tournament/Sorteios";

export default function Home() {
  const [abaSelecionada, setAbaSelecionada] = useState("times");
  const [carregandoSorteio, setCarregandoSorteio] = useState(false);
  const [regulamentoAberto, setRegulamentoAberto] = useState(false);
  const { times } = useTimes();

  const realizarSorteio = async () => {
    if (times.length !== 16) {
      alert(
        `É necessário ter exatamente 16 times para realizar o sorteio. Atualmente há ${times.length} times.`
      );
      return;
    }

    setCarregandoSorteio(true);

    try {
      const response = await fetch("/api/sorteio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sorteio realizado com sucesso!");
        console.log("Grupos:", data.grupos);
      } else {
        alert(data.erro || "Erro ao realizar sorteio");
      }
    } catch (error) {
      console.error("Erro ao realizar sorteio:", error);
      alert("Erro ao realizar sorteio. Tente novamente.");
    } finally {
      setCarregandoSorteio(false);
    }
  };

  const conteudoPrincipal = (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header Premium */}
        <div className="text-center mb-8 px-4">
          {/* Container Premium com gradiente e efeitos */}
          <div className="relative bg-gradient-to-br from-blue-900/40 via-slate-800/30 to-blue-900/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-500/20 mb-8">
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent rounded-3xl animate-pulse"></div>
            
            {/* Título Principal */}
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent leading-tight py-2">
                   Campeonato Lagoacuense
                 </h1>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl">⚽</span>
                <h2 className="text-xl sm:text-2xl font-semibold text-blue-100">
                  Futebol 2025
                </h2>
                <span className="text-4xl">🏆</span>
              </div>
              
              <p className="text-lg sm:text-xl text-blue-200/90 mb-8 font-medium">
                Sistema de gestão do torneio - Liga Esportiva Lagoacuense
              </p>
            </div>
          </div>

          {/* Status Cards Premium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Card Data */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-400/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-500/20 p-2 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-emerald-200 font-semibold">Data</span>
              </div>
              <p className="text-white font-bold text-lg">27/09/2025</p>
              <p className="text-emerald-200 text-sm">às 15:30min</p>
            </div>

            {/* Card Equipes */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-500/20 p-2 rounded-xl">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-blue-200 font-semibold">Formato</span>
              </div>
              <p className="text-white font-bold text-lg">16 equipes</p>
              <p className="text-blue-200 text-sm">em 4 grupos</p>
            </div>

            {/* Card Status */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-500/20 p-2 rounded-xl">
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-purple-200 font-semibold">Status</span>
              </div>
              <p className="text-white font-bold text-lg">{times.length}/16</p>
              <p className="text-purple-200 text-sm">times cadastrados</p>
            </div>
          </div>

          {/* Botão de sorteio */}
          {times.length === 16 && !times.some((t) => t.grupo) && (
            <Button
              onClick={realizarSorteio}
              disabled={carregandoSorteio}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {carregandoSorteio
                ? "Realizando sorteio..."
                : "🎲 Realizar Sorteio dos Grupos"}
            </Button>
          )}
        </div>

        {/* Navegação por abas */}
        <div className="flex justify-center mb-8 px-2 sm:px-4 overflow-x-auto">
          <div className="flex gap-1 sm:gap-2 p-1 bg-white rounded-lg shadow-sm min-w-max">
            <Button
              variant={abaSelecionada === "times" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("times")}
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
            >
              📋 Times
            </Button>
            <Button
              variant={abaSelecionada === "classificacao" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("classificacao")}
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
            >
              🏆 Classificação
            </Button>
            <Button
              variant={abaSelecionada === "sorteios" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("sorteios")}
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
            >
              🎲 Sorteios
            </Button>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/confrontos")}
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
            >
              ⚽ Confrontos
            </Button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        <div className="space-y-6">
          {abaSelecionada === "times" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FormularioTime />
              </div>
              <div className="lg:col-span-2">
                <ListaTimes />
              </div>
            </div>
          )}

          {abaSelecionada === "classificacao" && <TabelaClassificacao />}
          {abaSelecionada === "sorteios" && <SorteiosHistorico />}
        </div>

        {/* Botão do regulamento */}
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setRegulamentoAberto(true)}
            className="gap-2"
          >
            📖 Ver Regulamento Completo
          </Button>
        </div>

        {/* Modal do Regulamento */}
        <Dialog open={regulamentoAberto} onOpenChange={setRegulamentoAberto}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-2xl">
            <DialogHeader className="space-y-3 pb-6 border-b border-blue-200">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-full shadow-lg">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                📖 Regulamento Oficial
              </DialogTitle>
              <DialogDescription className="text-center text-base text-gray-700 font-medium">
                Artigo 46º - Critérios de Classificação e Desempate
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 px-2">
              {/* Critérios de Desempate */}
              <div className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
                      viewBox="0 0 24 24"
                    >
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
              <p className="text-blue-200 font-medium">
                Diretor de Esportes:{" "}
                <span className="text-white">
                  Christiano Texeira dos Santos
                </span>
              </p>
              <p className="text-blue-300/80 text-sm max-w-md mx-auto">
                Sistema desenvolvido para gestão e acompanhamento do Campeonato
                Lagoacuense 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <HeaderAdmin />
      {conteudoPrincipal}
    </ProtectedRoute>
  );
}
