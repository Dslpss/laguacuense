"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Time } from "@/types";
import { HeaderAdmin } from "@/components/auth/HeaderAdmin";
import { useJogos } from "@/hooks/useJogos";
import { useTimes } from "@/hooks/useTimes";
import { ConfrontoEditor } from "@/components/tournament/ConfrontoEditor";
import { DefinirSemifinaisManual } from "@/components/admin/DefinirSemifinaisManual";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import {
  removerTodosJogos,
  removerJogosPorFase,
} from "@/lib/firebase/firestore";
import {
  verificarFaseGruposCompleta,
  verificarClassificadosSuficientes,
  obterResumoClassificados,
  obterClassificadosPorGrupo,
} from "@/lib/finalizacao-grupos";
import {
  verificarQuartasCompletas,
  verificarSemifinaisCompletas,
  verificarFinalCompleta,
  verificarFaseExiste,
  obterCampeao,
  obterVencedoresQuartas,
} from "@/lib/eliminatorias";

export default function ConfrontosPage() {
  const { jogos } = useJogos();
  const { times } = useTimes();
  const [removendo, setRemovendo] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [mostrarDefinicaoManual, setMostrarDefinicaoManual] = useState(false);
  const [modalFinalizarGrupos, setModalFinalizarGrupos] = useState(false);

  // Estados para expandir/encolher seções
  const [secaoExpandida, setSecaoExpandida] = useState<{
    final: boolean;
    semifinal: boolean;
    quartas: boolean;
    grupos: boolean;
  }>({
    final: true,
    semifinal: true,
    quartas: true,
    grupos: false, // Grupos começa encolhido quando há fases mais avançadas
  });

  const toggleSecao = (secao: "final" | "semifinal" | "quartas" | "grupos") => {
    setSecaoExpandida((prev) => ({ ...prev, [secao]: !prev[secao] }));
  };

  // Verifica se a fase de grupos pode ser finalizada
  const podeFinalizarGrupos =
    verificarFaseGruposCompleta(jogos) &&
    verificarClassificadosSuficientes(jogos, times);

  // Verifica estados das fases
  const jaTemQuartas = verificarFaseExiste(jogos, "quartas");
  const jaTemSemifinais = verificarFaseExiste(jogos, "semifinal");
  const jaTemFinal = verificarFaseExiste(jogos, "final");

  // Verifica se as fases estão completas
  const quartasCompletas = verificarQuartasCompletas(jogos);
  const semifinaisCompletas = verificarSemifinaisCompletas(jogos);
  const finalCompleta = verificarFinalCompleta(jogos);

  // Verifica se há campeão
  const campeao = finalCompleta ? obterCampeao(jogos) : null;

  // Obtém vencedores das quartas para definição manual das semifinais
  const vencedoresQuartasIds = quartasCompletas
    ? obterVencedoresQuartas(jogos)
    : [];
  const vencedoresQuartas = vencedoresQuartasIds
    .map((id) => times.find((t) => t.id === id))
    .filter(Boolean) as Time[];

  // Obtém classificados por grupo para o modal
  const classificadosPorGrupo = obterClassificadosPorGrupo(jogos, times);

  const abrirModalFinalizarGrupos = () => {
    if (!podeFinalizarGrupos) {
      alert(
        "A fase de grupos ainda não está completa ou não há classificados suficientes."
      );
      return;
    }

    if (jaTemQuartas) {
      alert("As quartas de final já foram geradas!");
      return;
    }

    setModalFinalizarGrupos(true);
  };

  const confirmarFinalizarGrupos = async () => {
    setModalFinalizarGrupos(false);
    setFinalizando(true);

    try {
      const response = await fetch("/api/finalizar-grupos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.mensagem}\n\n${data.resumo}`);
      } else {
        alert(`❌ Erro: ${data.erro}\n\nDetalhes: ${data.detalhes}`);
      }
    } catch (error) {
      console.error("Erro ao finalizar fase de grupos:", error);
      alert("Erro ao finalizar fase de grupos. Tente novamente.");
    } finally {
      setFinalizando(false);
    }
  };

  const finalizarQuartas = async () => {
    if (!quartasCompletas) {
      alert("As quartas de final ainda não estão completas!");
      return;
    }

    if (jaTemSemifinais) {
      alert("As semifinais já foram geradas!");
      return;
    }

    if (
      !confirm("Deseja finalizar as quartas de final e gerar as semifinais?")
    ) {
      return;
    }

    setFinalizando(true);
    try {
      const response = await fetch("/api/finalizar-quartas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.mensagem}`);
      } else {
        alert(`❌ Erro: ${data.erro}`);
      }
    } catch (error) {
      console.error("Erro ao finalizar quartas:", error);
      alert("Erro ao finalizar quartas. Tente novamente.");
    } finally {
      setFinalizando(false);
    }
  };

  const finalizarSemifinais = async () => {
    if (!semifinaisCompletas) {
      alert("As semifinais ainda não estão completas!");
      return;
    }

    if (jaTemFinal) {
      alert("A final já foi gerada!");
      return;
    }

    if (!confirm("Deseja finalizar as semifinais e gerar a final?")) {
      return;
    }

    setFinalizando(true);
    try {
      const response = await fetch("/api/finalizar-semifinais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.mensagem}`);
      } else {
        alert(`❌ Erro: ${data.erro}`);
      }
    } catch (error) {
      console.error("Erro ao finalizar semifinais:", error);
      alert("Erro ao finalizar semifinais. Tente novamente.");
    } finally {
      setFinalizando(false);
    }
  };

  const declararCampeao = async () => {
    if (!finalCompleta) {
      alert("A final ainda não está completa!");
      return;
    }

    if (!confirm("Deseja declarar o campeão e finalizar o campeonato?")) {
      return;
    }

    setFinalizando(true);
    try {
      const response = await fetch("/api/declarar-campeao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🏆 ${data.mensagem}\n\nCampeão: ${data.campeao.nome}`);
      } else {
        alert(`❌ Erro: ${data.erro}`);
      }
    } catch (error) {
      console.error("Erro ao declarar campeão:", error);
      alert("Erro ao declarar campeão. Tente novamente.");
    } finally {
      setFinalizando(false);
    }
  };

  const conteudo = (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              ← Voltar
            </Button>
          </Link>

          <div className="flex gap-2 flex-wrap flex-col md:flex-row">
            {/* Botão para finalizar fase de grupos */}
            {!jaTemQuartas && (
              <Button
                onClick={abrirModalFinalizarGrupos}
                disabled={finalizando || !podeFinalizarGrupos}
                className={`gap-2 ${
                  podeFinalizarGrupos
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400"
                }`}>
                {finalizando ? (
                  "Finalizando..."
                ) : (
                  <>🏆 Finalizar Fase de Grupos</>
                )}
              </Button>
            )}

            {/* Botão para finalizar quartas */}
            {jaTemQuartas && !jaTemSemifinais && (
              <Button
                onClick={finalizarQuartas}
                disabled={finalizando || !quartasCompletas}
                className={`gap-2 ${
                  quartasCompletas
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400"
                }`}>
                {finalizando ? "Finalizando..." : <>⚽ Finalizar Quartas</>}
              </Button>
            )}

            {/* Botão para definir semifinais manualmente */}
            {quartasCompletas &&
              !jaTemSemifinais &&
              vencedoresQuartas.length === 4 && (
                <Button
                  onClick={() => setMostrarDefinicaoManual(true)}
                  className="gap-2 bg-orange-600 hover:bg-orange-700">
                  ⚙️ Definir Semifinais Manualmente
                </Button>
              )}

            {/* Botão para finalizar semifinais */}
            {jaTemSemifinais && !jaTemFinal && (
              <Button
                onClick={finalizarSemifinais}
                disabled={finalizando || !semifinaisCompletas}
                className={`gap-2 ${
                  semifinaisCompletas
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-400"
                }`}>
                {finalizando ? "Finalizando..." : <>🥅 Finalizar Semifinais</>}
              </Button>
            )}

            {/* Botão para declarar campeão */}
            {jaTemFinal && !campeao && (
              <Button
                onClick={declararCampeao}
                disabled={finalizando || !finalCompleta}
                className={`gap-2 ${
                  finalCompleta
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-gray-400"
                }`}>
                {finalizando ? "Declarando..." : <>👑 Declarar Campeão</>}
              </Button>
            )}

            {/* Mostrar campeão se já foi declarado */}
            {campeao && (
              <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg border-2 border-yellow-400">
                <span className="text-2xl">🏆</span>
                <span className="font-bold text-yellow-800">
                  Campeão:{" "}
                  {times.find((t) => t.id === campeao)?.nome ||
                    "Time não encontrado"}
                </span>
              </div>
            )}

            {/* Botão para voltar à fase de grupos (resetar quartas) */}
            {jaTemQuartas && !jaTemSemifinais && (
              <Button
                variant="outline"
                onClick={async () => {
                  if (
                    !confirm(
                      "⚠️ Tem certeza que deseja REMOVER as quartas de final e voltar para a fase de grupos?\n\nEsta ação não pode ser desfeita."
                    )
                  )
                    return;
                  setRemovendo(true);
                  try {
                    await removerJogosPorFase("quartas");
                    alert(
                      "✅ Quartas de final removidas! Você voltou para a fase de grupos."
                    );
                  } catch (e) {
                    console.error(e);
                    alert("❌ Erro ao remover quartas de final.");
                  } finally {
                    setRemovendo(false);
                  }
                }}
                disabled={removendo}
                className="gap-2 border-orange-500 text-orange-500 hover:bg-orange-500/10">
                {removendo ? "Removendo..." : "↩️ Voltar p/ Fase de Grupos"}
              </Button>
            )}

            {/* Botão para remover todos movido para o final da página */}
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Confrontos</h1>
          <p className="text-blue-200">
            Registre placares e eventos por jogador.
          </p>
        </div>

        {/* Separar jogos por fase */}
        {jogos.length === 0 ? (
          <p className="text-center text-gray-300">
            Nenhum jogo cadastrado ainda.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Final */}
            {jogos.filter((j) => j.fase === "final").length > 0 && (
              <div className="bg-white/5 rounded-2xl border border-yellow-500/30 overflow-hidden">
                <button
                  onClick={() => toggleSecao("final")}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-2 rounded-xl">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h2 className="text-2xl font-bold text-yellow-400">Final</h2>
                  <span className="text-yellow-400/60 text-sm">
                    ({jogos.filter((j) => j.fase === "final").length} jogo)
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                  <span
                    className={`text-yellow-400 text-xl transition-transform duration-300 ${
                      secaoExpandida.final ? "rotate-180" : ""
                    }`}>
                    ▼
                  </span>
                </button>
                {secaoExpandida.final && (
                  <div className="p-4 pt-0 space-y-4">
                    {jogos
                      .filter((j) => j.fase === "final")
                      .map((j) => (
                        <ConfrontoEditor key={j.id} jogo={j} />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Semifinais */}
            {jogos.filter((j) => j.fase === "semifinal").length > 0 && (
              <div className="bg-white/5 rounded-2xl border border-purple-500/30 overflow-hidden">
                <button
                  onClick={() => toggleSecao("semifinal")}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-xl">
                    <span className="text-2xl">⚔️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-400">
                    Semifinais
                  </h2>
                  <span className="text-purple-400/60 text-sm">
                    ({jogos.filter((j) => j.fase === "semifinal").length} jogos)
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                  <span
                    className={`text-purple-400 text-xl transition-transform duration-300 ${
                      secaoExpandida.semifinal ? "rotate-180" : ""
                    }`}>
                    ▼
                  </span>
                </button>
                {secaoExpandida.semifinal && (
                  <div className="p-4 pt-0 space-y-4">
                    {jogos
                      .filter((j) => j.fase === "semifinal")
                      .map((j) => (
                        <ConfrontoEditor key={j.id} jogo={j} />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Quartas de Final */}
            {jogos.filter((j) => j.fase === "quartas").length > 0 && (
              <div className="bg-white/5 rounded-2xl border border-blue-500/30 overflow-hidden">
                <button
                  onClick={() => toggleSecao("quartas")}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl">
                    <span className="text-2xl">🥊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-blue-400">
                    Quartas de Final
                  </h2>
                  <span className="text-blue-400/60 text-sm">
                    ({jogos.filter((j) => j.fase === "quartas").length} jogos)
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                  <span
                    className={`text-blue-400 text-xl transition-transform duration-300 ${
                      secaoExpandida.quartas ? "rotate-180" : ""
                    }`}>
                    ▼
                  </span>
                </button>
                {secaoExpandida.quartas && (
                  <div className="p-4 pt-0 space-y-4">
                    {jogos
                      .filter((j) => j.fase === "quartas")
                      .map((j) => (
                        <ConfrontoEditor key={j.id} jogo={j} />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Fase de Grupos */}
            {jogos.filter((j) => j.fase === "grupos").length > 0 && (
              <div className="bg-white/5 rounded-2xl border border-emerald-500/30 overflow-hidden">
                <button
                  onClick={() => toggleSecao("grupos")}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-xl">
                    <span className="text-2xl">⚽</span>
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-400">
                    Fase de Grupos
                  </h2>
                  <span className="text-emerald-400/60 text-sm">
                    ({jogos.filter((j) => j.fase === "grupos").length} jogos)
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                  <span
                    className={`text-emerald-400 text-xl transition-transform duration-300 ${
                      secaoExpandida.grupos ? "rotate-180" : ""
                    }`}>
                    ▼
                  </span>
                </button>
                {secaoExpandida.grupos && (
                  <div className="p-4 pt-0 space-y-6">
                    {/* Agrupar por grupo */}
                    {(["A", "B", "C", "D"] as const).map((grupo) => {
                      const jogosDoGrupo = jogos.filter(
                        (j) => j.fase === "grupos" && j.grupo === grupo
                      );
                      if (jogosDoGrupo.length === 0) return null;
                      return (
                        <div key={grupo} className="space-y-3">
                          <h3 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                            <span className="bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                              {grupo}
                            </span>
                            Grupo {grupo}
                          </h3>
                          {jogosDoGrupo.map((j) => (
                            <ConfrontoEditor key={j.id} jogo={j} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {jogos.length > 0 && (
          <div className="mt-10 pt-6 border-t border-red-500/20 flex justify-center">
            <Button
              variant="destructive"
              onClick={async () => {
                if (
                  !confirm(
                    `Tem certeza que deseja remover TODOS os ${jogos.length} confrontos? Esta ação não pode ser desfeita.`
                  )
                )
                  return;
                setRemovendo(true);
                try {
                  await removerTodosJogos();
                  alert("Todos os confrontos foram removidos!");
                } catch (e) {
                  console.error(e);
                  alert("Erro ao remover confrontos.");
                } finally {
                  setRemovendo(false);
                }
              }}
              disabled={removendo}
              className="w-full md:w-auto max-w-sm">
              {removendo ? "Removendo..." : "🗑️ Remover todos"}
            </Button>
          </div>
        )}

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
      {conteudo}

      {/* Modal para finalizar fase de grupos */}
      <Dialog
        open={modalFinalizarGrupos}
        onOpenChange={setModalFinalizarGrupos}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-blue-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <span className="text-3xl">🏆</span>
              Classificados para as Quartas de Final
            </DialogTitle>
            <DialogDescription className="text-blue-200 text-center">
              Confira os times classificados de cada grupo
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {(["A", "B", "C", "D"] as const).map((grupo) => {
              const classificados = classificadosPorGrupo[grupo] || [];
              return (
                <div
                  key={grupo}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {grupo}
                    </span>
                    Grupo {grupo}
                  </h3>
                  <div className="space-y-2">
                    {classificados.length > 0 ? (
                      classificados.slice(0, 2).map((classificado, idx) => (
                        <div
                          key={classificado.timeId}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            idx === 0
                              ? "bg-yellow-500/20 border border-yellow-500/30"
                              : "bg-gray-500/20 border border-gray-500/30"
                          }`}>
                          <span
                            className={`text-2xl ${
                              idx === 0 ? "text-yellow-400" : "text-gray-400"
                            }`}>
                            {idx === 0 ? "🥇" : "🥈"}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-white">
                              {classificado.nomeTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-bold text-lg ${
                                idx === 0 ? "text-yellow-300" : "text-gray-300"
                              }`}>
                              {classificado.pontos} pts
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm italic">
                        Nenhum time classificado ainda
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setModalFinalizarGrupos(false)}
              className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10">
              Cancelar
            </Button>
            <Button
              onClick={confirmarFinalizarGrupos}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold">
              ✅ Confirmar e Gerar Quartas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para definir semifinais manualmente */}
      {mostrarDefinicaoManual && (
        <DefinirSemifinaisManual
          vencedoresQuartas={vencedoresQuartas.map((time) => time.id)}
          onClose={() => setMostrarDefinicaoManual(false)}
          onSuccess={() => {
            setMostrarDefinicaoManual(false);
            // Recarregar a página para atualizar os dados
            window.location.reload();
          }}
        />
      )}
    </ProtectedRoute>
  );
}
