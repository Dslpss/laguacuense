import { NextResponse, NextRequest } from "next/server";
import { adicionarJogo, salvarSorteio } from "@/lib/firebase/firestore";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Jogo } from "@/types";
import {
  verificarQuartasCompletas,
  gerarConfrontosSemifinais,
  verificarFaseExiste,
} from "@/lib/eliminatorias";
import { Timestamp } from "firebase/firestore";

// Interface para o sorteio manual
interface SorteioManual {
  jogo1: { time1: string; time2: string; dataJogo?: string };
  jogo2: { time1: string; time2: string; dataJogo?: string };
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

export async function POST(request: NextRequest) {
  try {
    // Tenta ler o body (pode ser vazio se não for sorteio manual)
    let sorteioManual: SorteioManual | null = null;
    try {
      const body = await request.json();
      if (body?.sorteioManual) {
        sorteioManual = body.sorteioManual;
      }
    } catch {
      // Body vazio ou inválido - usa sorteio automático
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

    // Define os confrontos (sorteio manual ou automático)
    let confrontosSemifinais: {
      jogo1: { time1: string; time2: string };
      jogo2: { time1: string; time2: string };
    } | null;

    if (sorteioManual) {
      // Usa o sorteio enviado pelo frontend
      confrontosSemifinais = sorteioManual;
    } else {
      // Gera os confrontos das semifinais automaticamente
      confrontosSemifinais = gerarConfrontosSemifinais(jogos);
    }

    if (!confrontosSemifinais) {
      return NextResponse.json(
        {
          erro: "Erro ao gerar confrontos das semifinais.",
          detalhes:
            "Não foi possível determinar os vencedores das quartas de final.",
        },
        { status: 500 }
      );
    }

    // Data padrão das semifinais (7 dias após a finalização das quartas)
    const dataDefaultSemifinais = new Date();
    dataDefaultSemifinais.setDate(dataDefaultSemifinais.getDate() + 7);

    // Determina as datas de cada jogo (usa data do sorteio manual se fornecida)
    const dataDate1 = sorteioManual?.jogo1.dataJogo
      ? new Date(sorteioManual.jogo1.dataJogo)
      : new Date(dataDefaultSemifinais);

    const dataDate2 = sorteioManual?.jogo2.dataJogo
      ? new Date(sorteioManual.jogo2.dataJogo)
      : new Date(dataDefaultSemifinais);

    const dataJogo1 = Timestamp.fromDate(dataDate1);
    const dataJogo2 = Timestamp.fromDate(dataDate2);

    // Cria os jogos das semifinais
    const jogoSemifinal1 = await adicionarJogo({
      timeA: confrontosSemifinais.jogo1.time1,
      timeB: confrontosSemifinais.jogo1.time2,
      fase: "semifinal",
      dataJogo: dataJogo1,
      finalizado: false,
      criadoEm: Timestamp.now(),
    });

    const jogoSemifinal2 = await adicionarJogo({
      timeA: confrontosSemifinais.jogo2.time1,
      timeB: confrontosSemifinais.jogo2.time2,
      fase: "semifinal",
      dataJogo: dataJogo2,
      finalizado: false,
      criadoEm: Timestamp.now(),
    });

    // Registra o sorteio das semifinais
    await salvarSorteio({
      tipo: "semifinais",
      semifinais: confrontosSemifinais,
      datas: {
        jogo1: dataDate1.toISOString(),
        jogo2: dataDate2.toISOString(),
      },
      criadoEm: Timestamp.now(),
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Quartas de final finalizadas com sucesso! Semifinais geradas.",
      semifinais: {
        jogo1: {
          id: jogoSemifinal1,
          time1: confrontosSemifinais.jogo1.time1,
          time2: confrontosSemifinais.jogo1.time2,
        },
        jogo2: {
          id: jogoSemifinal2,
          time1: confrontosSemifinais.jogo2.time1,
          time2: confrontosSemifinais.jogo2.time2,
        },
      },
      dataJogos: {
        jogo1: dataDate1.toISOString(),
        jogo2: dataDate2.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao finalizar quartas de final:", error);
    return NextResponse.json(
      {
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
