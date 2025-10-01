# Mastra Multi-Tenant AI Agents

Multi-tenant AI agent system powered by [Mastra.ai](https://mastra.ai) - Supporting multiple industries with RAG-powered intelligent agents.

## 🌟 Features

- **Multi-Tenant Architecture**: Isolated agents per tenant/organization
- **Industry-Agnostic**: Supports dental clinics, law firms, and extensible to other industries
- **RAG Integration**: Vector-based knowledge retrieval using LibSQL
- **Memory System**: Conversation history and context management
- **Tool System**: Modular, reusable tools (booking, RAG, datetime, etc.)
- **Type-Safe**: Full TypeScript with Zod validation
- **Production Ready**: Error handling, validation, and structured logging

## 🏗️ Architecture

```
mastra-agents/
├── src/
│   ├── config/           # Tenant and agent configurations
│   │   ├── agents.ts     # Agent definitions
│   │   ├── tenants.ts    # Tenant configurations
│   │   └── schemas/      # Zod validation schemas
│   ├── core/             # Core business logic
│   │   ├── agent-factory.ts   # Dynamic agent creation
│   │   ├── tool-registry.ts   # Tool resolution system
│   │   └── vector-store.ts    # RAG vector operations
│   ├── mastra/           # Mastra framework integration
│   │   ├── agents/       # Agent implementations
│   │   ├── tools/        # Tool implementations
│   │   ├── rag/          # RAG document loaders & embeddings
│   │   └── scripts/      # Seed scripts for knowledge base
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── docs/                 # Tenant-specific knowledge bases
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 20.9.0
- **npm** or **yarn** or **pnpm**
- **OpenAI API Key**: For LLM and embeddings

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:johngrandson/mastra-agents.git
   cd mastra-agents
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**

   Create a `.env` file in the root directory:
   ```bash
   # OpenAI API Key (required)
   OPENAI_API_KEY=your-openai-api-key-here

   # Environment
   NODE_ENV=development
   ```

4. **Seed knowledge base (optional)**

   Populate the vector database with tenant-specific knowledge:
   ```bash
   npm run seed-kb
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The Mastra playground will be available at [http://localhost:4111](http://localhost:4111)

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed-kb` | Seed knowledge base with documents |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## 🤖 Available Agents

### Ortofaccia (Dental Clinic)

**Agent ID**: `ortofaccia-booking`

Booking assistant for Ortofaccia Odontologia dental clinic.

**Capabilities**:
- Check appointment availability
- Book appointments with dentists
- Query clinic knowledge base (services, policies, team)
- Send appointment confirmations
- Check patient appointment history

**Tools**: RAG, DateTime, Booking (availability, book, confirm, check appointments)

### Silva & Associados (Law Firm)

#### 1. Booking Agent

**Agent ID**: `silva-associados-booking`

Booking assistant for legal consultations.

**Capabilities**:
- Schedule legal consultations
- Check attorney availability
- Send confirmation emails

**Tools**: Booking suite

#### 2. Contract Review Agent

**Agent ID**: `silva-associados-contract-review`

Legal contract analysis assistant.

**Capabilities**:
- Analyze contract documents
- Identify key clauses and risks
- Query law firm knowledge base

**Tools**: RAG, Legal-specific tools

## 🛠️ Tool System

Tools are organized by namespace:

- **common**: RAG search, current datetime
- **booking**: Check availability, book appointments, send confirmations, check patient appointments

### Tool Resolution

Tools are automatically resolved per tenant using the factory pattern:

```typescript
const tools = await getTools(['booking.checkAvailability', 'common.rag'], tenantId);
```

Legacy tool names are automatically mapped to namespaced versions for backward compatibility.

## 💾 Knowledge Base

Each tenant has an isolated knowledge base stored in `docs/tenants/{tenantId}/`:

```
docs/
└── tenants/
    ├── ortofaccia/
    │   ├── services.md
    │   ├── team.md
    │   └── policies.md
    └── silva-associados/
        ├── practice-areas.md
        └── attorneys.md
```

### Adding New Documents

1. Create markdown files in `docs/tenants/{tenantId}/`
2. Run seed script: `npm run seed-kb`
3. Documents are embedded and stored in `.mastra/mastra.db`

## 🧪 Testing Agents

### Using Mastra Playground

1. Start dev server: `npm run dev`
2. Open [http://localhost:4111](http://localhost:4111)
3. Navigate to "Agents" tab
4. Select an agent and test interactions

### Using CLI

Create a test script:

```typescript
// test-agent.ts
import { mastra } from './src/mastra/index.js';

const agent = mastra.agents.ortofacciaBooking;

const response = await agent.generate('Quero agendar uma consulta');
console.log(response.text);
```

Run:
```bash
npx tsx test-agent.ts
```

## 🔧 Configuration

### Adding a New Tenant

1. **Define tenant configuration** in `src/config/tenants.ts`:

```typescript
{
  id: 'new-tenant',
  name: 'New Tenant Name',
  prefix: 'NEW',
  industry: {
    type: 'custom',
    toolBundles: ['booking'],
    agentTemplates: ['booking-agent']
  },
  business: {
    location: 'City, State',
    phone: '(XX) XXXXX-XXXX',
    timezone: 'America/Sao_Paulo'
  }
}
```

2. **Create agent configuration** in `src/config/agents.ts`

3. **Add knowledge base** in `docs/tenants/new-tenant/`

4. **Seed knowledge base**: `npm run seed-kb`

### Adding a New Agent

See `src/config/agents.ts` for examples. Agents require:
- Unique ID
- Tenant ID
- Instructions/prompt
- LLM model configuration
- Tool assignments

## 📚 Technology Stack

- **Framework**: [Mastra.ai](https://mastra.ai) - AI agent orchestration
- **LLM**: OpenAI GPT-4o-mini / GPT-4o
- **Vector DB**: LibSQL (SQLite-based)
- **Embeddings**: OpenAI text-embedding-3-small
- **Validation**: Zod
- **Language**: TypeScript
- **Runtime**: Node.js >= 20.9.0

## 🔐 Security & Best Practices

- Environment variables for sensitive data (never commit `.env`)
- Tenant isolation at configuration, storage, and memory levels
- Input validation with Zod schemas
- Error handling and logging
- Type safety with TypeScript

## 📖 Documentation

- **`CLAUDE.md`**: Development guidelines and philosophy
- **Mastra Docs**: https://mastra.ai/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Commit Convention

Follow semantic commit messages:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

## 📝 License

ISC License - Copyright (c) 2025 Code Horizon

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check [Mastra documentation](https://mastra.ai/docs)
- Review `CLAUDE.md` for development guidelines

---

Built with ❤️ by [Code Horizon](https://github.com/johngrandson) using [Mastra.ai](https://mastra.ai)
