import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Jogo } from "@/types";
import {
  verificarQuartasCompletas,
  verificarFaseExiste,
} from "@/lib/eliminatorias";
import { adicionarJogo, salvarSorteio } from "@/lib/firebase/firestore";

// Função auxiliar para obter jogos
async function obterJogos(): Promise<Jogo[]> {
  const q = query(collection(db, "jogos"), orderBy("dataJogo"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Jogo[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { semifinal1, semifinal2, dataJogo1, dataJogo2 } = body;

    // Validação dos dados
    if (!semifinal1 || !semifinal2 || !dataJogo1 || !dataJogo2) {
      return NextResponse.json(
        {
          erro: "Dados incompletos.",
          detalhes:
            "É necessário fornecer os confrontos das duas semifinais e a data dos jogos.",
        },
        { status: 400 }
      );
    }

    if (
      !semifinal1.timeA ||
      !semifinal1.timeB ||
      !semifinal2.timeA ||
      !semifinal2.timeB
    ) {
      return NextResponse.json(
        {
          erro: "Times não definidos.",
          detalhes: "Todos os times das semifinais devem ser especificados.",
        },
        { status: 400 }
      );
    }

    // Obtém jogos do Firebase
    const jogos = await obterJogos();

    // Verifica se as quartas de final estão completas
    if (!verificarQuartasCompletas(jogos)) {
      return NextResponse.json(
        {
          erro: "As quartas de final ainda não estão completas.",
          detalhes:
            "Todos os jogos das quartas de final devem estar finalizados com placares definidos.",
        },
        { status: 400 }
      );
    }

    // Verifica se já existem jogos de semifinal
    if (verificarFaseExiste(jogos, "semifinal")) {
      return NextResponse.json(
        {
          erro: "As semifinais já foram geradas.",
          detalhes: "Já existem jogos de semifinal cadastrados.",
        },
        { status: 400 }
      );
    }

    // Converte a data
    // Converte datas separadas das semifinais
    const dataSemifinal1 = new Date(dataJogo1);
    const dataSemifinal2 = new Date(dataJogo2);
    const timestampSemifinal1 = Timestamp.fromDate(dataSemifinal1);
    const timestampSemifinal2 = Timestamp.fromDate(dataSemifinal2);

    // Cria os jogos das semifinais
    const jogoSemifinal1 = await adicionarJogo({
      timeA: semifinal1.timeA,
      timeB: semifinal1.timeB,
      fase: "semifinal",
      dataJogo: timestampSemifinal1,
      finalizado: false,
      criadoEm: Timestamp.now(),
    });

    const jogoSemifinal2 = await adicionarJogo({
      timeA: semifinal2.timeA,
      timeB: semifinal2.timeB,
      fase: "semifinal",
      dataJogo: timestampSemifinal2,
      finalizado: false,
      criadoEm: Timestamp.now(),
    });

    // Registra o sorteio das semifinais (manual)
    await salvarSorteio({
      tipo: "semifinais",
      semifinais: {
        jogo1: { time1: semifinal1.timeA, time2: semifinal1.timeB },
        jogo2: { time1: semifinal2.timeA, time2: semifinal2.timeB },
      },
      manual: true,
      datas: { jogo1: dataJogo1, jogo2: dataJogo2 },
      criadoEm: Timestamp.now(),
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Semifinais definidas manualmente com sucesso!",
      semifinais: {
        jogo1: {
          id: jogoSemifinal1,
          timeA: semifinal1.timeA,
          timeB: semifinal1.timeB,
        },
        jogo2: {
          id: jogoSemifinal2,
          timeA: semifinal2.timeA,
          timeB: semifinal2.timeB,
        },
      },
      dataJogos: {
        jogo1: dataSemifinal1.toISOString(),
        jogo2: dataSemifinal2.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao definir semifinais manualmente:", error);
    return NextResponse.json(
      {
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
