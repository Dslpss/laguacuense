"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "./LoginForm";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente que protege rotas, exigindo autenticação
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { usuario, carregando } = useAuth();

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

  // Se está logado, mostra o conteúdo protegido
  return <>{children}</>;
}
