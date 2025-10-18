"use client";

import { fazerLogout } from "@/lib/firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function HeaderAdmin() {
  const { usuario } = useAuth();

  const handleLogout = async () => {
    try {
      await fazerLogout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (!usuario) return null;

  return (
    <header className="bg-blue-900/95 backdrop-blur-sm border-b-4 border-blue-500/60 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-3 sm:py-0 gap-2 sm:gap-0">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-white drop-shadow-lg text-center sm:text-left">
              Painel Administrativo
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-none">
                {usuario.email}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 border-blue-400/50 bg-blue-800/80 text-white hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
