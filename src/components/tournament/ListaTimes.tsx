"use client";

import { useTimes } from "@/hooks/useTimes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ListaTimes() {
  const { times, carregando, erro } = useTimes();

  if (carregando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Times Inscritos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Carregando times...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (erro) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Times Inscritos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">Erro ao carregar times</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Times Inscritos</CardTitle>
        <CardDescription>
          Total: {times.length} times
          {times.length === 16 && (
            <Badge variant="secondary" className="ml-2">
              Pronto para sorteio!
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {times.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum time cadastrado ainda
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {times.map((time) => (
              <Card key={time.id} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{time.nome}</h3>
                  <p className="text-sm text-muted-foreground">{time.cidade}</p>
                  {time.grupo && (
                    <Badge variant="outline">Grupo {time.grupo}</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
