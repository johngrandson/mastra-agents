# ⚡ Quick Start - Mastra Cloud Deploy

Guia rápido de 5 minutos para fazer deploy no Mastra Cloud.

---

## ✅ Checklist Pré-Deploy

- [ ] Código commitado e pushed no GitHub (branch `main`)
- [ ] OpenAI API Key em mãos ([obter aqui](https://platform.openai.com/api-keys))
- [ ] Conta no [Mastra Cloud](https://cloud.mastra.ai)

---

## 🚀 Deploy em 5 Passos

### 1. Acesse Mastra Cloud
👉 https://cloud.mastra.ai
- Login com GitHub ou Google

### 2. Conecte Repositório
- Click **"Create new project"**
- Instale Mastra GitHub App (se solicitado)
- Selecione `mastra-agents` repository
- Click **"Import"**

### 3. Configure Project

**Detectado automaticamente:**
- ✅ Project root: `/`
- ✅ Mastra directory: `src/mastra`
- ✅ Branch: `main`

**Você precisa adicionar:**

| Environment Variable | Value | Secret? |
|---------------------|-------|---------|
| `OPENAI_API_KEY` | `sk-proj-...` | ✅ Yes |
| `NODE_ENV` | `production` | No |
| `LOG_LEVEL` | `info` | No |

**Storage:**
- ✅ Marque: "Use Mastra Cloud's built-in LibSQLStore"

### 4. Deploy
- Click **"Deploy Project"**
- Aguarde 2-5 minutos

### 5. Teste
Após deploy bem-sucedido:

**Via Playground:**
1. Acesse Dashboard > Playground > Agents
2. Selecione `ortofaccia-booking`
3. Digite: `"Olá, quero agendar consulta"`
4. ✅ Agent deve responder normalmente!

**Via API:**
```bash
curl -X POST https://your-project.mastra.cloud/api/agents/ortofaccia-booking/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, quero agendar consulta"}'
```

---

## 🎉 Pronto!

Seu sistema está no ar com:
- ✅ Agents rodando em produção
- ✅ Knowledge base populado automaticamente
- ✅ CI/CD configurado (push to main = deploy)
- ✅ Logs e traces disponíveis no dashboard

---

## 📊 Monitorar

**Logs em Tempo Real:**
Dashboard > **Logs**

**Traces de Execução:**
Playground > Agents > [agent] > **Traces**

**Deployments:**
Dashboard > **Deployments** (histórico de builds)

---

## 🔄 Próximos Deploys

**Automático via Git:**
```bash
git add .
git commit -m "feat: nova feature"
git push origin main
# ⚡ Deploy automático inicia!
```

---

## 🐛 Troubleshooting Rápido

### Build Failed

**Erro:** "Module not found"
- ✅ Verificar `package.json` está no root
- ✅ Verificar `OPENAI_API_KEY` está configurada

**Erro:** "TypeScript compilation failed"
```bash
# Testar localmente primeiro
npm run build
```

### Agent Não Responde

**1. Verificar Logs:**
Dashboard > Logs (buscar erros)

**2. Verificar API Key:**
Settings > Environment Variables > `OPENAI_API_KEY`

**3. Verificar Knowledge Base:**
Logs devem mostrar:
```
✓ [ortofaccia] Knowledge base seeded successfully
```

Se não aparecer:
- Verificar se `docs/tenants/ortofaccia/` existe
- Verificar se há arquivos `.md` dentro

---

## 📚 Documentação Completa

- **Deployment Detalhado**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Arquitetura**: [README.md](./README.md)
- **RAG System**: [docs/RAG_ARCHITECTURE.md](./docs/RAG_ARCHITECTURE.md)

---

## 🆘 Precisa de Ajuda?

- **GitHub Issues**: Reporte bugs
- **Mastra Docs**: https://docs.mastra.ai
- **Discord**: Mastra Community

---

**⚡ Deploy em 5 minutos. Pronto para produção!**
