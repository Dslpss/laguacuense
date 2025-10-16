"use client";

import { useState } from "react";
import Image from "next/image";
import { adicionarTime } from "@/lib/firebase/firestore";
import { uploadLogo } from "@/lib/firebase/storage";
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
  const [grupo, setGrupo] = useState<"A" | "B" | "C" | "D" | "">("");
  const [logo, setLogo] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !cidade.trim()) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    setCarregando(true);

    try {
      let logoUrl = "";
      if (logo) {
        // Upload real para Firebase Storage
        // O id do time só existe após adicionar, então salva sem logo, depois atualiza
        const novoTime = {
          nome: nome.trim(),
          cidade: cidade.trim(),
          ...(grupo ? { grupo } : {}),
        };
        const timeId = await adicionarTime(novoTime);
        logoUrl = await uploadLogo(logo, timeId);
        // Atualiza o time com a URL da logo
        const { atualizarTime } = await import("@/lib/firebase/firestore");
        await atualizarTime(timeId, { logoUrl });
      } else {
        await adicionarTime({
          nome: nome.trim(),
          cidade: cidade.trim(),
          ...(grupo ? { grupo } : {}),
        });
      }

      // Limpa o formulário
      setNome("");
      setCidade("");
      setGrupo("");
      setLogo(null);

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
            <Label htmlFor="logo">Logo do Time (opcional)</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setLogo(e.target.files[0]);
                  } else {
                    setLogo(null);
                  }
                }}
                disabled={carregando}
                className="flex-1"
              />
              {logo && (
                <div className="shrink-0">
                  <Image
                    src={URL.createObjectURL(logo)}
                    alt="Prévia da logo"
                    width={64}
                    height={64}
                    className="object-contain rounded border bg-white"
                    style={{ maxWidth: "64px", maxHeight: "64px" }}
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
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

          <div className="space-y-2">
            <Label htmlFor="grupo">Grupo (opcional)</Label>
            <Select
              value={grupo}
              onValueChange={(v: "A" | "B" | "C" | "D") => setGrupo(v)}
            >
              <SelectTrigger id="grupo">
                <SelectValue placeholder="Selecione um grupo (A-D)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Grupo A</SelectItem>
                <SelectItem value="B">Grupo B</SelectItem>
                <SelectItem value="C">Grupo C</SelectItem>
                <SelectItem value="D">Grupo D</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={carregando} className="w-full">
            {carregando ? "Adicionando..." : "Adicionar Time"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
