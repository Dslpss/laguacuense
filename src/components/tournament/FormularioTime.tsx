"use client";

import { useState } from "react";
import { adicionarTime } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FormularioTime() {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !cidade.trim()) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    setCarregando(true);

    try {
      await adicionarTime({
        nome: nome.trim(),
        cidade: cidade.trim(),
      });

      // Limpa o formulário
      setNome("");
      setCidade("");

      alert("Time adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar time:", error);
      alert("Erro ao adicionar time. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Novo Time</CardTitle>
        <CardDescription>
          Cadastre um novo time para o Campeonato Lagoacuense 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Time</Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Boca Jr"
              disabled={carregando}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Arsenal"
              disabled={carregando}
            />
          </div>

          <Button type="submit" disabled={carregando} className="w-full">
            {carregando ? "Adicionando..." : "Adicionar Time"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
