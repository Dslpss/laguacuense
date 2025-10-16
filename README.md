# Campeonato Lagoacuense de Futebol 2025 ⚽

Sistema completo de gestão do Campeonato Lagoacuense de Futebol 2025, desenvolvido com Next.js, Firebase e Tailwind CSS.

## 🔐 Acesso ao Sistema

### Área Administrativa

- **URL**: `http://localhost:3000` (requer login)
- **Funcionalidades**: Gestão completa de times, jogos, sorteios e classificação
- **Acesso**: Apenas usuários autenticados via Firebase Auth

### Área Pública

- **URL**: `http://localhost:3000/publico`
- **Funcionalidades**: Visualização de times, grupos e classificação
- **Acesso**: Público (sem necessidade de login)

## 🏆 Funcionalidades

### ✅ Implementadas

- **🔐 Sistema de Autenticação**: Login com Firebase Auth para administradores
- **👥 Gestão de Times**: Cadastro, listagem e visualização de times
- **🎲 Sorteio Automático**: Distribuição aleatória dos 16 times em 4 grupos (A, B, C, D)
- **🏆 Sistema de Classificação**: Cálculo automático seguindo os critérios do Art. 46º
- **📱 Interface Responsiva**: Design moderno com Tailwind CSS e Shadcn/UI
- **⚡ Tempo Real**: Atualizações automáticas via Firebase Firestore
- **🛠️ API Routes**: Endpoints para sorteio e classificação
- **👀 Visualização Pública**: Página pública para acompanhamento dos resultados

### 🔄 Em Desenvolvimento

- **Gestão de Jogos**: Cadastro de jogos e inserção de placares
- **Autenticação Admin**: Firebase Auth para administradores
- **Gestão de Jogadores**: Subcoleção de jogadores por time
- **Sorteio das Semifinais**: Sistema de sorteio para fase eliminatória
- **Relatórios**: Estatísticas e relatórios do campeonato

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore (tempo real)
- **Auth**: Firebase Authentication
- **Deploy**: Netlify-ready

## 📋 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── sorteio/        # Endpoint para sorteio dos grupos
│   │   └── classificacao/   # Endpoint para classificação
│   └── page.tsx            # Página principal
├── components/
│   ├── ui/                 # Componentes Shadcn/UI
│   └── tournament/         # Componentes específicos do torneio
├── hooks/                  # React Hooks customizados
├── lib/
│   ├── firebase/           # Configuração e funções Firebase
│   ├── classificacao.ts    # Lógica de classificação (Art. 46º)
│   └── sorteio.ts         # Lógica de sorteio (Fisher-Yates)
└── types/                  # Definições TypeScript
```

## ⚙️ Configuração

### 1. Pré-requisitos

- Node.js 18+
- Projeto Firebase configurado

### 2. Instalação

```bash
npm install
```

### 3. Configuração Firebase

Copie o arquivo `.env.local.example` para `.env.local` e configure:

```bash
cp .env.local.example .env.local
```

Configure as variáveis no `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 4. Configurar Autenticação

No Console do Firebase:

1. Acesse **Authentication** > **Sign-in method**
2. Habilite **Email/Password**
3. Crie usuários administrativos em **Authentication** > **Users**

### 5. Aplicar Regras do Firestore

Copie o conteúdo do arquivo `firestore.rules` e aplique no Firebase Console:

- **Firestore Database** > **Rules** > Cole as regras > **Publish**

### 6. Executar

```bash
npm run dev
```

## 🗄️ Estrutura do Banco (Firestore)

### Coleções

#### `times`

```typescript
{
  id: string;
  nome: string;
  cidade: string;
  grupo?: 'A' | 'B' | 'C' | 'D';
  criadoEm: Timestamp;
}
```

#### `times/{timeId}/jogadores` (subcoleção)

```typescript
{
  id: string;
  nome: string;
  posicao: string;
  numero: number;
  idade?: number;
  criadoEm: Timestamp;
}
```

#### `jogos`

```typescript
{
  id: string;
  timeA: string;
  timeB: string;
  golsTimeA?: number;
  golsTimeB?: number;
  cartoesAmarelosTimeA?: number;
  cartoesVermelhoTimeA?: number;
  cartoesAmarelosTimeB?: number;
  cartoesVermelhoTimeB?: number;
  fase: 'grupos' | 'semifinal' | 'final';
  grupo?: 'A' | 'B' | 'C' | 'D';
  dataJogo: Timestamp;
  finalizado: boolean;
  criadoEm: Timestamp;
}
```

#### `sorteios`

```typescript
{
  id: string;
  tipo: 'grupos' | 'semifinais';
  grupos?: {
    A: string[]; // IDs dos times
    B: string[];
    C: string[];
    D: string[];
  };
  semifinais?: {
    jogo1: { time1: string; time2: string };
    jogo2: { time1: string; time2: string };
  };
  criadoEm: Timestamp;
}
```

## 📖 Regulamento (Art. 46º)

### Critérios de Classificação

1. **Maior número de pontos**
2. **Vitórias**
3. **Saldo de gols**
4. **Maior número de gols marcados**
5. **Menor número de gols sofridos**
6. **Derrotas** (menor número)
7. **Cartões vermelhos** (menor número)
8. **Cartões amarelos** (menor número)
9. **Sorteio**

### Informações do Campeonato

- **Data**: 27/09/2025 às 15:30min
- **Formato**: 16 times em 4 grupos de 4
- **Classificação**: 2 melhores de cada grupo
- **Semifinais**: Confrontos definidos por sorteio
- **Tolerância**: 15 minutos para início dos jogos

## 🚀 Deploy

### Netlify

1. Faça push do código para o GitHub
2. Conecte o repositório no Netlify
3. Configure as variáveis de ambiente no dashboard
4. Deploy automático configurado via `netlify.toml`

### Variáveis de Ambiente (Netlify)

Configure no dashboard do Netlify:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🎯 Próximos Passos

1. **Implementar gestão de jogos**

   - Formulário para cadastrar jogos
   - Interface para inserir placares
   - Validações e regras de negócio

2. **Sistema de autenticação**

   - Login para administradores
   - Proteção de rotas administrativas
   - Diferentes níveis de acesso

3. **Funcionalidades avançadas**
   - Geração automática de confrontos
   - Estatísticas detalhadas
   - Exportação de relatórios
   - Notificações em tempo real

## 👨‍💼 Contato

**Liga Esportiva Lagoacuense**  
Diretor de Esportes: Christiano Texeira dos Santos

---

Desenvolvido com ⚽ para o Campeonato Lagoacuense de Futebol 2025
