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
import Link from "next/link";
import Image from "next/image";
import { removerTodosJogos } from "@/lib/firebase/firestore";
import { 
  verificarFaseGruposCompleta,
  verificarClassificadosSuficientes,
  obterResumoClassificados
} from "@/lib/finalizacao-grupos";
import {
  verificarQuartasCompletas,
  verificarSemifinaisCompletas,
  verificarFinalCompleta,
  verificarFaseExiste,
  obterCampeao,
  obterVencedoresQuartas
} from "@/lib/eliminatorias";

export default function ConfrontosPage() {
  const { jogos } = useJogos();
  const { times } = useTimes();
  const [removendo, setRemovendo] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [mostrarDefinicaoManual, setMostrarDefinicaoManual] = useState(false);

  // Verifica se a fase de grupos pode ser finalizada
  const podeFinalizarGrupos = verificarFaseGruposCompleta(jogos) && 
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
  const vencedoresQuartasIds = quartasCompletas ? obterVencedoresQuartas(jogos) : [];
  const vencedoresQuartas = vencedoresQuartasIds.map(id => times.find(t => t.id === id)).filter(Boolean) as Time[];

  const finalizarFaseGrupos = async () => {
    if (!podeFinalizarGrupos) {
      alert("A fase de grupos ainda não está completa ou não há classificados suficientes.");
      return;
    }

    if (jaTemQuartas) {
      alert("As quartas de final já foram geradas!");
      return;
    }

    const resumo = obterResumoClassificados(jogos, times);
    
    if (!confirm(`${resumo}\n\nDeseja finalizar a fase de grupos e gerar as quartas de final?`)) {
      return;
    }

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

    if (!confirm("Deseja finalizar as quartas de final e gerar as semifinais?")) {
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
                onClick={finalizarFaseGrupos}
                disabled={finalizando || !podeFinalizarGrupos}
                className={`gap-2 ${
                  podeFinalizarGrupos 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-gray-400"
                }`}
              >
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
                }`}
              >
                {finalizando ? (
                  "Finalizando..."
                ) : (
                  <>⚽ Finalizar Quartas</>
                )}
              </Button>
            )}

            {/* Botão para definir semifinais manualmente */}
            {quartasCompletas && !jaTemSemifinais && vencedoresQuartas.length === 4 && (
              <Button
                onClick={() => setMostrarDefinicaoManual(true)}
                className="gap-2 bg-orange-600 hover:bg-orange-700"
              >
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
                }`}
              >
                {finalizando ? (
                  "Finalizando..."
                ) : (
                  <>🥅 Finalizar Semifinais</>
                )}
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
                }`}
              >
                {finalizando ? (
                  "Declarando..."
                ) : (
                  <>👑 Declarar Campeão</>
                )}
              </Button>
            )}

            {/* Mostrar campeão se já foi declarado */}
            {campeao && (
              <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg border-2 border-yellow-400">
                <span className="text-2xl">🏆</span>
                <span className="font-bold text-yellow-800">
                  Campeão: {times.find(t => t.id === campeao)?.nome || "Time não encontrado"}
                </span>
              </div>
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

        <div className="space-y-4">
          {jogos.length === 0 ? (
            <p className="text-center text-gray-300">
              Nenhum jogo cadastrado ainda.
            </p>
          ) : (
            jogos.map((j) => <ConfrontoEditor key={j.id} jogo={j} />)
          )}
        </div>

        {jogos.length > 0 && (
          <div className="mt-10 pt-6 border-t border-red-500/20 flex justify-center">
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirm(`Tem certeza que deseja remover TODOS os ${jogos.length} confrontos? Esta ação não pode ser desfeita.`)) return;
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
              className="w-full md:w-auto max-w-sm"
            >
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
      
      {/* Modal para definir semifinais manualmente */}
      {mostrarDefinicaoManual && (
        <DefinirSemifinaisManual
          vencedoresQuartas={vencedoresQuartas.map(time => time.id)}
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
