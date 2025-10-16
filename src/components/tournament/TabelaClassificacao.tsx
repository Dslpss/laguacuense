"use client";

import { useClassificacao } from "@/hooks/useClassificacao";
import { agruparClassificacaoPorGrupo } from "@/lib/classificacao";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function TabelaClassificacao() {
  const { classificacao, carregando } = useClassificacao();

  if (carregando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Classificação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Carregando classificação...
          </p>
        </CardContent>
      </Card>
    );
  }

  const grupos = agruparClassificacaoPorGrupo(classificacao);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Classificação Geral</CardTitle>
          <CardDescription>
            Classificação seguindo os critérios do Art. 46º do regulamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {["A", "B", "C", "D"].map((grupo) => {
              const timesDoGrupo = grupos[grupo] || [];

              return (
                <div key={grupo} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Grupo {grupo}</Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8 sticky left-0 bg-background">
                            #
                          </TableHead>
                          <TableHead className="sticky left-8 bg-background min-w-[120px]">
                            Time
                          </TableHead>
                          <TableHead className="text-center">P</TableHead>
                          <TableHead className="text-center hidden sm:table-cell">
                            J
                          </TableHead>
                          <TableHead className="text-center">V</TableHead>
                          <TableHead className="text-center hidden sm:table-cell">
                            E
                          </TableHead>
                          <TableHead className="text-center hidden sm:table-cell">
                            D
                          </TableHead>
                          <TableHead className="text-center hidden md:table-cell">
                            GM
                          </TableHead>
                          <TableHead className="text-center hidden md:table-cell">
                            GS
                          </TableHead>
                          <TableHead className="text-center">SG</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timesDoGrupo.map((time, index) => (
                          <TableRow key={time.timeId}>
                            <TableCell className="font-medium sticky left-0 bg-background">
                              {index + 1}
                              {index < 2 && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 text-xs"
                                >
                                  Q
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium sticky left-8 bg-background">
                              {time.nomeTime}
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              {time.pontos}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell">
                              {time.jogos}
                            </TableCell>
                            <TableCell className="text-center">
                              {time.vitorias}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell">
                              {time.empates}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell">
                              {time.derrotas}
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              {time.golsMarcados}
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              {time.golsSofridos}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={
                                  time.saldoGols >= 0
                                    ? "text-green-600 font-semibold"
                                    : "text-red-600 font-semibold"
                                }
                              >
                                {time.saldoGols > 0 ? "+" : ""}
                                {time.saldoGols}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-xs sm:text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Legenda:</strong> P = Pontos, J = Jogos, V = Vitórias, E =
              Empates, D = Derrotas, GM = Gols Marcados, GS = Gols Sofridos, SG
              = Saldo de Gols, Q = Qualificado
            </p>
            <p className="text-xs">
              <em>
                Nota: Em telas pequenas, algumas colunas ficam ocultas. Role
                horizontalmente para ver todas.
              </em>
            </p>
            <p className="mt-2">
              <strong>Critérios de desempate:</strong> 1º Pontos, 2º Vitórias,
              3º Saldo de gols, 4º Gols marcados, 5º Gols sofridos, 6º Derrotas,
              7º Cartões vermelhos, 8º Cartões amarelos, 9º Sorteio
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
