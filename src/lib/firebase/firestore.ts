import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  getDocs,
  writeBatch,
  deleteField,
} from "firebase/firestore";
import { db } from "./config";
import { Time, Jogador, Jogo, Sorteio } from "@/types";

// Funções para Times
export const adicionarTime = async (time: {
  nome: string;
  cidade: string;
  grupo?: "A" | "B" | "C" | "D";
}) => {
  try {
    const docRef = await addDoc(collection(db, "times"), {
      ...time,
      criadoEm: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar time:", error);
    throw error;
  }
};

export const obterTimes = (callback: (times: Time[]) => void) => {
  const q = query(collection(db, "times"), orderBy("nome"));
  return onSnapshot(q, (snapshot) => {
    const times = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Time[];
    callback(times);
  });
};

export const atualizarTime = async (id: string, dados: Partial<Time>) => {
  try {
    await updateDoc(doc(db, "times", id), dados);
  } catch (error) {
    console.error("Erro ao atualizar time:", error);
    throw error;
  }
};

export const excluirTime = async (id: string) => {
  try {
    await deleteDoc(doc(db, "times", id));
  } catch (error) {
    console.error("Erro ao excluir time:", error);
    throw error;
  }
};

// Remove o time e todos os jogadores da sua subcoleção
export const removerTime = async (id: string) => {
  try {
    const batch = writeBatch(db);

    // Deleta todos os jogadores do time (subcoleção)
    const jogadoresSnap = await getDocs(
      collection(db, "times", id, "jogadores")
    );
    jogadoresSnap.forEach((jogadorDoc) => {
      batch.delete(jogadorDoc.ref);
    });

    // Deleta o documento do time
    batch.delete(doc(db, "times", id));

    await batch.commit();
  } catch (error) {
    console.error("Erro ao remover time e subcoleções:", error);
    throw error;
  }
};

// Funções para Jogadores (subcoleção)
export const adicionarJogador = async (
  timeId: string,
  jogador: Omit<Jogador, "id" | "criadoEm">
) => {
  try {
    const docRef = await addDoc(collection(db, "times", timeId, "jogadores"), {
      ...jogador,
      criadoEm: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar jogador:", error);
    throw error;
  }
};

export const obterJogadores = (
  timeId: string,
  callback: (jogadores: Jogador[]) => void
) => {
  const q = query(
    collection(db, "times", timeId, "jogadores"),
    orderBy("nome")
  );
  return onSnapshot(q, (snapshot) => {
    const jogadores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Jogador[];
    callback(jogadores);
  });
};

// Funções para Jogos
export const adicionarJogo = async (jogo: Omit<Jogo, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "jogos"), {
      ...jogo,
      criadoEm: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar jogo:", error);
    throw error;
  }
};

export const obterJogos = (callback: (jogos: Jogo[]) => void) => {
  const q = query(collection(db, "jogos"), orderBy("dataJogo"));
  return onSnapshot(q, (snapshot) => {
    const jogos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Jogo[];
    callback(jogos);
  });
};

export const atualizarJogo = async (id: string, dados: Partial<Jogo>) => {
  try {
    await updateDoc(doc(db, "jogos", id), dados);
  } catch (error) {
    console.error("Erro ao atualizar jogo:", error);
    throw error;
  }
};

// Utilitário: limpar grupos de todos os times (remove o campo 'grupo')
export const limparGruposDeTodosTimes = async () => {
  try {
    const snap = await getDocs(collection(db, "times"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      const data = d.data();
      if (data && "grupo" in data && data.grupo) {
        batch.update(d.ref, { grupo: deleteField() });
      }
    });
    await batch.commit();
  } catch (error) {
    console.error("Erro ao limpar grupos dos times:", error);
    throw error;
  }
};

// Funções para Sorteios
export const salvarSorteio = async (sorteio: Omit<Sorteio, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "sorteios"), {
      ...sorteio,
      criadoEm: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar sorteio:", error);
    throw error;
  }
};

export const obterSorteios = (callback: (sorteios: Sorteio[]) => void) => {
  const q = query(collection(db, "sorteios"), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snapshot) => {
    const sorteios = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Sorteio[];
    callback(sorteios);
  });
};
