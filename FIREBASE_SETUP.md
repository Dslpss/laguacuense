# Como Configurar o Firebase para o Campeonato Lagoacuense

## 1. Aplicar as Regras do Firestore

### No Console do Firebase:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: `anotacoes-estudos`
3. No menu lateral, clique em **Firestore Database**
4. Vá para a aba **Rules**
5. Copie todo o conteúdo do arquivo `firestore.rules` e cole na interface
6. Clique em **Publish** para aplicar as regras

### Ou via CLI do Firebase:

```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar projeto (na pasta do projeto)
firebase init firestore

# Aplicar as regras
firebase deploy --only firestore:rules
```

## 2. Configuração de Segurança

⚠️ **IMPORTANTE**: As regras atuais permitem acesso público para demonstração.

### Para Produção, altere as regras para:

```javascript
// Regras para times do Campeonato Lagoacuense
match /times/{timeId} {
  allow read: if true;
  allow write: if request.auth != null; // Apenas usuários autenticados
  allow create: if request.auth != null
    && validateCampeonatoTimeData(request.resource.data);
}
```

## 3. Configurar Autenticação (Opcional)

### No Console do Firebase:

1. Vá para **Authentication**
2. Clique em **Get started**
3. Na aba **Sign-in method**, habilite:
   - **Email/Password**
   - **Google** (recomendado)

### Criar usuário administrador:

1. Na aba **Users**, clique em **Add user**
2. Digite um email e senha para o administrador
3. Este usuário poderá gerenciar times, jogos e sorteios

## 4. Estrutura das Coleções

O projeto criará automaticamente as seguintes coleções:

- `times/` - Times do campeonato
  - `jogadores/` (subcoleção) - Jogadores de cada time
- `jogos/` - Partidas e resultados
- `sorteios/` - Histórico de sorteios

## 5. Testando a Aplicação

1. Execute o projeto: `npm run dev`
2. Acesse: `http://localhost:3000`
3. Adicione alguns times para testar
4. Quando tiver 16 times, poderá fazer o sorteio dos grupos

## 6. Deploy para Produção (Netlify)

1. Configure as variáveis de ambiente no Netlify
2. Altere as regras do Firestore para produção
3. Configure domínio autorizado no Firebase Authentication
