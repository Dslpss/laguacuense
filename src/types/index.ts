import { Timestamp } from "firebase/firestore";

export interface Time {
  id: string;
  nome: string;
  cidade: string;
  grupo?: "A" | "B" | "C" | "D";
  logoUrl?: string;
  criadoEm: Timestamp;
}

export interface Jogador {
  id: string;
  nome: string;
  posicao: string;
  numero: number;
  idade?: number;
  cpf?: string;
  criadoEm: Timestamp;
}

export interface Jogo {
  id: string;
  timeA: string; // ID do time
  timeB: string; // ID do time
  golsTimeA?: number;
  golsTimeB?: number;
  cartoesAmarelosTimeA?: number;
  cartoesVermelhoTimeA?: number;
  cartoesAmarelosTimeB?: number;
  cartoesVermelhoTimeB?: number;
  fase: "grupos" | "quartas" | "semifinal" | "final";
  grupo?: "A" | "B" | "C" | "D";
  dataJogo: Timestamp;
  finalizado: boolean;
  criadoEm: Timestamp;
}

export interface Sorteio {
  id: string;
  tipo: "grupos" | "quartas" | "semifinais" | "final";
  grupos?: {
    A: string[]; // IDs dos times
    B: string[];
    C: string[];
    D: string[];
  };
  quartas?: {
    jogo1: { time1: string; time2: string };
    jogo2: { time1: string; time2: string };
    jogo3: { time1: string; time2: string };
    jogo4: { time1: string; time2: string };
  };
  semifinais?: {
    jogo1: { time1: string; time2: string };
    jogo2: { time1: string; time2: string };
  };
  final?: {
    jogo1: { time1: string; time2: string };
  };
  manual?: boolean; // Indica se o sorteio foi feito manualmente
  criadoEm: Timestamp;
}

export interface ClassificacaoTime {
  timeId: string;
  nomeTime: string;
  grupo: "A" | "B" | "C" | "D";
  pontos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsMarcados: number;
  golsSofridos: number;
  saldoGols: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
  jogos: number;
}

// Enums úteis
export const GRUPOS = ["A", "B", "C", "D"] as const;
export const FASES = ["grupos", "quartas", "semifinal", "final"] as const;
