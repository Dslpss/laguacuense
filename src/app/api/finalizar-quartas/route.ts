import { NextResponse } from "next/server";
import { 
  adicionarJogo, 
  salvarSorteio 
} from "@/lib/firebase/firestore";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Jogo } from "@/types";
import { 
  verificarQuartasCompletas,
  gerarConfrontosSemifinais,
  verificarFaseExiste
} from "@/lib/eliminatorias";
import { Timestamp } from "firebase/firestore";

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
    // Obtém jogos do Firebase
    const jogos = await obterJogos();

    // Verifica se as quartas de final estão completas
    if (!verificarQuartasCompletas(jogos)) {
      return NextResponse.json(
        { 
          erro: "As quartas de final ainda não estão completas.",
          detalhes: "Todos os jogos das quartas de final devem estar finalizados com placares definidos."
        },
        { status: 400 }
      );
    }

    // Verifica se já existem jogos de semifinal
    if (verificarFaseExiste(jogos, "semifinal")) {
      return NextResponse.json(
        { 
          erro: "As semifinais já foram geradas.",
          detalhes: "Já existem jogos de semifinal cadastrados."
        },
        { status: 400 }
      );
    }

    // Gera os confrontos das semifinais
    const confrontosSemifinais = gerarConfrontosSemifinais(jogos);
    if (!confrontosSemifinais) {
      return NextResponse.json(
        { 
          erro: "Erro ao gerar confrontos das semifinais.",
          detalhes: "Não foi possível determinar os vencedores das quartas de final."
        },
        { status: 500 }
      );
    }

    // Data das semifinais (7 dias após a finalização das quartas)
    const dataSemifinais = new Date();
    dataSemifinais.setDate(dataSemifinais.getDate() + 7);
    const timestampSemifinais = Timestamp.fromDate(dataSemifinais);

    // Cria os jogos das semifinais
    const jogoSemifinal1 = await adicionarJogo({
      timeA: confrontosSemifinais.jogo1.time1,
      timeB: confrontosSemifinais.jogo1.time2,
      fase: "semifinal",
      dataJogo: timestampSemifinais,
      finalizado: false,
      criadoEm: Timestamp.now()
    });

    const jogoSemifinal2 = await adicionarJogo({
      timeA: confrontosSemifinais.jogo2.time1,
      timeB: confrontosSemifinais.jogo2.time2,
      fase: "semifinal",
      dataJogo: timestampSemifinais,
      finalizado: false,
      criadoEm: Timestamp.now()
    });

    // Registra o sorteio das semifinais
    await salvarSorteio({
      tipo: "semifinais",
      semifinais: confrontosSemifinais,
      criadoEm: Timestamp.now()
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Quartas de final finalizadas com sucesso! Semifinais geradas.",
      semifinais: {
        jogo1: {
          id: jogoSemifinal1,
          time1: confrontosSemifinais.jogo1.time1,
          time2: confrontosSemifinais.jogo1.time2
        },
        jogo2: {
          id: jogoSemifinal2,
          time1: confrontosSemifinais.jogo2.time1,
          time2: confrontosSemifinais.jogo2.time2
        }
      },
      dataJogos: dataSemifinais.toISOString()
    });

  } catch (error) {
    console.error("Erro ao finalizar quartas de final:", error);
    return NextResponse.json(
      { 
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}