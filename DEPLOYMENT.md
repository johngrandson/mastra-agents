# 🚀 Deployment Guide - Mastra Cloud

Este guia detalha o processo completo de deployment da aplicação **Horizon Agents** no Mastra Cloud.

---

## 📋 Pré-requisitos

Antes de iniciar o deployment, certifique-se de ter:

- ✅ Conta no [Mastra Cloud](https://cloud.mastra.ai)
- ✅ Conta no GitHub com acesso ao repositório
- ✅ OpenAI API Key ([obter aqui](https://platform.openai.com/api-keys))
- ✅ Código commitado e pushed no branch `main`

---

## 🔧 Preparação do Código

### ✅ Alterações Já Realizadas

Seu código foi preparado para Mastra Cloud com as seguintes melhorias:

1. **Storage Dinâmico**: Sistema detecta automaticamente se está no Mastra Cloud ou local
   - **Mastra Cloud**: Usa storage gerenciado automaticamente
   - **Local**: Usa `file:.mastra/mastra.db` (persistente)

2. **Environment Variables**: Configurações agora usam variáveis de ambiente
   - `LOG_LEVEL`: Controla nível de logging
   - `MASTRA_CLOUD_STORAGE`: Auto-detecta ambiente cloud

3. **Paths Dinâmicos**: Todos os paths se adaptam ao ambiente de execução

### 📁 Estrutura do Projeto

```
src/mastra/
├── agents/          ✅ Detectados automaticamente
├── tools/           ✅ Detectados automaticamente
├── workflows/       ✅ Detectados automaticamente
└── index.ts         ✅ Entry point configurado
```

---

## 🎯 Processo de Deployment

### Passo 1: Acesse Mastra Cloud

1. Vá para [https://cloud.mastra.ai](https://cloud.mastra.ai)
2. Faça login com **GitHub** ou **Google**

### Passo 2: Instale GitHub App

1. Quando solicitado, clique em **Install Mastra GitHub App**
2. Selecione seu repositório `mastra-agents`
3. Autorize o acesso

![Install GitHub App](https://docs.mastra.ai/image/mastra-cloud/mastra-cloud-install-github.jpg)

### Passo 3: Crie Novo Projeto

1. No dashboard, clique em **Create new project**
2. Busque pelo repositório `mastra-agents`
3. Clique em **Import**

![Create Project](https://docs.mastra.ai/image/mastra-cloud/mastra-cloud-import-git-repository.jpg)

### Passo 4: Configure o Deployment

Mastra Cloud detecta automaticamente as configurações, mas você deve verificar:

#### 📌 Configurações Básicas

| Campo | Valor |
|-------|-------|
| **Project name** | `horizon-agents` (ou personalizar) |
| **Branch** | `main` |
| **Project root** | `/` (raiz do repositório) |
| **Mastra directory** | `src/mastra` |

#### 🔐 Environment Variables (OBRIGATÓRIO)

Adicione as seguintes variáveis de ambiente:

```bash
# OBRIGATÓRIO
OPENAI_API_KEY=sk-proj-...

# RECOMENDADO
NODE_ENV=production
LOG_LEVEL=info

# OPCIONAL - Knowledge Base Seeding
# Por padrão, o knowledge base é populado automaticamente no primeiro deploy
# Defina como 'true' APENAS se você quiser desabilitar isso e popular manualmente
# SKIP_KNOWLEDGE_BASE_SEED=false
```

**Como adicionar:**
1. Na seção "Environment Variables", clique em **Add Variable**
2. Para cada variável:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-...` (sua chave)
   - Marque como **Secret** ✅
3. Clique em **Add**

#### ⚙️ Build Settings

| Campo | Valor Padrão | Alterar? |
|-------|--------------|----------|
| **Install command** | `npm install` | Não |
| **Project setup command** | (vazio) | Não |
| **Port** | `4111` | Não |

#### 💾 Storage Settings

- ✅ **Marque**: "Use Mastra Cloud's built-in LibSQLStore"
- Isso ativa o storage gerenciado automaticamente

![Deployment Config](https://docs.mastra.ai/image/mastra-cloud/mastra-cloud-deployment-details.jpg)

### Passo 5: Deploy!

1. Revise todas as configurações
2. Clique em **Deploy Project**
3. Aguarde o build (2-5 minutos)

---

## 📊 Após o Deployment

### ✅ Deployment Bem-Sucedido

Você verá a tela de **Overview** com:

- ✅ Status: **Deployed**
- 🌐 **Domain URL**: `https://your-project.mastra.cloud`
- 📅 **Latest deployment**: Timestamp do deploy
- 🤖 **Agents**: Lista dos agents detectados
- 🔄 **Workflows**: Lista dos workflows detectados

![Success](https://docs.mastra.ai/image/mastra-cloud/mastra-cloud-successful-deployment.jpg)

### 📚 Inicialização Automática do Knowledge Base

**Importante:** No primeiro deployment, o sistema automaticamente:

1. **Detecta todos os tenants** configurados no projeto
2. **Carrega documentação** de cada tenant (`docs/tenants/{tenantId}/`)
3. **Processa embeddings** usando OpenAI
4. **Popula o vector store** para RAG

Você verá logs como:
```
🚀 Mastra Cloud Initialization
========================================
📋 Found 1 tenant(s) to initialize
📚 [ortofaccia] Starting knowledge base seeding...
  • Found 6 documents
  • Created 120 chunks
✓ [ortofaccia] Knowledge base seeded successfully
✅ Mastra Cloud initialization complete!
```

**Troubleshooting:**
- Se o processo falhar, verifique os **Deployment Logs** no dashboard
- Certifique-se que `OPENAI_API_KEY` está configurada
- Verifique se há documentos em `docs/tenants/{tenantId}/`

**Desabilitar (não recomendado):**
```bash
# Adicione esta env var apenas se necessário
SKIP_KNOWLEDGE_BASE_SEED=true
```

### 🧪 Testando a Aplicação

#### 1. Via Playground (Interface Web)

**Testar Agents:**
1. Acesse **Playground > Agents**
2. Selecione um agent (ex: `ortofaccia-booking`)
3. Digite uma mensagem: `"Olá, quero agendar uma consulta"`
4. Veja:
   - Resposta do agent
   - Tools chamadas
   - Traces de execução
   - Scores de avaliação

**Testar Workflows:**
1. Acesse **Playground > Workflows**
2. Selecione `bookingWorkflow`
3. Forneça input conforme schema
4. Veja:
   - Grafo de execução
   - Logs de cada step
   - Output final

**Testar Tools:**
1. Acesse **Playground > Tools**
2. Selecione uma tool
3. Forneça input JSON
4. Veja output estruturado

#### 2. Via API (Programático)

```bash
# Instalar Mastra Client SDK
npm install @mastra/client-js

# Testar agent
curl -X POST https://your-project.mastra.cloud/api/agents/ortofaccia-booking/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, quero agendar consulta"}'
```

---

## 🔄 CI/CD Automático

### Como Funciona

Após o deployment inicial, **cada push no branch `main` dispara novo deploy automaticamente**:

```bash
# Faça alterações no código
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push origin main

# ⚡ Deploy automático inicia!
```

### Monitorar Deployments

1. Acesse **Deployments** no dashboard
2. Veja histórico de builds
3. Clique em qualquer deployment para ver:
   - Status (success, failed, building)
   - Build logs completos
   - Commit hash
   - Timestamp

---

## 📈 Observability

### Logs

**Acesse**: Dashboard > **Logs**

Veja logs em tempo real:
- Nível de severidade (info, warn, error)
- Timestamp
- Mensagens detalhadas
- Agent/Workflow/Storage activity

### Traces

**Agents**: Playground > Agents > [agent] > **Traces**
- Tools chamadas
- Inputs/Outputs
- Latência
- Erros

**Workflows**: Playground > Workflows > [workflow] > **Traces**
- Execução de cada step
- Dados intermediários
- Tempo de execução

---

## ⚙️ Configurações Pós-Deploy

### Domínio Customizado

1. Acesse **Settings** > Domain
2. Adicione seu domínio: `agents.seudominio.com`
3. Configure DNS conforme instruções
4. Aguarde propagação (até 24h)

### Environment Variables

**Para adicionar/editar variáveis:**
1. **Settings** > **Environment Variables**
2. Click **Add Variable** ou **Edit**
3. **IMPORTANTE**: Requer novo deployment para aplicar

### Storage

**Verificar storage:**
- **Settings** > **Storage**
- Veja uso atual
- Mastra Cloud gerencia backups automaticamente

---

## 🐛 Troubleshooting

### Build Failed

**Possíveis causas:**

1. **Erro de TypeScript**
   ```bash
   # Testar localmente primeiro
   npm run build
   ```

2. **Faltando Environment Variable**
   - Verifique se `OPENAI_API_KEY` está configurada
   - Vá em Settings > Environment Variables

3. **Path errado**
   - Verifique: "Mastra directory" = `src/mastra`

### Agent Não Responde

1. **Verificar Logs**:
   - Dashboard > Logs
   - Buscar por erros

2. **Verificar API Key**:
   ```bash
   # Testar se API key está válida
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

3. **Verificar Traces**:
   - Playground > Agents > [agent] > Traces
   - Ver onde falhou

### Tools Não Funcionam

1. **Verificar se tools foram detectadas**:
   - Playground > Tools
   - Se não aparecerem, problema no código

2. **Verificar logs de execução**:
   - Traces do agent
   - Ver se tool foi chamada

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Mastra Cloud Docs](https://docs.mastra.ai/docs/mastra-cloud/overview)
- [API Reference](https://docs.mastra.ai/reference)

### Dashboard Features
- **Overview**: Status geral do projeto
- **Deployments**: Histórico de builds
- **Logs**: Debug em produção
- **Playground**: Teste interativo
- **Settings**: Configurações

### Client SDK
```typescript
import { MastraClient } from '@mastra/client-js';

const client = new MastraClient({
  baseUrl: 'https://your-project.mastra.cloud'
});

const response = await client.agents.generate({
  agentId: 'ortofaccia-booking',
  message: 'Olá!'
});
```

---

## 🎉 Próximos Passos

Após deployment bem-sucedido:

1. ✅ Teste todos os agents no Playground
2. ✅ Configure domínio customizado (opcional)
3. ✅ Integre com frontend via Client SDK
4. ✅ Configure alertas de erro (Settings > Notifications)
5. ✅ Monitore usage e logs regularmente

---

## 🆘 Suporte

- **GitHub Issues**: [Reportar bugs](https://github.com/mastra-ai/mastra/issues)
- **Discord**: Comunidade Mastra
- **Docs**: [docs.mastra.ai](https://docs.mastra.ai)

---

**🚀 Seu projeto está pronto para produção no Mastra Cloud!**
