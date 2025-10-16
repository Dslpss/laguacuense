# Manual de Uso - Campeonato Lagoacuense 2025

## 🎯 Visão Geral

Sistema completo para gerenciamento do Campeonato Lagoacuense de Futebol 2025, com interface administrativa para organizadores e página pública para acompanhamento dos resultados.

## 🔧 Funcionalidades Principais

### 🔐 Sistema de Autenticação

- **Login de Administradores**: Acesso protegido com email e senha
- **Proteção de Rotas**: Páginas administrativas requerem autenticação
- **Sessões Persistentes**: Login mantido entre sessões do navegador

### ⚽ Gerenciamento de Times

- **Cadastro de Times**: Formulário para adicionar novos times
- **Lista em Tempo Real**: Visualização de todos os times cadastrados
- **Edição e Exclusão**: Modificar ou remover times existentes
- **Validação**: Nomes únicos e obrigatórios

### 🎲 Sistema de Sorteio

- **Sorteio Automático**: Distribuição aleatória em grupos
- **Algoritmo Fair**: Fisher-Yates para garantir aleatoriedade
- **Visualização dos Grupos**: Interface clara dos grupos sorteados
- **Histórico**: Registro de todos os sorteios realizados

### 🏆 Gestão de Jogos

- **Cadastro de Partidas**: Registrar jogos entre times
- **Resultados**: Inserir placares das partidas
- **Calendário**: Organização por rodadas
- **Status**: Controle de jogos finalizados/pendentes

### 📊 Classificação Automática

- **Cálculo em Tempo Real**: Atualização automática da tabela
- **Critérios do Regulamento**: Seguindo Art. 46º do regulamento
- **Saldo de Gols**: Cálculo automático
- **Ordenação**: Por pontos, saldo, gols pró, confronto direto

### 🌐 Página Pública

- **Acesso Livre**: Visualização sem necessidade de login
- **Resultados ao Vivo**: Acompanhamento em tempo real
- **Tabela de Classificação**: Posições atualizadas automaticamente
- **Interface Responsiva**: Funciona em celulares e computadores

## 🚀 Como Usar

### Para Administradores

1. **Acesso ao Sistema**

   - Acesse a URL principal do sistema
   - Faça login com suas credenciais
   - Será redirecionado para o painel administrativo

2. **Cadastrar Times**

   - Na seção "Times", clique em "Adicionar Time"
   - Digite o nome do time
   - Clique em "Salvar"

3. **Realizar Sorteio**

   - Com os times cadastrados, vá para "Sorteio"
   - Clique em "Realizar Sorteio"
   - Os grupos serão formados automaticamente

4. **Registrar Jogos**

   - Na seção "Jogos", clique em "Novo Jogo"
   - Selecione os times, rodada e data
   - Salve o jogo

5. **Inserir Resultados**

   - Localize o jogo na lista
   - Clique em "Editar"
   - Insira os placares
   - Marque como "Finalizado"

6. **Visualizar Classificação**
   - A tabela é atualizada automaticamente
   - Ordenada pelos critérios do regulamento

### Para o Público

1. **Acompanhar Resultados**
   - Acesse `/publico` na URL do sistema
   - Visualize a tabela de classificação
   - Veja os resultados dos jogos
   - Não é necessário login

## 📱 Interface Responsiva

O sistema foi desenvolvido para funcionar perfeitamente em:

- 💻 **Computadores** (desktop)
- 📱 **Smartphones** (mobile)
- 📱 **Tablets** (tablet)

## 🔄 Atualizações em Tempo Real

Todas as informações são sincronizadas em tempo real:

- ✅ Novos times aparecem instantaneamente
- ✅ Resultados são atualizados automaticamente
- ✅ Classificação é recalculada em tempo real
- ✅ Múltiplos usuários veem as mesmas informações

## 🎨 Design

- **Interface Moderna**: Design limpo e profissional
- **Cores do Futebol**: Paleta verde e branca
- **Navegação Intuitiva**: Menus claros e organizados
- **Feedback Visual**: Notificações de sucesso/erro

## 🛡️ Segurança

- **Autenticação Firebase**: Sistema seguro do Google
- **Regras de Firestore**: Proteção dos dados no banco
- **Validação de Dados**: Verificação em frontend e backend
- **Acesso Controlado**: Apenas administradores podem modificar

## 📊 Relatórios Automáticos

O sistema gera automaticamente:

- 📈 **Tabela de Classificação**: Ordenada pelos critérios oficiais
- ⚽ **Estatísticas**: Gols marcados, sofridos, saldo
- 🏆 **Resultados**: Histórico completo de partidas
- 👥 **Grupos**: Visualização da distribuição dos times

## 🔧 Configuração Técnica

### Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` está configurado com:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
# ... outras configurações do Firebase
```

### Regras do Firestore

As regras de segurança estão configuradas para:

- ✅ Leitura pública das informações do campeonato
- 🔒 Escrita apenas para usuários autenticados
- ✅ Compatibilidade com projetos existentes

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique se o Firebase está configurado corretamente
2. Confirme se as credenciais estão corretas
3. Teste a conexão com o banco de dados
4. Consulte os logs do navegador para erros

## 🏆 Regulamento Implementado

O sistema segue rigorosamente o **Art. 46º** do regulamento:

- Pontos corridos na primeira fase
- Critérios de desempate automáticos
- Saldo de gols calculado corretamente
- Confronto direto considerado

---

_Sistema desenvolvido para o Campeonato Lagoacuense de Futebol 2025_
_Tecnologia: Next.js + Firebase + TypeScript_
