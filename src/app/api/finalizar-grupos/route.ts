import { NextResponse } from "next/server";
import { 
  adicionarJogo, 
  salvarSorteio 
} from "@/lib/firebase/firestore";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Time, Jogo } from "@/types";
import { 
  verificarFaseGruposCompleta,
  verificarClassificadosSuficientes,
  gerarConfrontosQuartas,
  obterResumoClassificados
} from "@/lib/finalizacao-grupos";
import { Timestamp } from "firebase/firestore";

// Função auxiliar para obter times
async function obterTimes(): Promise<Time[]> {
  const q = query(collection(db, "times"), orderBy("nome"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Time[];
}

// Função auxiliar para obter jogos
async function obterJogos(): Promise<Jogo[]> {
  const q = query(collection(db, "jogos"), orderBy("dataJogo"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Jogo[];
}

export async function POST() {
  try {
    // Obtém dados do Firebase
    const [times, jogos] = await Promise.all([
      obterTimes(),
      obterJogos()
    ]);

    // Verifica se a fase de grupos está completa
    if (!verificarFaseGruposCompleta(jogos)) {
      return NextResponse.json(
        { 
          erro: "A fase de grupos ainda não está completa. Todos os jogos devem estar finalizados.",
          detalhes: "Verifique se todos os jogos da fase de grupos têm placares inseridos e estão marcados como finalizados."
        },
        { status: 400 }
      );
    }

    // Verifica se há classificados suficientes
    if (!verificarClassificadosSuficientes(jogos, times)) {
      return NextResponse.json(
        { 
          erro: "Não há classificados suficientes para as quartas de final.",
          detalhes: "Deve haver exatamente 2 times classificados de cada um dos 4 grupos."
        },
        { status: 400 }
      );
    }

    // Verifica se já existem jogos de quartas
    const jogosQuartas = jogos.filter(jogo => jogo.fase === "quartas");
    if (jogosQuartas.length > 0) {
      return NextResponse.json(
        { 
          erro: "As quartas de final já foram geradas.",
          detalhes: `Existem ${jogosQuartas.length} jogo(s) de quartas já cadastrado(s).`
        },
        { status: 400 }
      );
    }

    // Gera os confrontos das quartas de final
    const confrontosQuartas = gerarConfrontosQuartas(jogos, times);
    if (!confrontosQuartas) {
      return NextResponse.json(
        { 
          erro: "Erro ao gerar confrontos das quartas de final.",
          detalhes: "Não foi possível determinar os confrontos baseado na classificação atual."
        },
        { status: 500 }
      );
    }

    // Data das quartas de final (7 dias após a finalização da fase de grupos)
    const dataQuartas = new Date();
    dataQuartas.setDate(dataQuartas.getDate() + 7);
    const timestampQuartas = Timestamp.fromDate(dataQuartas);

    // Cria os jogos das quartas de final
    const jogoQuarta1 = await adicionarJogo({
      timeA: confrontosQuartas.jogo1.time1,
      timeB: confrontosQuartas.jogo1.time2,
      fase: "quartas",
      dataJogo: timestampQuartas,
      finalizado: false,
      criadoEm: Timestamp.now()
    });

    const jogoQuarta2 = await adicionarJogo({
      timeA: confrontosQuartas.jogo2.time1,
      timeB: confrontosQuartas.jogo2.time2,
      fase: "quartas",
      dataJogo: timestampQuartas,
      finalizado: false,
      criadoEm: Timestamp.now()
    });

    const jogoQuarta3 = await adicionarJogo({
      timeA: confrontosQuartas.jogo3.time1,
      timeB: confrontosQuartas.jogo3.time2,
      fase: "quartas",
      dataJogo: timestampQuartas,
      finalizado: false,
      criadoEm: Timestamp.now()
    });

    const jogoQuarta4 = await adicionarJogo({
      timeA: confrontosQuartas.jogo4.time1,
      timeB: confrontosQuartas.jogo4.time2,
      fase: "quartas",
      dataJogo: timestampQuartas,
      finalizado: false,
      criadoEm: Timestamp.now()
    });

    // Registra o sorteio das quartas de final
    await salvarSorteio({
      tipo: "quartas",
      quartas: confrontosQuartas,
      criadoEm: Timestamp.now()
    });

    // Gera resumo dos classificados
    const resumo = obterResumoClassificados(jogos, times);

    return NextResponse.json({
      sucesso: true,
      mensagem: "Fase de grupos finalizada com sucesso! Quartas de final geradas.",
      resumo,
      quartas: {
        jogo1: {
          id: jogoQuarta1,
          time1: confrontosQuartas.jogo1.time1,
          time2: confrontosQuartas.jogo1.time2
        },
        jogo2: {
          id: jogoQuarta2,
          time1: confrontosQuartas.jogo2.time1,
          time2: confrontosQuartas.jogo2.time2
        },
        jogo3: {
          id: jogoQuarta3,
          time1: confrontosQuartas.jogo3.time1,
          time2: confrontosQuartas.jogo3.time2
        },
        jogo4: {
          id: jogoQuarta4,
          time1: confrontosQuartas.jogo4.time1,
          time2: confrontosQuartas.jogo4.time2
        }
      },
      dataJogos: dataQuartas.toISOString()
    });

  } catch (error) {
    console.error("Erro ao finalizar fase de grupos:", error);
    return NextResponse.json(
      { 
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}