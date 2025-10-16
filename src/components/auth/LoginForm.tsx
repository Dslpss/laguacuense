"use client";

import { useState } from "react";
import { fazerLogin } from "@/lib/firebase/auth";
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
import { Trophy, Users } from "lucide-react";

interface LoginFormProps {
  onLoginSucesso?: () => void;
}

export function LoginForm({ onLoginSucesso }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      setErro("Por favor, preencha todos os campos");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      await fazerLogin(email.trim(), senha);
      if (onLoginSucesso) {
        onLoginSucesso();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setErro(errorMessage);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full max-w-md p-6">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campeonato Lagoacuense
          </h1>
          <p className="text-gray-600 mt-2">Sistema de Gerenciamento 2025</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login Administrativo</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {erro}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  disabled={carregando}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={carregando}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Sistema restrito aos organizadores do campeonato
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
