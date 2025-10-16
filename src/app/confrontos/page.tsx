"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HeaderAdmin } from "@/components/auth/HeaderAdmin";
import { useJogos } from "@/hooks/useJogos";
import { ConfrontoEditor } from "@/components/tournament/ConfrontoEditor";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConfrontosPage() {
  const { jogos } = useJogos();

  const conteudo = (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              ← Voltar
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Confrontos</h1>
          <p className="text-gray-600">
            Registre placares e eventos por jogador.
          </p>
        </div>

        <div className="space-y-4">
          {jogos.length === 0 ? (
            <p className="text-center text-gray-600">
              Nenhum jogo cadastrado ainda.
            </p>
          ) : (
            jogos.map((j) => <ConfrontoEditor key={j.id} jogo={j} />)
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <HeaderAdmin />
      {conteudo}
    </ProtectedRoute>
  );
}
