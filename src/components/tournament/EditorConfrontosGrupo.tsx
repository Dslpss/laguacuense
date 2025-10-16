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
  const [confrontos, setConfrontos] = useState<Par[]>([{}, {}, {}, {}]);
  const [salvando, setSalvando] = useState(false);

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
        const payload: Omit<Jogo, "id"> = {
          timeA: p.a,
          timeB: p.b,
          fase: "grupos",
          grupo: grupo as (typeof GRUPOS)[number],
          dataJogo: Timestamp.fromDate(data),
          finalizado: false,
          criadoEm: Timestamp.fromDate(new Date()), // será sobrescrito no backend com now(), mas mantém o tipo
        } as Omit<Jogo, "id">;

        // adicionarJogo ignora 'criadoEm' e seta server-side; passamos para satisfazer o tipo local
        await adicionarJogo(payload);
      }
      alert("Confrontos salvos!");
      setConfrontos([{}, {}, {}, {}]);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
          <div className="md:col-span-2 text-sm text-gray-600">
            Selecione dois times para cada confronto e, opcionalmente, uma
            data/hora.
          </div>
        </div>

        {confrontos.map((p, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
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
