import { NextResponse } from "next/server";
import { 
  adicionarJogo, 
  salvarSorteio 
} from "@/lib/firebase/firestore";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Jogo } from "@/types";
import { 
  verificarSemifinaisCompletas,
  gerarConfrontoFinal,
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

    // Verifica se as semifinais estão completas
    if (!verificarSemifinaisCompletas(jogos)) {
      return NextResponse.json(
        { 
          erro: "As semifinais ainda não estão completas.",
          detalhes: "Todos os jogos das semifinais devem estar finalizados com placares definidos."
        },
        { status: 400 }
      );
    }

    // Verifica se já existe jogo da final
    if (verificarFaseExiste(jogos, "final")) {
      return NextResponse.json(
        { 
          erro: "A final já foi gerada.",
          detalhes: "Já existe um jogo da final cadastrado."
        },
        { status: 400 }
      );
    }

    // Gera o confronto da final
    const confrontoFinal = gerarConfrontoFinal(jogos);
    if (!confrontoFinal) {
      return NextResponse.json(
        { 
          erro: "Erro ao gerar confronto da final.",
          detalhes: "Não foi possível determinar os vencedores das semifinais."
        },
        { status: 500 }
      );
    }

    // Data da final (7 dias após a finalização das semifinais)
    const dataFinal = new Date();
    dataFinal.setDate(dataFinal.getDate() + 7);
    const timestampFinal = Timestamp.fromDate(dataFinal);

    // Cria o jogo da final
    const jogoFinal = await adicionarJogo({
      timeA: confrontoFinal.jogo1.time1,
      timeB: confrontoFinal.jogo1.time2,
      fase: "final",
      dataJogo: timestampFinal,
      finalizado: false,
      criadoEm: Timestamp.now()
    });

    // Registra o sorteio da final
    await salvarSorteio({
      tipo: "final",
      final: confrontoFinal,
      criadoEm: Timestamp.now()
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Semifinais finalizadas com sucesso! Final gerada.",
      final: {
        jogo1: {
          id: jogoFinal,
          time1: confrontoFinal.jogo1.time1,
          time2: confrontoFinal.jogo1.time2
        }
      },
      dataJogo: dataFinal.toISOString()
    });

  } catch (error) {
    console.error("Erro ao finalizar semifinais:", error);
    return NextResponse.json(
      { 
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}