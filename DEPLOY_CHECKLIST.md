# Checklist de Deploy - Campeonato Lagoacuense 2025

## ✅ Pré-requisitos Completados

### 🏗️ Desenvolvimento

- [x] Projeto Next.js criado com App Router
- [x] TypeScript configurado
- [x] Tailwind CSS e Shadcn/UI implementados
- [x] Estrutura de componentes organizada
- [x] Sistema de autenticação completo
- [x] Gestão de estado com hooks customizados
- [x] API routes para operações do servidor

### 🔥 Firebase

- [x] Projeto Firebase configurado
- [x] Firestore Database habilitado
- [x] Authentication configurado
- [x] Regras de segurança implementadas
- [x] Coleções estruturadas (times, jogos, sorteios)
- [x] Usuários administrativos criados

### 🧪 Testes

- [x] Compilação sem erros (`npm run build`)
- [x] TypeScript sem warnings
- [x] ESLint configurado e validado
- [x] Responsividade testada
- [x] Funcionalidades validadas localmente

## 📋 Checklist de Deploy

### 1. 🔐 Configuração de Ambiente

- [ ] Verificar arquivo `.env.local` está ignorado no Git
- [ ] Copiar variáveis de ambiente para o serviço de deploy
- [ ] Confirmar todas as chaves do Firebase estão corretas
- [ ] Testar conexão com Firebase em produção

### 2. 🚀 Deploy no Netlify

- [ ] Conectar repositório GitHub ao Netlify
- [ ] Configurar comando de build: `npm run build`
- [ ] Configurar diretório de saída: `.next`
- [ ] Adicionar variáveis de ambiente no painel do Netlify
- [ ] Configurar redirecionamentos para SPA (Single Page App)

### 3. 🌐 Configuração de Domínio

- [ ] Configurar domínio personalizado (se aplicável)
- [ ] Verificar SSL/HTTPS está ativo
- [ ] Testar acesso via URL de produção
- [ ] Confirmar todas as rotas funcionam

### 4. 🔥 Firebase em Produção

- [ ] Adicionar domínio de produção nas configurações do Firebase Auth
- [ ] Testar login em produção
- [ ] Verificar regras do Firestore em produção
- [ ] Confirmar operações CRUD funcionam

### 5. ✅ Testes Finais

- [ ] Testar cadastro de times
- [ ] Testar sistema de sorteio
- [ ] Testar cadastro de jogos
- [ ] Testar inserção de resultados
- [ ] Verificar cálculo automático da classificação
- [ ] Testar página pública (sem autenticação)
- [ ] Verificar responsividade em dispositivos móveis

## 🔧 Comandos de Deploy

### Netlify via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy manual (opcional)
netlify deploy --prod --dir=.next
```

### Variáveis de Ambiente para Netlify

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 🔍 Verificações Pós-Deploy

### Funcionalidades Críticas

- [ ] Login de administradores funciona
- [ ] Cadastro de times salva no banco
- [ ] Sorteio gera grupos corretamente
- [ ] Jogos são registrados
- [ ] Resultados atualizam a classificação
- [ ] Página pública mostra dados em tempo real

### Performance

- [ ] Tempo de carregamento aceitável
- [ ] Imagens otimizadas
- [ ] JavaScript minificado
- [ ] CSS otimizado

### SEO e Acessibilidade

- [ ] Meta tags configuradas
- [ ] Título da página adequado
- [ ] Estrutura HTML semântica
- [ ] Contraste de cores adequado

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de autenticação**

   - Verificar domínio autorizado no Firebase
   - Confirmar chaves de API corretas

2. **Erro 404 em rotas**

   - Configurar redirects no Netlify
   - Verificar build do Next.js

3. **Dados não carregam**

   - Verificar regras do Firestore
   - Confirmar variáveis de ambiente

4. **Erro de build**
   - Verificar dependências
   - Limpar cache: `npm run clean && npm install`

## 📱 URLs Importantes

### Produção

- [ ] URL principal: `https://campeonato-lagoacuense.netlify.app`
- [ ] Página pública: `https://campeonato-lagoacuense.netlify.app/publico`
- [ ] Painel admin: `https://campeonato-lagoacuense.netlify.app/`

### Firebase Console

- [ ] Authentication: `https://console.firebase.google.com/project/[PROJECT_ID]/authentication`
- [ ] Firestore: `https://console.firebase.google.com/project/[PROJECT_ID]/firestore`

## 🎯 Próximos Passos Após Deploy

1. **Testar com usuários reais**

   - Fazer login com credenciais de produção
   - Cadastrar times de teste
   - Realizar sorteio completo

2. **Configurar monitoramento**

   - Configurar alertas de erro
   - Monitorar performance
   - Acompanhar logs

3. **Documentar URLs**
   - Compartilhar URL pública
   - Documentar credenciais de admin
   - Criar guia de uso rápido

---

**✅ Status: PRONTO PARA DEPLOY**

_Todos os pré-requisitos foram cumpridos. O sistema está compilando sem erros e todas as funcionalidades foram implementadas conforme o regulamento do campeonato._
