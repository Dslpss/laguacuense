// Dados de exemplo para testes do Campeonato Lagoacuense 2025
// Baseado nos grupos mencionados no regulamento

export const timesExemplo = [
  // Grupo A (conforme regulamento)
  { nome: "Boca Jr", cidade: "Arsenal" },
  { nome: "Shalk", cidade: "Serraria" },
  { nome: "PFC", cidade: "Juventus" },
  { nome: "Chelsea", cidade: "Palmeiras" },

  // Grupo B
  { nome: "Arsenal", cidade: "Boca Jr" },
  { nome: "Serraria", cidade: "Shalk" },
  { nome: "Juventus", cidade: "PFC" },
  { nome: "Palmeiras", cidade: "Chelsea" },

  // Grupo C
  { nome: "Sporte", cidade: "Xirizal" },
  { nome: "Botafogo", cidade: "Vasquinho" },
  { nome: "São Paulo", cidade: "São José" },
  { nome: "Balança Rede", cidade: "Porto" },

  // Grupo D
  { nome: "Xirizal", cidade: "Sporte" },
  { nome: "Vasquinho", cidade: "Botafogo" },
  { nome: "São José", cidade: "São Paulo" },
  { nome: "Porto", cidade: "Balança Rede" },
];

export const jogadoresExemplo = [
  // Exemplos de jogadores para cada time
  { nome: "João Silva", posicao: "Goleiro", numero: 1 },
  { nome: "Pedro Santos", posicao: "Zagueiro", numero: 2 },
  { nome: "Carlos Oliveira", posicao: "Lateral", numero: 3 },
  { nome: "Roberto Lima", posicao: "Volante", numero: 5 },
  { nome: "André Costa", posicao: "Meia", numero: 10 },
  { nome: "Lucas Ferreira", posicao: "Atacante", numero: 9 },
  { nome: "Bruno Alves", posicao: "Ponta", numero: 7 },
  { nome: "Marcelo Rocha", posicao: "Zagueiro", numero: 4 },
  { nome: "Ricardo Gomes", posicao: "Lateral", numero: 6 },
  { nome: "Fernando Dias", posicao: "Meia", numero: 8 },
  { nome: "Gabriel Souza", posicao: "Atacante", numero: 11 },
];

// Função para popular o banco com dados de exemplo
export async function popularDadosExemplo() {
  try {
    const { adicionarTime } = await import("@/lib/firebase/firestore");

    console.log("Populando banco com dados de exemplo...");

    for (const time of timesExemplo) {
      await adicionarTime(time);
      console.log(`Time ${time.nome} adicionado`);
    }

    console.log("Dados de exemplo adicionados com sucesso!");
  } catch (error) {
    console.error("Erro ao popular dados de exemplo:", error);
  }
}
