import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Jogo, Time } from "@/types";
import { 
  verificarFinalCompleta,
  obterCampeao
} from "@/lib/eliminatorias";

// Função auxiliar para obter jogos
async function obterJogos(): Promise<Jogo[]> {
  const q = query(collection(db, "jogos"), orderBy("dataJogo"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Jogo[];
}

// Função auxiliar para obter times
async function obterTimes(): Promise<Time[]> {
  const q = query(collection(db, "times"), orderBy("nome"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Time[];
}

export async function POST() {
  try {
    // Obtém dados do Firebase
    const [jogos, times] = await Promise.all([
      obterJogos(),
      obterTimes()
    ]);

    // Verifica se a final está completa
    if (!verificarFinalCompleta(jogos)) {
      return NextResponse.json(
        { 
          erro: "A final ainda não está completa.",
          detalhes: "O jogo da final deve estar finalizado com placar definido."
        },
        { status: 400 }
      );
    }

    // Obtém o campeão
    const campeaoId = obterCampeao(jogos);
    if (!campeaoId) {
      return NextResponse.json(
        { 
          erro: "Erro ao determinar o campeão.",
          detalhes: "Não foi possível identificar o vencedor da final."
        },
        { status: 500 }
      );
    }

    // Busca informações do time campeão
    const timeCampeao = times.find(time => time.id === campeaoId);
    if (!timeCampeao) {
      return NextResponse.json(
        { 
          erro: "Time campeão não encontrado.",
          detalhes: `Não foi possível encontrar o time com ID: ${campeaoId}`
        },
        { status: 500 }
      );
    }

    // Atualiza o status do campeonato para finalizado
    // (Assumindo que existe uma coleção 'campeonato' com documento de configuração)
    try {
      const campeonatoRef = doc(db, "campeonato", "config");
      await updateDoc(campeonatoRef, {
        status: "finalizado",
        campeao: campeaoId,
        dataFinalizacao: new Date()
      });
    } catch (error) {
      console.warn("Não foi possível atualizar status do campeonato:", error);
      // Continua mesmo se não conseguir atualizar o status
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Campeonato finalizado com sucesso!",
      campeao: {
        id: timeCampeao.id,
        nome: timeCampeao.nome,
        cidade: timeCampeao.cidade,
        logoUrl: timeCampeao.logoUrl
      },
      dataFinalizacao: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erro ao declarar campeão:", error);
    return NextResponse.json(
      { 
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}