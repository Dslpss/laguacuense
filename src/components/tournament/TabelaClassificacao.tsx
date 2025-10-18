"use client";

import { useClassificacao } from "@/hooks/useClassificacao";
import { useTimes } from "@/hooks/useTimes";
import { agruparClassificacaoPorGrupo } from "@/lib/classificacao";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Time } from "@/types";

export function TabelaClassificacao() {
  const { classificacao, carregando } = useClassificacao();
  const { times } = useTimes();

  // Criar um mapa de times para acesso rápido às logos
  const timesMap = times.reduce((acc, time) => {
    acc[time.id] = time;
    return acc;
  }, {} as Record<string, Time>);

  if (carregando) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-b border-white/20 p-6">
          <h2 className="text-2xl font-bold text-yellow-100">Classificação</h2>
        </div>
        <div className="p-6">
          <p className="text-center text-green-200">
            Carregando classificação...
          </p>
        </div>
      </div>
    );
  }

  const grupos = agruparClassificacaoPorGrupo(classificacao);

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-b border-white/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 px-4 py-2 rounded-xl shadow-lg">
              <span className="text-white font-bold text-lg">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-yellow-100">Classificação Geral</h2>
          </div>
          <p className="text-yellow-200 font-medium">
            Classificação seguindo os critérios do Art. 46º do regulamento
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {["A", "B", "C", "D"].map((grupo) => {
              const timesDoGrupo = grupos[grupo] || [];

              return (
                <div key={grupo} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 rounded-xl shadow-lg">
                      <span className="text-white font-bold">Grupo {grupo}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto bg-slate-900/50 rounded-xl border border-white/10">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                          <TableHead className="w-8 sticky left-0 bg-slate-900/80 text-blue-200 font-semibold">
                            #
                          </TableHead>
                          <TableHead className="sticky left-8 bg-slate-900/80 min-w-[120px] text-blue-200 font-semibold">
                            Time
                          </TableHead>
                          <TableHead className="text-center text-blue-200 font-semibold">P</TableHead>
                          <TableHead className="text-center hidden sm:table-cell text-blue-200 font-semibold">
                            J
                          </TableHead>
                          <TableHead className="text-center text-blue-200 font-semibold">V</TableHead>
                          <TableHead className="text-center hidden sm:table-cell text-blue-200 font-semibold">
                            E
                          </TableHead>
                          <TableHead className="text-center hidden sm:table-cell text-blue-200 font-semibold">
                            D
                          </TableHead>
                          <TableHead className="text-center hidden md:table-cell text-blue-200 font-semibold">
                            GM
                          </TableHead>
                          <TableHead className="text-center hidden md:table-cell text-blue-200 font-semibold">
                            GS
                          </TableHead>
                          <TableHead className="text-center text-blue-200 font-semibold">SG</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timesDoGrupo.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10}>
                              <div className="text-center py-8 text-blue-300">
                                Nenhum time encontrado neste grupo
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : timesDoGrupo.map((time, index) => (
                          <TableRow key={time.timeId} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-medium sticky left-0 bg-slate-900/80 text-yellow-100">
                              {index + 1}
                              {index < 2 && (
                                <div className="inline-block bg-gradient-to-br from-blue-500 to-blue-600 px-2 py-1 rounded-md shadow-sm ml-1">
                                  <span className="text-white text-xs font-bold">Q</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium sticky left-8 bg-slate-900/80">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const timeData = timesMap[time.timeId];
                                  return timeData?.logoUrl ? (
                                    <Image
                                      src={timeData.logoUrl}
                                    alt={`Logo de ${time.nomeTime}`}
                                    width={24}
                                    height={24}
                                    className="object-contain rounded"
                                    style={{ maxWidth: "24px", maxHeight: "24px" }}
                                    unoptimized
                                  />
                                  ) : (
                                    <div className="h-6 w-6 flex items-center justify-center bg-slate-700/50 rounded text-xs text-green-300">
                                      ?
                                    </div>
                                  );
                                })()}
                                <span className="text-yellow-100 font-medium">{time.nomeTime}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-blue-200 font-bold">
                              {time.pontos}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell text-blue-200">
                              {time.jogos}
                            </TableCell>
                            <TableCell className="text-center text-blue-200">
                              {time.vitorias}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell text-blue-200">
                              {time.empates}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell text-blue-200">
                              {time.derrotas}
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell text-blue-200">
                              {time.golsMarcados}
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell text-blue-200">
                              {time.golsSofridos}
                            </TableCell>
                            <TableCell className="text-center text-blue-400 font-bold">
                              {time.saldoGols > 0 ? '+' : ''}{time.saldoGols}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            {/* Legenda das Colunas */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-3 py-1 rounded-lg shadow-sm">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
                <h3 className="text-yellow-200 font-bold text-sm">Legenda das Colunas</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-bold">P</span>
                  <span className="text-green-200">Pontos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded font-bold">J</span>
                  <span className="text-green-200">Jogos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded font-bold">V</span>
                  <span className="text-green-200">Vitórias</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded font-bold">E</span>
                  <span className="text-green-200">Empates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded font-bold">D</span>
                  <span className="text-green-200">Derrotas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded font-bold">GM</span>
                  <span className="text-green-200">Gols Marcados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded font-bold">GS</span>
                  <span className="text-green-200">Gols Sofridos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded font-bold">SG</span>
                  <span className="text-green-200">Saldo de Gols</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-bold">Q</span>
                  <span className="text-green-200">Qualificado</span>
                </div>
              </div>
            </div>

            {/* Nota sobre Responsividade */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-3 py-1 rounded-lg shadow-sm">
                  <span className="text-white text-sm font-bold">📱</span>
                </div>
                <h3 className="text-yellow-200 font-bold text-sm">Visualização Responsiva</h3>
              </div>
              <p className="text-blue-300 text-xs leading-relaxed">
                 <em>
                   Em dispositivos móveis e telas pequenas, algumas colunas ficam ocultas para melhor visualização. 
                   Role horizontalmente na tabela para ver todas as estatísticas disponíveis.
                 </em>
               </p>
              <div className="flex flex-wrap gap-3 mt-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Classificado
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Zona de Classificação
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Eliminado
                  </span>
                </div>
                <p className="text-blue-200 text-sm mt-2">
                  * Os 2 primeiros de cada grupo se classificam para as semifinais
                </p>
            </div>

            {/* Critérios de Desempate */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-3 py-1 rounded-lg shadow-sm">
                  <span className="text-white text-sm font-bold">⚖️</span>
                </div>
                <h3 className="text-yellow-200 font-bold text-sm">Critérios de Desempate</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">1º</span>
                  <span className="text-green-200">Pontos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">2º</span>
                  <span className="text-green-200">Vitórias</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">3º</span>
                  <span className="text-green-200">Saldo de Gols</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">4º</span>
                  <span className="text-green-200">Gols Marcados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">5º</span>
                  <span className="text-green-200">Gols Sofridos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">6º</span>
                  <span className="text-green-200">Derrotas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">7º</span>
                  <span className="text-green-200">Cartões Vermelhos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">8º</span>
                  <span className="text-green-200">Cartões Amarelos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded font-bold min-w-[24px] text-center">9º</span>
                  <span className="text-green-200">Sorteio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
