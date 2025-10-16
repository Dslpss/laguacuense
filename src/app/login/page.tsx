"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  // Se já está logado, redireciona para o dashboard
  useEffect(() => {
    if (usuario && !carregando) {
      router.push("/");
    }
  }, [usuario, carregando, router]);

  // Mostra loading enquanto verifica autenticação
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, mostra o formulário de login
  if (!usuario) {
    return <LoginForm />;
  }

  // Fallback enquanto redireciona
  return null;
}
