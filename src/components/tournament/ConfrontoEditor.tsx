"use client";

import { useEffect, useMemo, useState } from "react";
import { Jogo } from "@/types";
import { useTimes } from "@/hooks/useTimes";
import { useJogadores } from "../../hooks/useJogadores";
import { atualizarJogo, removerJogo } from "@/lib/firebase/firestore";
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
  const [mostrarEventos, setMostrarEventos] = useState(false);

  // Estados para edição de data/hora
  const [editandoData, setEditandoData] = useState(false);
  const [novaData, setNovaData] = useState<string>(() => {
    if (jogo.dataJogo?.toDate) {
      const d = jogo.dataJogo.toDate();
      return d.toISOString().split("T")[0];
    }
    // Data padrão: hoje
    return new Date().toISOString().split("T")[0];
  });
  const [novaHora, setNovaHora] = useState<string>(() => {
    if (jogo.dataJogo?.toDate) {
      const d = jogo.dataJogo.toDate();
      const horas = d.getHours().toString().padStart(2, "0");
      const mins = d.getMinutes().toString().padStart(2, "0");
      return `${horas}:${mins}`;
    }
    // Hora padrão: 15:30
    return "15:30";
  });
  const [salvandoData, setSalvandoData] = useState(false);
  const [erroData, setErroData] = useState<string | null>(null);
  const [sucessoData, setSucessoData] = useState(false);

  useEffect(() => {
    const unsub = obterEventosJogo(jogo.id, (ev) =>
      setEventos(ev as unknown as Evento[])
    );
    return () => unsub();
  }, [jogo.id]);

  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  const salvarDataHora = async () => {
    if (!novaData || !novaHora) {
      setErroData("Preencha data e hora");
      return;
    }
    setSalvandoData(true);
    setErroData(null);
    setSucessoData(false);
    try {
      const [ano, mes, dia] = novaData.split("-").map(Number);
      const [hora, minutoData] = novaHora.split(":").map(Number);
      const dataCompleta = new Date(ano, mes - 1, dia, hora, minutoData);

      console.log("Salvando data/hora:", {
        novaData,
        novaHora,
        dataCompleta,
        jogoId: jogo.id,
      });

      await atualizarJogo(jogo.id, {
        dataJogo: Timestamp.fromDate(dataCompleta),
      });

      setSucessoData(true);
      setTimeout(() => {
        setEditandoData(false);
        setSucessoData(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao salvar data/hora:", error);
      setErroData("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvandoData(false);
    }
  };

  const salvarPlacar = async () => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      await atualizarJogo(jogo.id, {
        golsTimeA: Number(golsA),
        golsTimeB: Number(golsB),
        finalizado: true,
      });
      setSalvo(true);
    } catch {
      setErroSalvar("Erro ao salvar placar");
    } finally {
      setSalvando(false);
    }
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

  const removerConfrontoCompleto = async () => {
    if (
      confirm(
        `Tem certeza que deseja remover este confronto?\n${nomeTimeA} × ${nomeTimeB}`
      )
    ) {
      try {
        await removerJogo(jogo.id);
        alert("Confronto removido com sucesso!");
      } catch (error) {
        console.error(error);
        alert("Erro ao remover confronto.");
      }
    }
  };

  const nomeTimeA = timeA?.nome ?? jogo.timeA;
  const nomeTimeB = timeB?.nome ?? jogo.timeB;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 flex-wrap break-words">
            {nomeTimeA} × {nomeTimeB}{" "}
            {jogo.grupo ? `• Grupo ${jogo.grupo}` : ""}
            {jogo.finalizado && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Finalizado
              </span>
            )}
          </CardTitle>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {!editandoData ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {jogo.dataJogo?.toDate?.()?.toLocaleString?.("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) || "Data não definida"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => setEditandoData(true)}>
                  ✏️ Editar
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="w-36 h-8 text-sm"
                  />
                  <Input
                    type="time"
                    value={novaHora}
                    onChange={(e) => setNovaHora(e.target.value)}
                    className="w-28 h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    className={`h-8 px-3 ${
                      sucessoData
                        ? "bg-green-500"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={salvarDataHora}
                    disabled={salvandoData || !novaData || !novaHora}>
                    {salvandoData
                      ? "Salvando..."
                      : sucessoData
                      ? "✓ Salvo!"
                      : "✓ Salvar"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setEditandoData(false);
                      setErroData(null);
                    }}>
                    ✕
                  </Button>
                </div>
                {erroData && (
                  <span className="text-red-500 text-xs">{erroData}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="destructive"
          className="h-10 px-4"
          onClick={removerConfrontoCompleto}>
          🗑️ Remover confronto
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <Label className="mb-1 leading-tight">{nomeTimeA} (gols)</Label>
            <Input
              type="number"
              min={0}
              value={golsA}
              onChange={(e) => setGolsA(Number(e.target.value))}
              disabled={salvo}
            />
          </div>
          <div>
            <Label className="mb-1 leading-tight">{nomeTimeB} (gols)</Label>
            <Input
              type="number"
              min={0}
              value={golsB}
              onChange={(e) => setGolsB(Number(e.target.value))}
              disabled={salvo}
            />
          </div>
          <div className="md:col-span-2 text-sm text-green-700">
            Atualize o placar e salve. Os eventos abaixo não alteram
            automaticamente o placar (flexível para W.O., correções etc.).
          </div>
          <div className="space-y-2">
            <Button
              className="w-full h-10"
              onClick={salvarPlacar}
              disabled={salvando || salvo}>
              {salvando
                ? "Salvando..."
                : salvo
                ? "Placar salvo"
                : "Salvar placar"}
            </Button>
            {jogo.finalizado && (
              <Button
                className="w-full h-10"
                onClick={async () => {
                  try {
                    await atualizarJogo(jogo.id, { finalizado: false });
                    setSalvo(false);
                  } catch {
                    setErroSalvar("Erro ao reabrir jogo para edição");
                  }
                }}
                variant="outline">
                Reabrir para edição
              </Button>
            )}
            {erroSalvar && (
              <div className="text-red-600 mt-2 text-sm">{erroSalvar}</div>
            )}
            {salvo && !erroSalvar && (
              <div className="text-green-600 mt-2 text-sm">
                Placar salvo com sucesso!
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <Label className="mb-1 leading-tight">Time</Label>
            <Select value={lado} onValueChange={(v) => setLado(v as "A" | "B")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">{nomeTimeA}</SelectItem>
                <SelectItem value="B">{nomeTimeB}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 leading-tight">Evento</Label>
            <Select
              value={tipoEvento}
              onValueChange={(v) => setTipoEvento(v as EventoTipo)}>
              <SelectTrigger className="w-full">
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
            <Label className="mb-1 leading-tight">Jogador</Label>
            <Select value={jogadorId} onValueChange={(v) => setJogadorId(v)}>
              <SelectTrigger className="w-full">
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
            <Label className="mb-1 leading-tight">Minuto (opcional)</Label>
            <Input
              type="number"
              min={0}
              max={120}
              value={minuto}
              onChange={(e) => setMinuto(e.target.value)}
            />
          </div>
          <div>
            <Button className="w-full h-10" onClick={adicionarEvento}>
              Adicionar evento
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg">Eventos do confronto</h4>
            <Button
              variant="outline"
              onClick={() => setMostrarEventos((v) => !v)}
              className="h-10 px-4 gap-2">
              {mostrarEventos
                ? "Ocultar eventos"
                : `Mostrar eventos (${eventos.length})`}
            </Button>
          </div>
          {mostrarEventos && (
            <ul className="space-y-2 text-sm">
              {eventos.length === 0 ? (
                <li className="text-gray-400">
                  Nenhum evento adicionado ainda.
                </li>
              ) : (
                eventos
                  .sort((a, b) => (a.minuto ?? 0) - (b.minuto ?? 0))
                  .map((e) => {
                    const jogador = [...jogA, ...jogB].find(
                      (j) => j.id === e.jogadorId
                    );
                    const timeNome =
                      e.timeId === jogo.timeA ? nomeTimeA : nomeTimeB;
                    let tipoLabel = "";
                    if (e.tipo === "gol") tipoLabel = "Gol";
                    else if (e.tipo === "amarelo") tipoLabel = "Cartão amarelo";
                    else if (e.tipo === "vermelho")
                      tipoLabel = "Cartão vermelho";
                    return (
                      <li
                        key={e.id}
                        className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
                        <span>
                          <span
                            className={`font-bold mr-2 ${
                              e.tipo === "gol"
                                ? "text-green-400"
                                : e.tipo === "amarelo"
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}>
                            {tipoLabel}
                          </span>
                          <span className="font-medium text-white">
                            {jogador?.nome ?? e.jogadorId}
                          </span>
                          {e.minuto ? (
                            <span className="ml-2 text-blue-300">
                              ({e.minuto}&#39;)
                            </span>
                          ) : null}
                          <span className="ml-2 text-xs text-gray-400">
                            [{timeNome}]
                          </span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerEvt(e.id)}>
                          Remover
                        </Button>
                      </li>
                    );
                  })
              )}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
