import { useEffect, useState } from "react";
import { Jogador } from "@/types";
import { db } from "@/lib/firebase/config";
import { collection, doc, getDoc } from "firebase/firestore";

export function useJogadoresPorIds(ids: string[], timeIds: string[]) {
  const [jogadores, setJogadores] = useState<Record<string, Jogador>>({});

  useEffect(() => {
    async function fetchJogadores() {
      const jogadoresMap: Record<string, Jogador> = {};
      for (let i = 0; i < ids.length; i++) {
        const jogadorId = ids[i];
        const timeId = timeIds[i];
        if (!jogadorId || !timeId) continue;
        const jogadorRef = doc(
          collection(db, "times", timeId, "jogadores"),
          jogadorId
        );
        const jogadorSnap = await getDoc(jogadorRef);
        if (jogadorSnap.exists()) {
          jogadoresMap[jogadorId] = jogadorSnap.data() as Jogador;
        }
      }
      setJogadores(jogadoresMap);
    }
    if (ids.length > 0 && timeIds.length > 0) fetchJogadores();
  }, [ids, timeIds]);

  return jogadores;
}
