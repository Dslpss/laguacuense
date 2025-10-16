import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  calcularClassificacao,
  agruparClassificacaoPorGrupo,
  obterClassificadosParaSemifinais,
} from "@/lib/classificacao";
import { Jogo, Time } from "@/types";

export async function GET() {
  try {
    // Busca times e jogos
    const [timesSnapshot, jogosSnapshot] = await Promise.all([
      getDocs(collection(db, "times")),
      getDocs(collection(db, "jogos")),
    ]);

    const times = timesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Time[];

    const jogos = jogosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Jogo[];

    // Calcula classificação
    const classificacao = calcularClassificacao(jogos, times);
    const grupos = agruparClassificacaoPorGrupo(classificacao);
    const { primeiros, segundos } =
      obterClassificadosParaSemifinais(classificacao);

    return NextResponse.json({
      classificacao,
      grupos,
      semifinalistas: {
        primeiros,
        segundos,
      },
    });
  } catch (error) {
    console.error("Erro ao calcular classificação:", error);
    return NextResponse.json(
      { erro: "Erro interno do servidor ao calcular classificação" },
      { status: 500 }
    );
  }
}
