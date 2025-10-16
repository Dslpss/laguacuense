import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

export type EventoTipo = "gol" | "amarelo" | "vermelho";

export interface EventoJogoBase {
  timeId: string;
  jogadorId: string;
  tipo: EventoTipo;
  minuto?: number;
}

export interface EventoJogo extends EventoJogoBase {
  id: string;
  criadoEm: Timestamp;
}

export async function adicionarEventoJogo(
  jogoId: string,
  evento: EventoJogoBase
): Promise<string> {
  // Remove campos undefined para evitar erro do Firestore
  const dadosEvento: Record<string, unknown> = {
    timeId: evento.timeId,
    jogadorId: evento.jogadorId,
    tipo: evento.tipo,
    criadoEm: Timestamp.now(),
  };

  // Só adiciona minuto se for fornecido
  if (evento.minuto !== undefined && evento.minuto !== null) {
    dadosEvento.minuto = evento.minuto;
  }

  const docRef = await addDoc(
    collection(db, "jogos", jogoId, "eventos"),
    dadosEvento
  );
  return docRef.id;
}

export function obterEventosJogo(
  jogoId: string,
  callback: (eventos: EventoJogo[]) => void
) {
  const q = query(
    collection(db, "jogos", jogoId, "eventos"),
    orderBy("criadoEm", "asc")
  );
  return onSnapshot(q, (snap) => {
    const itens = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EventoJogo, "id">),
    }));
    callback(itens);
  });
}

export async function removerEventoJogo(
  jogoId: string,
  eventoId: string
): Promise<void> {
  await deleteDoc(doc(db, "jogos", jogoId, "eventos", eventoId));
}
