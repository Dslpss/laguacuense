"use client";

import { useState } from "react";
import Image from "next/image";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMDkgMS43OTEtNCA0LTRzNCAxLjc5MSA0IDQtMS43OTEgNC00IDQtNC0xLjc5MS00LTR6bTAgMjRjMC0yLjIwOSAxLjc5MS00IDQtNHM0IDEuNzkxIDQgNC0xLjc5MSA0LTQgNC00LTEuNzkxLTQtNHptLTI0IDRjLTIuMjA5IDAtNC0xLjc5MS00LTRzMS43OTEtNCA0LTQgNCAxLjc5MSA0IDQtMS43OTEgNC00IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="w-full max-w-md p-6 relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Trophy className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
              <div className="absolute inset-0 blur-xl bg-yellow-400 opacity-50"></div>
            </div>
            <div className="relative">
              <Users className="h-12 w-12 text-green-400 drop-shadow-lg" />
              <div className="absolute inset-0 blur-xl bg-green-400 opacity-50"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Campeonato Lagoacuense
          </h1>
          <p className="text-green-200 font-medium">
            Sistema de Gerenciamento 2025
          </p>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-center text-base">
              Entre com suas credenciais para gerenciar o campeonato
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {erro && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r shadow-sm">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{erro}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  E-mail Institucional
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  disabled={carregando}
                  required
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="senha"
                  className="text-sm font-semibold text-gray-700"
                >
                  Senha de Acesso
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••••"
                  disabled={carregando}
                  required
                  className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={carregando}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-base"
              >
                {carregando ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Autenticando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Entrar no Sistema</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium">
                  Acesso restrito aos organizadores do campeonato
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer com imagem */}
        <div className="flex justify-center mt-8 opacity-90 hover:opacity-100 transition-opacity">
          <Image
            src="/SECRETARIAS.zip - 17.png"
            alt="Liga Esportiva Lagoacuense - Diretor de Esportes: Christiano Texeira dos Santos"
            width={450}
            height={75}
            className="object-contain max-w-full h-auto drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
