"use client";

import { useMemo, useState } from "react";
import { useTimes } from "@/hooks/useTimes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { adicionarJogo } from "@/lib/firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { GRUPOS, Jogo } from "@/types";

type Par = { a?: string; b?: string; data?: string };

export function EditorConfrontosGrupo() {
  const { times } = useTimes();
  const [grupo, setGrupo] = useState<(typeof GRUPOS)[number] | "">("");
  const [confrontos, setConfrontos] = useState<Par[]>([{}, {}]); // Inicia com 2 confrontos
  const [salvando, setSalvando] = useState(false);
  const [idaVolta, setIdaVolta] = useState<"ida" | "ida-volta">("ida");

  const timesDoGrupo = useMemo(
    () => times.filter((t) => t.grupo === grupo),
    [times, grupo]
  );

  const handleChange = (idx: number, campo: keyof Par, valor: string) => {
    setConfrontos((prev) => {
      const novo = [...prev];
      novo[idx] = { ...novo[idx], [campo]: valor };
      return novo;
    });
  };

  const podeSalvar = useMemo(() => {
    if (!grupo) return false;
    return confrontos.every((p) => p.a && p.b && p.a !== p.b);
  }, [grupo, confrontos]);

  const salvar = async () => {
    if (!podeSalvar) return;
    setSalvando(true);
    try {
      for (const p of confrontos) {
        if (!p.a || !p.b) continue;
        const data = p.data ? new Date(p.data) : new Date();

        // Jogo de ida
        const payloadIda: Omit<Jogo, "id"> = {
          timeA: p.a,
          timeB: p.b,
          fase: "grupos",
          grupo: grupo as (typeof GRUPOS)[number],
          dataJogo: Timestamp.fromDate(data),
          finalizado: false,
          criadoEm: Timestamp.fromDate(new Date()),
        } as Omit<Jogo, "id">;
        await adicionarJogo(payloadIda);

        // Se for ida e volta, cria o jogo de volta (invertendo os times)
        if (idaVolta === "ida-volta") {
          const dataVolta = p.data ? new Date(p.data) : new Date();
          dataVolta.setDate(dataVolta.getDate() + 7); // Uma semana depois por padrão

          const payloadVolta: Omit<Jogo, "id"> = {
            timeA: p.b, // Inverte os times
            timeB: p.a,
            fase: "grupos",
            grupo: grupo as (typeof GRUPOS)[number],
            dataJogo: Timestamp.fromDate(dataVolta),
            finalizado: false,
            criadoEm: Timestamp.fromDate(new Date()),
          } as Omit<Jogo, "id">;
          await adicionarJogo(payloadVolta);
        }
      }
      const msg =
        idaVolta === "ida-volta"
          ? "Confrontos de ida e volta salvos!"
          : "Confrontos salvos!";
      alert(msg);
      setConfrontos([{}, {}]); // Reset para 2 confrontos
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar confrontos.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor manual de confrontos (fase de grupos)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label>Grupo</Label>
            <Select
              value={grupo}
              onValueChange={(v) => setGrupo(v as (typeof GRUPOS)[number])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo" />
              </SelectTrigger>
              <SelectContent>
                {GRUPOS.map((g) => (
                  <SelectItem value={g} key={g}>
                    Grupo {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo de confronto</Label>
            <Select
              value={idaVolta}
              onValueChange={(v) => setIdaVolta(v as "ida" | "ida-volta")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ida">Somente ida</SelectItem>
                <SelectItem value="ida-volta">Ida e volta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 text-sm text-gray-600">
            {idaVolta === "ida-volta"
              ? "🔄 Ida e volta: Cada confronto gerará 2 jogos. Ex: 2 confrontos = 4 jogos (A×B, B×A, C×D, D×C). Volta agendada 7 dias após."
              : "➡️ Somente ida: Cada confronto gera 1 jogo. Ex: 2 confrontos = 2 jogos (A×B, C×D)."}
          </div>
        </div>

        {confrontos.map((p, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
          >
            <div className="md:col-span-2">
              <Label>Time A</Label>
              <Select
                value={p.a ?? ""}
                onValueChange={(v) => handleChange(idx, "a", v)}
                disabled={!grupo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o time A" />
                </SelectTrigger>
                <SelectContent>
                  {timesDoGrupo.map((t) => (
                    <SelectItem value={t.id} key={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Time B</Label>
              <Select
                value={p.b ?? ""}
                onValueChange={(v) => handleChange(idx, "b", v)}
                disabled={!grupo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o time B" />
                </SelectTrigger>
                <SelectContent>
                  {timesDoGrupo.map((t) => (
                    <SelectItem value={t.id} key={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data e hora</Label>
              <Input
                type="datetime-local"
                value={p.data ?? ""}
                onChange={(e) => handleChange(idx, "data", e.target.value)}
                disabled={!grupo}
              />
            </div>
            <div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfrontos((prev) => prev.filter((_, i) => i !== idx));
                }}
                disabled={confrontos.length <= 1}
              >
                ❌
              </Button>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setConfrontos((c) => [...c, {}])}
          >
            + Adicionar confronto
          </Button>
          <Button
            onClick={salvar}
            disabled={!podeSalvar || salvando}
            className="bg-green-600 hover:bg-green-700"
          >
            {salvando ? "Salvando..." : "Salvar confrontos"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
