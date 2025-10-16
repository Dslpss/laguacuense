"use client";

import { useState, useEffect } from "react";
import { observarAutenticacao } from "@/lib/firebase/auth";
import { User } from "firebase/auth";

/**
 * Hook para gerenciar o estado de autenticação
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = observarAutenticacao((user) => {
      setUsuario(user);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  return { usuario, carregando, estaLogado: !!usuario };
}
