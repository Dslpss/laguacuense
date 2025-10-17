"use client";

import { useTimes } from "@/hooks/useTimes";
import { useJogos } from "@/hooks/useJogos";
import { verificarFaseExiste, obterVencedoresQuartas, obterVencedoresSemifinais, obterCampeao } from "@/lib/eliminatorias";
import { calcularClassificacao } from "@/lib/classificacao";

interface MatchCardProps {
  timeA?: string;
  timeB?: string;
  placardA?: number;
  placardB?: number;
  fase: string;
  finalizado?: boolean;
  vencedor?: string;
}

function MatchCard({ timeA, timeB, placardA, placardB, fase, finalizado, vencedor }: MatchCardProps) {
  const { times } = useTimes();
  
  const nomeTimeA = timeA ? times.find(t => t.id === timeA)?.nome || "Time A" : "A definir";
  const nomeTimeB = timeB ? times.find(t => t.id === timeB)?.nome || "Time B" : "A definir";
  
  const isVencedorA = vencedor === timeA;
  const isVencedorB = vencedor === timeB;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all">
      <div className="text-center mb-3">
        <span className="text-xs font-semibold text-green-300 uppercase tracking-wider">
          {fase}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${
          isVencedorA ? 'bg-green-500/30 border border-green-400' : 'bg-white/5'
        }`}>
          <span className={`text-sm font-medium ${isVencedorA ? 'text-green-200' : 'text-white'}`}>
            {nomeTimeA}
          </span>
          {finalizado && placardA !== undefined && (
            <span className={`text-lg font-bold ${isVencedorA ? 'text-green-200' : 'text-white'}`}>
              {placardA}
            </span>
          )}
        </div>
        
        <div className="text-center">
          <span className="text-xs text-gray-300">VS</span>
        </div>
        
        <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${
          isVencedorB ? 'bg-green-500/30 border border-green-400' : 'bg-white/5'
        }`}>
          <span className={`text-sm font-medium ${isVencedorB ? 'text-green-200' : 'text-white'}`}>
            {nomeTimeB}
          </span>
          {finalizado && placardB !== undefined && (
            <span className={`text-lg font-bold ${isVencedorB ? 'text-green-200' : 'text-white'}`}>
              {placardB}
            </span>
          )}
        </div>
      </div>
      
      {!finalizado && timeA && timeB && (
        <div className="text-center mt-2">
          <span className="text-xs text-yellow-300">Aguardando resultado</span>
        </div>
      )}
    </div>
  );
}

export function ChaveamentoPublico() {
  const { times } = useTimes();
  const { jogos } = useJogos();

  // Verificar quais fases existem
  const temQuartas = verificarFaseExiste(jogos, "quartas");
  const temSemifinais = verificarFaseExiste(jogos, "semifinal");
  const temFinal = verificarFaseExiste(jogos, "final");

  // Obter classificação dos grupos
  const classificacao = calcularClassificacao(jogos, times);
  const grupoA = classificacao.filter(t => t.grupo === "A").slice(0, 2);
  const grupoB = classificacao.filter(t => t.grupo === "B").slice(0, 2);
  const grupoC = classificacao.filter(t => t.grupo === "C").slice(0, 2);
  const grupoD = classificacao.filter(t => t.grupo === "D").slice(0, 2);

  // Obter jogos por fase
  const jogosQuartas = jogos.filter(j => j.fase === "quartas");
  const jogosSemifinais = jogos.filter(j => j.fase === "semifinal");
  const jogoFinal = jogos.find(j => j.fase === "final");

  // Obter vencedores
  const vencedoresQuartas = obterVencedoresQuartas(jogos);
  const vencedoresSemifinais = obterVencedoresSemifinais(jogos);
  const campeao = obterCampeao(jogos);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Chaveamento do Campeonato</h2>
        <p className="text-green-200">Acompanhe a progressão desde os grupos até a final</p>
      </div>

      {/* Classificação dos Grupos */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-green-300 text-center">Classificados por Grupo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["A", "B", "C", "D"].map(grupo => {
            const classificados = classificacao.filter(t => t.grupo === grupo).slice(0, 2);
            return (
              <div key={grupo} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <h4 className="text-lg font-bold text-center text-yellow-300 mb-3">Grupo {grupo}</h4>
                <div className="space-y-2">
                  {classificados.map((time, index) => (
                    <div key={`grupo-${grupo}-${time.id}-${index}`} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-sm font-medium text-white">
                        {index + 1}º {time.nome}
                      </span>
                      <span className="text-xs text-green-200">{time.pontos}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quartas de Final */}
      {temQuartas && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-blue-300 text-center">Quartas de Final</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {jogosQuartas.map((jogo, index) => (
              <MatchCard
                key={jogo.id}
                timeA={jogo.timeA}
                timeB={jogo.timeB}
                placardA={jogo.placardA}
                placardB={jogo.placardB}
                fase={`Quartas ${index + 1}`}
                finalizado={jogo.finalizado}
                vencedor={jogo.finalizado ? (
                  (jogo.placardA || 0) > (jogo.placardB || 0) ? jogo.timeA : jogo.timeB
                ) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Semifinais */}
      {temSemifinais && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-purple-300 text-center">Semifinais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {jogosSemifinais.map((jogo, index) => (
              <MatchCard
                key={jogo.id}
                timeA={jogo.timeA}
                timeB={jogo.timeB}
                placardA={jogo.placardA}
                placardB={jogo.placardB}
                fase={`Semifinal ${index + 1}`}
                finalizado={jogo.finalizado}
                vencedor={jogo.finalizado ? (
                  (jogo.placardA || 0) > (jogo.placardB || 0) ? jogo.timeA : jogo.timeB
                ) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Final */}
      {temFinal && jogoFinal && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-yellow-300 text-center">🏆 FINAL 🏆</h3>
          <div className="max-w-md mx-auto">
            <MatchCard
              timeA={jogoFinal.timeA}
              timeB={jogoFinal.timeB}
              placardA={jogoFinal.placardA}
              placardB={jogoFinal.placardB}
              fase="FINAL"
              finalizado={jogoFinal.finalizado}
              vencedor={jogoFinal.finalizado ? (
                (jogoFinal.placardA || 0) > (jogoFinal.placardB || 0) ? jogoFinal.timeA : jogoFinal.timeB
              ) : undefined}
            />
          </div>
        </div>
      )}

      {/* Campeão */}
      {campeao && (
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 rounded-2xl shadow-2xl border-4 border-yellow-300">
            <h3 className="text-3xl font-bold text-yellow-900 mb-2">🏆 CAMPEÃO 🏆</h3>
            <p className="text-2xl font-bold text-yellow-800">
              {times.find(t => t.id === campeao)?.nome || "Time não encontrado"}
            </p>
          </div>
        </div>
      )}

      {/* Mensagem quando não há eliminatórias */}
      {!temQuartas && (
        <div className="text-center py-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Fase de Eliminatórias</h3>
            <p className="text-green-200 mb-4">
              As quartas de final serão geradas após a conclusão da fase de grupos.
            </p>
            <p className="text-sm text-gray-300">
              Os dois primeiros colocados de cada grupo se classificam para as quartas de final.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}