"use client";

import { useState } from "react";
import { useTimes } from "@/hooks/useTimes";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ListaTimesPublica() {
  const { times, carregando, erro } = useTimes();
  const [gruposExpandidos, setGruposExpandidos] = useState<Record<string, boolean>>({
    A: true,
    B: false,
    C: false,
    D: false,
    "Sem Grupo": false,
  });

  const toggleGrupo = (grupo: string) => {
    setGruposExpandidos(prev => ({
      ...prev,
      [grupo]: !prev[grupo]
    }));
  };

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

  // Agrupar times por grupo
  const timesPorGrupo = times.reduce((acc, time) => {
    const grupo = time.grupo || "Sem Grupo";
    if (!acc[grupo]) {
      acc[grupo] = [];
    }
    acc[grupo].push(time);
    return acc;
  }, {} as Record<string, typeof times>);

  const grupos = ["A", "B", "C", "D"].filter((g) => timesPorGrupo[g]);
  const timesSemGrupo = timesPorGrupo["Sem Grupo"] || [];

  return (
    <div className="space-y-8">
      {/* Times por Grupo */}
      {grupos.map((grupo) => (
        <div
          key={grupo}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-b border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 px-5 py-2 rounded-xl shadow-lg">
                  <span className="text-white font-bold text-xl">
                    Grupo {grupo}
                  </span>
                </div>
                <span className="text-green-100 font-medium">
                  {timesPorGrupo[grupo].length} times
                </span>
              </div>
              <button
                onClick={() => toggleGrupo(grupo)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium"
              >
                {gruposExpandidos[grupo] ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Encolher
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Expandir
                  </>
                )}
              </button>
            </div>
          </div>
          {gruposExpandidos[grupo] && (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {timesPorGrupo[grupo].map((time) => (
                <div
                  key={time.id}
                  className="group bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl border-2 border-blue-700/40 shadow-lg hover:shadow-2xl hover:scale-105 transition-all p-5"
                >
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-4">
                      {time.logoUrl ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-700/40 to-blue-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                          <div className="relative bg-slate-900 p-3 rounded-2xl border-2 border-blue-700/40 shadow-md">
                            <Image
                              src={time.logoUrl}
                              alt={"Logo de " + time.nome}
                              width={64}
                              height={64}
                              className="object-contain rounded-lg"
                              style={{ maxWidth: "64px", maxHeight: "64px" }}
                              unoptimized
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-slate-600 text-xs text-slate-400 font-medium shadow-inner">
                          Sem logo
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="font-bold text-lg text-green-100 group-hover:text-green-400 transition-colors">
                          {time.nome}
                        </h3>
                        <p className="text-sm text-green-300 font-medium flex items-center justify-center gap-1 mt-1">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {time.cidade}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Times sem grupo */}
      {timesSemGrupo.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <svg
                    className="h-6 w-6 text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-white">
                    Times Aguardando Sorteio
                  </h3>
                </div>
                <p className="text-yellow-100 text-sm pl-9">
                  Estes times ainda não foram sorteados em grupos
                </p>
              </div>
              <button
                onClick={() => toggleGrupo("Sem Grupo")}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium"
              >
                {gruposExpandidos["Sem Grupo"] ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Encolher
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Expandir
                  </>
                )}
              </button>
            </div>
          </div>
          {gruposExpandidos["Sem Grupo"] && (
            <div className="p-6">
              {times.length === 0 ? (
                <p className="text-center text-green-200 py-8">
                  Nenhum time cadastrado ainda
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {timesSemGrupo.map((time) => (
                  <div
                    key={time.id}
                    className="group bg-gradient-to-br from-slate-900 via-yellow-950 to-slate-900 rounded-xl border-2 border-yellow-700/40 shadow-lg hover:shadow-2xl hover:scale-105 transition-all p-5"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-4">
                        {time.logoUrl ? (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-700/40 to-orange-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative bg-slate-900 p-3 rounded-2xl border-2 border-yellow-700/40 shadow-md">
                              <Image
                                src={time.logoUrl}
                                alt={"Logo de " + time.nome}
                                width={64}
                                height={64}
                                className="object-contain rounded-lg"
                                style={{ maxWidth: "64px", maxHeight: "64px" }}
                                unoptimized
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 w-20 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-slate-600 text-xs text-slate-400 font-medium shadow-inner">
                            Sem logo
                          </div>
                        )}
                        <div className="text-center">
                          <h3 className="font-bold text-lg text-yellow-100 group-hover:text-yellow-400 transition-colors">
                            {time.nome}
                          </h3>
                          <p className="text-sm text-yellow-300 font-medium flex items-center justify-center gap-1 mt-1">
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {time.cidade}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
