"use client";

import { useState } from "react";
import { FormularioTime } from "@/components/tournament/FormularioTime";
import { ListaTimes } from "@/components/tournament/ListaTimes";
import { TabelaClassificacao } from "@/components/tournament/TabelaClassificacao";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HeaderAdmin } from "@/components/auth/HeaderAdmin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTimes } from "@/hooks/useTimes";

export default function Home() {
  const [abaSelecionada, setAbaSelecionada] = useState("times");
  const [carregandoSorteio, setCarregandoSorteio] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            ⚽ Campeonato Lagoacuense de Futebol 2025
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Sistema de gestão do torneio - Liga Esportiva Lagoacuense
          </p>

          {/* Status do campeonato */}
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="secondary" className="text-sm">
              Data: 27/09/2025 às 15:30min
            </Badge>
            <Badge variant="outline" className="text-sm">
              16 equipes em 4 grupos
            </Badge>
            <Badge variant="outline" className="text-sm">
              Times cadastrados: {times.length}/16
            </Badge>
          </div>

          {/* Botão de sorteio */}
          {times.length === 16 && !times.some((t) => t.grupo) && (
            <Button
              onClick={realizarSorteio}
              disabled={carregandoSorteio}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {carregandoSorteio
                ? "Realizando sorteio..."
                : "🎲 Realizar Sorteio dos Grupos"}
            </Button>
          )}
        </div>

        {/* Navegação por abas */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            <Button
              variant={abaSelecionada === "times" ? "default" : "ghost"}
              onClick={() => setAbaSelecionada("times")}
            >
              📋 Times
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
        </div>

        {/* Informações do regulamento */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📖 Regulamento - Art. 46º</CardTitle>
            <CardDescription>
              Critérios de classificação conforme regulamento oficial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Critérios de Desempate:</h4>
                <ol className="text-sm space-y-1">
                  <li>1º - Maior número de pontos</li>
                  <li>2º - Vitórias</li>
                  <li>3º - Saldo de gols</li>
                  <li>4º - Maior número de gols marcados</li>
                  <li>5º - Menor número de gols sofridos</li>
                  <li>6º - Derrotas</li>
                  <li>7º - Cartões vermelhos</li>
                  <li>8º - Cartões amarelos</li>
                  <li>9º - Sorteio</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Informações Gerais:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 16 times distribuídos em 4 grupos (A, B, C, D)</li>
                  <li>• Os 2 melhores de cada grupo se classificam</li>
                  <li>• Semifinais definidas por sorteio</li>
                  <li>• Tolerância de 15 minutos para início dos jogos</li>
                  <li>• Diretor: Christiano Texeira dos Santos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Liga Esportiva Lagoacuense • Diretor de Esportes: Christiano Texeira
            dos Santos
          </p>
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
