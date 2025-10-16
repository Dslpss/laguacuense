"use client";

import { useState } from "react";
import { ListaTimes } from "@/components/tournament/ListaTimes";
import { TabelaClassificacao } from "@/components/tournament/TabelaClassificacao";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimes } from "@/hooks/useTimes";
import { Trophy, Users, Calendar } from "lucide-react";

export default function PaginaPublica() {
  const [abaSelecionada, setAbaSelecionada] = useState("times");
  const { times } = useTimes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header Público */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-yellow-600" />
            <Users className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-green-800 mb-4">
            ⚽ Campeonato Lagoacuense de Futebol 2025
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Acompanhe os times, grupos e classificações do torneio
          </p>

          {/* Informações do campeonato */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge
              variant="secondary"
              className="text-sm flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Data: 27/09/2025 às 15:30min
            </Badge>
            <Badge variant="outline" className="text-sm">
              16 equipes em 4 grupos
            </Badge>
            <Badge variant="outline" className="text-sm">
              Times inscritos: {times.length}/16
            </Badge>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">
              📋 Critérios de Classificação (Art. 46º)
            </h3>
            <p className="text-sm text-gray-600 text-left">
              1. Maior número de pontos • 2. Vitórias • 3. Saldo de gols • 4.
              Maior número de gols marcados • 5. Menor número de gols sofridos •
              6. Derrotas • 7. Cartões vermelhos • 8. Cartões amarelos • 9.
              Sorteio
            </p>
          </div>
        </div>

        {/* Navegação por abas */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            <Button
              variant={abaSelecionada === "times" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("times")}
            >
              📋 Times e Grupos
            </Button>
            <Button
              variant={abaSelecionada === "classificacao" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("classificacao")}
            >
              🏆 Classificação
            </Button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        <div className="space-y-6">
          {abaSelecionada === "times" && (
            <div className="max-w-4xl mx-auto">
              <ListaTimes />
            </div>
          )}

          {abaSelecionada === "classificacao" && (
            <div className="max-w-6xl mx-auto">
              <TabelaClassificacao />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="text-gray-500 text-sm space-y-2">
            <p className="font-semibold">Liga Esportiva Lagoacuense</p>
            <p>Diretor de Esportes: Christiano Texeira dos Santos</p>
            <p className="text-xs">
              Sistema desenvolvido para gestão do Campeonato Lagoacuense 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
