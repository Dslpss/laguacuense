"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Time } from "@/types";
import { useTimes } from "@/hooks/useTimes";

interface DefinirSemifinaisManualProps {
  vencedoresQuartas: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function DefinirSemifinaisManual({ 
  vencedoresQuartas, 
  onClose,
  onSuccess 
}: DefinirSemifinaisManualProps) {
  const { times } = useTimes();
  const [semifinal1TimeA, setSemifinal1TimeA] = useState<string>("");
  const [semifinal1TimeB, setSemifinal1TimeB] = useState<string>("");
  const [semifinal2TimeA, setSemifinal2TimeA] = useState<string>("");
  const [semifinal2TimeB, setSemifinal2TimeB] = useState<string>("");
  const [dataJogos, setDataJogos] = useState<string>("");
  const [definindo, setDefinindo] = useState(false);

  // Define data padrão (7 dias a partir de hoje)
  useEffect(() => {
    const dataDefault = new Date();
    dataDefault.setDate(dataDefault.getDate() + 7);
    setDataJogos(dataDefault.toISOString().split('T')[0]);
  }, []);

  const getTimeNome = (timeId: string) => {
    const time = times.find(t => t.id === timeId);
    return time ? time.nome : timeId;
  };

  const timesDisponiveis = vencedoresQuartas.filter(timeId => 
    timeId !== semifinal1TimeA && 
    timeId !== semifinal1TimeB && 
    timeId !== semifinal2TimeA && 
    timeId !== semifinal2TimeB
  );

  const podeDefinir = semifinal1TimeA && semifinal1TimeB && semifinal2TimeA && semifinal2TimeB && dataJogos;

  const definirSemifinais = async () => {
    if (!podeDefinir) {
      alert("Preencha todos os campos!");
      return;
    }

    if (!confirm("Deseja definir as semifinais com esses confrontos?")) {
      return;
    }

    setDefinindo(true);
    try {
      const response = await fetch("/api/definir-semifinais-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semifinal1: {
            timeA: semifinal1TimeA,
            timeB: semifinal1TimeB
          },
          semifinal2: {
            timeA: semifinal2TimeA,
            timeB: semifinal2TimeB
          },
          dataJogos: dataJogos
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.mensagem}`);
        onSuccess();
      } else {
        alert(`❌ Erro: ${data.erro}`);
      }
    } catch (error) {
      console.error("Erro ao definir semifinais:", error);
      alert("Erro ao definir semifinais. Tente novamente.");
    } finally {
      setDefinindo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-purple-700">
          🎯 Definir Semifinais Manualmente
        </CardTitle>
        <p className="text-center text-gray-600">
          Escolha os confrontos das semifinais entre os vencedores das quartas de final
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vencedores das Quartas */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Vencedores das Quartas de Final:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {vencedoresQuartas.map((timeId, index) => (
              <div key={timeId} className="bg-white p-2 rounded border text-center text-sm">
                <span className="font-medium">{getTimeNome(timeId)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Semifinal 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-600">Semifinal 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semifinal1-timeA">Time A</Label>
                <Select value={semifinal1TimeA} onValueChange={setSemifinal1TimeA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Time A" />
                  </SelectTrigger>
                  <SelectContent>
                    {vencedoresQuartas
                      .filter(timeId => timeId !== semifinal1TimeB)
                      .map((timeId) => (
                        <SelectItem key={timeId} value={timeId}>
                          {getTimeNome(timeId)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="semifinal1-timeB">Time B</Label>
                <Select value={semifinal1TimeB} onValueChange={setSemifinal1TimeB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Time B" />
                  </SelectTrigger>
                  <SelectContent>
                    {vencedoresQuartas
                      .filter(timeId => timeId !== semifinal1TimeA)
                      .map((timeId) => (
                        <SelectItem key={timeId} value={timeId}>
                          {getTimeNome(timeId)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {semifinal1TimeA && semifinal1TimeB && (
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <span className="font-semibold text-green-800">
                  {getTimeNome(semifinal1TimeA)} × {getTimeNome(semifinal1TimeB)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Semifinal 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-600">Semifinal 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semifinal2-timeA">Time A</Label>
                <Select value={semifinal2TimeA} onValueChange={setSemifinal2TimeA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Time A" />
                  </SelectTrigger>
                  <SelectContent>
                    {timesDisponiveis.map((timeId) => (
                      <SelectItem key={timeId} value={timeId}>
                        {getTimeNome(timeId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="semifinal2-timeB">Time B</Label>
                <Select value={semifinal2TimeB} onValueChange={setSemifinal2TimeB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Time B" />
                  </SelectTrigger>
                  <SelectContent>
                    {timesDisponiveis
                      .filter(timeId => timeId !== semifinal2TimeA)
                      .map((timeId) => (
                        <SelectItem key={timeId} value={timeId}>
                          {getTimeNome(timeId)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {semifinal2TimeA && semifinal2TimeB && (
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <span className="font-semibold text-green-800">
                  {getTimeNome(semifinal2TimeA)} × {getTimeNome(semifinal2TimeB)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data dos Jogos */}
        <div>
          <Label htmlFor="data-jogos">Data dos Jogos</Label>
          <Input
            id="data-jogos"
            type="date"
            value={dataJogos}
            onChange={(e) => setDataJogos(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={definindo}
          >
            Cancelar
          </Button>
          <Button
            onClick={definirSemifinais}
            disabled={!podeDefinir || definindo}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {definindo ? "Definindo..." : "🎯 Definir Semifinais"}
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}