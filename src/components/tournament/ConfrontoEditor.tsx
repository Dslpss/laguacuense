"use client";

import { useEffect, useMemo, useState } from "react";
import { Jogo } from "@/types";
import { useTimes } from "@/hooks/useTimes";
import { useJogadores } from "@/hooks/useJogadores";
import { atualizarJogo } from "@/lib/firebase/firestore";
import {
  adicionarEventoJogo,
  obterEventosJogo,
  removerEventoJogo,
  EventoTipo,
} from "@/lib/firebase/eventos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";

type Props = { jogo: Jogo };

type Evento = {
  id: string;
  timeId: string;
  jogadorId: string;
  tipo: EventoTipo;
  minuto?: number;
  criadoEm: Timestamp;
};

export function ConfrontoEditor({ jogo }: Props) {
  const { times } = useTimes();
  const timeA = useMemo(
    () => times.find((t) => t.id === jogo.timeA),
    [times, jogo.timeA]
  );
  const timeB = useMemo(
    () => times.find((t) => t.id === jogo.timeB),
    [times, jogo.timeB]
  );
  const { jogadores: jogA } = useJogadores(jogo.timeA);
  const { jogadores: jogB } = useJogadores(jogo.timeB);

  const [golsA, setGolsA] = useState<number>(jogo.golsTimeA ?? 0);
  const [golsB, setGolsB] = useState<number>(jogo.golsTimeB ?? 0);
  const [tipoEvento, setTipoEvento] = useState<EventoTipo>("gol");
  const [lado, setLado] = useState<"A" | "B">("A");
  const [jogadorId, setJogadorId] = useState<string>("");
  const [minuto, setMinuto] = useState<string>("");
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    const unsub = obterEventosJogo(jogo.id, (ev) =>
      setEventos(ev as unknown as Evento[])
    );
    return () => unsub();
  }, [jogo.id]);

  const salvarPlacar = async () => {
    await atualizarJogo(jogo.id, {
      golsTimeA: Number(golsA),
      golsTimeB: Number(golsB),
    });
  };

  const jogadoresDoLado = lado === "A" ? jogA : jogB;
  const timeIdDoLado = lado === "A" ? jogo.timeA : jogo.timeB;

  const adicionarEvento = async () => {
    if (!jogadorId) return;
    const min = minuto ? parseInt(minuto, 10) : undefined;
    await adicionarEventoJogo(jogo.id, {
      tipo: tipoEvento,
      jogadorId,
      timeId: timeIdDoLado,
      minuto: typeof min === "number" && !Number.isNaN(min) ? min : undefined,
    });
    setJogadorId("");
    setMinuto("");
  };

  const removerEvt = async (eventoId: string) => {
    await removerEventoJogo(jogo.id, eventoId);
  };

  const nomeTimeA = timeA?.nome ?? jogo.timeA;
  const nomeTimeB = timeB?.nome ?? jogo.timeB;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {nomeTimeA} × {nomeTimeB} {jogo.grupo ? `• Grupo ${jogo.grupo}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <Label>{nomeTimeA} (gols)</Label>
            <Input
              type="number"
              min={0}
              value={golsA}
              onChange={(e) => setGolsA(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>{nomeTimeB} (gols)</Label>
            <Input
              type="number"
              min={0}
              value={golsB}
              onChange={(e) => setGolsB(Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-2 text-sm text-gray-600">
            Atualize o placar e salve. Os eventos abaixo não alteram
            automaticamente o placar (flexível para W.O., correções etc.).
          </div>
          <div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={salvarPlacar}
            >
              Salvar placar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <Label>Time</Label>
            <Select value={lado} onValueChange={(v) => setLado(v as "A" | "B")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">{nomeTimeA}</SelectItem>
                <SelectItem value="B">{nomeTimeB}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Evento</Label>
            <Select
              value={tipoEvento}
              onValueChange={(v) => setTipoEvento(v as EventoTipo)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gol">Gol</SelectItem>
                <SelectItem value="amarelo">Cartão amarelo</SelectItem>
                <SelectItem value="vermelho">Cartão vermelho</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Jogador</Label>
            <Select value={jogadorId} onValueChange={(v) => setJogadorId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o jogador" />
              </SelectTrigger>
              <SelectContent>
                {jogadoresDoLado.map(
                  (j: { id: string; nome: string; numero: number }) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.nome} • {j.numero}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Minuto (opcional)</Label>
            <Input
              type="number"
              min={0}
              max={120}
              value={minuto}
              onChange={(e) => setMinuto(e.target.value)}
            />
          </div>
          <div>
            <Button className="w-full" onClick={adicionarEvento}>
              Adicionar evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Eventos — {nomeTimeA}</h4>
            <ul className="space-y-1 text-sm">
              {eventos
                .filter((e) => e.timeId === jogo.timeA)
                .map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <span>
                      {e.tipo.toUpperCase()} •{" "}
                      {jogA.find(
                        (j: { id: string; nome: string }) =>
                          j.id === e.jogadorId
                      )?.nome ?? e.jogadorId}
                      {e.minuto ? ` (${e.minuto}')` : ""}
                    </span>
                    <Button variant="ghost" onClick={() => removerEvt(e.id)}>
                      Remover
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Eventos — {nomeTimeB}</h4>
            <ul className="space-y-1 text-sm">
              {eventos
                .filter((e) => e.timeId === jogo.timeB)
                .map((e) => (
                  <li key={e.id} className="flex items-center justify-between">
                    <span>
                      {e.tipo.toUpperCase()} •{" "}
                      {jogB.find(
                        (j: { id: string; nome: string }) =>
                          j.id === e.jogadorId
                      )?.nome ?? e.jogadorId}
                      {e.minuto ? ` (${e.minuto}')` : ""}
                    </span>
                    <Button variant="ghost" onClick={() => removerEvt(e.id)}>
                      Remover
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
