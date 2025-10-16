"use client";

import { useEffect, useMemo, useState } from "react";
import {
  obterSorteios,
  limparGruposDeTodosTimes,
} from "@/lib/firebase/firestore";
import { Sorteio } from "@/types";
import { useTimes } from "@/hooks/useTimes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timestamp as FBTimestamp } from "firebase/firestore";
import { EditorConfrontosGrupo } from "./EditorConfrontosGrupo";

export function Sorteios() {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [carregandoSorteio, setCarregandoSorteio] = useState(false);
  const { times } = useTimes();

  useEffect(() => {
    const unsubscribe = obterSorteios((itens) => setSorteios(itens));
    return () => unsubscribe();
  }, []);

  const timesPorId = useMemo(() => {
    const map = new Map<string, string>();
    times.forEach((t) => map.set(t.id, t.nome));
    return map;
  }, [times]);

  const podeSortearGrupos = useMemo(() => {
    return times.length === 16 && !times.some((t) => t.grupo);
  }, [times]);

  const temGruposDefinidos = useMemo(() => times.some((t) => t.grupo), [times]);

  const realizarSorteio = async () => {
    if (!podeSortearGrupos) return;
    setCarregandoSorteio(true);
    try {
      const resp = await fetch("/api/sorteio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await resp.json();
      if (resp.ok) {
        alert("Sorteio realizado com sucesso!");
        console.log("Grupos:", data.grupos);
      } else {
        alert(data.erro || "Erro ao realizar sorteio");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao realizar sorteio. Tente novamente.");
    } finally {
      setCarregandoSorteio(false);
    }
  };

  const renderGrupos = (grupos: NonNullable<Sorteio["grupos"]>) => {
    const ordem: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ordem.map((g) => (
          <Card key={g}>
            <CardHeader>
              <CardTitle>Grupo {g}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {grupos[g].map((timeId) => (
                  <li key={timeId}>{timesPorId.get(timeId) ?? timeId}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderSemifinais = (semi: NonNullable<Sorteio["semifinais"]>) => {
    const nome = (id: string) => timesPorId.get(id) ?? id;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Semifinal 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {nome(semi.jogo1.time1)} × {nome(semi.jogo1.time2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Semifinal 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {nome(semi.jogo2.time1)} × {nome(semi.jogo2.time2)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Sorteios</h2>
          <p className="text-sm text-gray-600">
            Histórico de sorteios e distribuição dos grupos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={realizarSorteio}
            disabled={!podeSortearGrupos || carregandoSorteio}
            className="bg-green-600 hover:bg-green-700"
          >
            {carregandoSorteio ? "Realizando sorteio..." : "🎲 Sortear grupos"}
          </Button>
          {temGruposDefinidos && (
            <Button
              variant="outline"
              onClick={async () => {
                if (
                  !confirm(
                    "Isso vai remover o grupo de todos os times. Continuar?"
                  )
                )
                  return;
                try {
                  await limparGruposDeTodosTimes();
                  alert(
                    "Grupos removidos. Agora é possível realizar o sorteio."
                  );
                } catch (e) {
                  console.error(e);
                  alert("Não foi possível remover os grupos. Tente novamente.");
                }
              }}
            >
              Limpar grupos
            </Button>
          )}
        </div>
      </div>

      {/* Regras do sorteio */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Regras do Sorteio</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>
              Os grupos podem ser definidos manualmente no cadastro do time
              (campo &quot;Grupo&quot;) ou por sorteio automático.
            </li>
            <li>
              Para realizar o sorteio automático, deve haver exatamente 16 times
              e nenhum deles pode ter grupo já definido.
            </li>
            <li>
              Se os grupos já estiverem definidos manualmente, use a opção
              &quot;Limpar grupos&quot; para remover os grupos atuais antes de
              sortear.
            </li>
            <li>
              O sorteio distribui automaticamente os 16 times em 4 grupos (A, B,
              C e D), com 4 times em cada grupo.
            </li>
            <li>
              Após o sorteio, os grupos são gravados no banco e o histórico fica
              visível nesta página com data e hora.
            </li>
            <li>
              Somente usuários autenticados (admin) podem realizar e registrar
              sorteios.
            </li>
            <li>
              Classificação: avançam os 2 melhores de cada grupo para a fase
              seguinte (8 equipes no total).
            </li>
            <li>
              As semifinais serão definidas por um novo sorteio entre os
              classificados, conforme regulamento.
            </li>
            <li>
              Transparência: todas as composições de grupos e sorteios ficam
              disponíveis para consulta pública.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Editor manual de confrontos da fase de grupos */}
      <EditorConfrontosGrupo />

      {sorteios.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-gray-600">
              Nenhum sorteio registrado ainda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sorteios.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">
                  {s.tipo === "grupos"
                    ? "Sorteio de grupos"
                    : "Sorteio das semifinais"}
                </CardTitle>
                <Badge variant="secondary">
                  {(s.criadoEm instanceof FBTimestamp
                    ? s.criadoEm.toDate()
                    : new Date(String(s.criadoEm))
                  ).toLocaleString()}
                </Badge>
              </CardHeader>
              <CardContent>
                {s.tipo === "grupos" && s.grupos && renderGrupos(s.grupos)}
                {s.tipo === "semifinais" &&
                  s.semifinais &&
                  renderSemifinais(s.semifinais)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
