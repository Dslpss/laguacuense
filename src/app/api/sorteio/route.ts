/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { dividirTimesEmGrupos } from "@/lib/sorteio";
import { salvarSorteio } from "@/lib/firebase/firestore";

export async function POST() {
  try {
    // Busca todos os times
    const timesSnapshot = await getDocs(collection(db, "times"));
    const times = timesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Verifica se há exatamente 16 times
    if (times.length !== 16) {
      return NextResponse.json(
        {
          erro: `É necessário ter exatamente 16 times. Atualmente há ${times.length} times.`,
        },
        { status: 400 }
      );
    }

    // Verifica se já existe sorteio
    const jaTemGrupo = times.some((time: any) => time.grupo);
    if (jaTemGrupo) {
      return NextResponse.json(
        { erro: "Os times já foram sorteados para os grupos." },
        { status: 400 }
      );
    }

    // Realiza o sorteio
    const grupos = dividirTimesEmGrupos(times);

    // Atualiza os times com seus respectivos grupos
    const updatePromises = [];

    for (const [grupo, timesDoGrupo] of Object.entries(grupos)) {
      for (const time of timesDoGrupo) {
        updatePromises.push(updateDoc(doc(db, "times", time.id), { grupo }));
      }
    }

    await Promise.all(updatePromises);

    // Salva o sorteio no histórico
    const gruposComIds = {
      A: grupos.A.map((t) => t.id),
      B: grupos.B.map((t) => t.id),
      C: grupos.C.map((t) => t.id),
      D: grupos.D.map((t) => t.id),
    };

    await salvarSorteio({
      tipo: "grupos",
      grupos: gruposComIds,
    } as any);

    return NextResponse.json({
      sucesso: true,
      grupos: {
        A: grupos.A.map((t) => ({ id: t.id, nome: t.nome })),
        B: grupos.B.map((t) => ({ id: t.id, nome: t.nome })),
        C: grupos.C.map((t) => ({ id: t.id, nome: t.nome })),
        D: grupos.D.map((t) => ({ id: t.id, nome: t.nome })),
      },
      mensagem: "Sorteio realizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro no sorteio:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor ao realizar sorteio" },
      { status: 500 }
    );
  }
}
