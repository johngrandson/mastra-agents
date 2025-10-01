# RAG Knowledge Architecture

## Hierarchical Organization

Knowledge is organized in a two-tier hierarchy:

### 1. Industry-Level Knowledge (Shared)

**Collections**: `industry_{type}`

Examples:

- `industry_dental` - Dental terminology, procedures, best practices
- `industry_legal` - Legal definitions, common clauses, case law references
- `industry_retail` - Product catalog standards, customer service guidelines

**Purpose**: Share common knowledge across all tenants in the same industry.

**Benefits**:

- Reduces duplication (dental terminology doesn't need to be duplicated for each dental clinic)
- Lower storage costs
- Easier to maintain (update once, applies to all tenants)
- Faster onboarding (new tenants get industry knowledge immediately)

### 2. Tenant-Level Knowledge (Specific)

**Collections**: `tenant_{id}`

Examples:

- `tenant_ortofaccia` - Ortofaccia-specific policies, team info, services
- `tenant_silva_associados` - Silva & Associados case history, attorney bios

**Purpose**: Store tenant-specific information that is unique to that business.

**Benefits**:

- Complete customization per tenant
- Privacy and data isolation
- Tenant-specific policies, branding, services

## Search Strategy

When a tenant's agent performs a RAG search:

1. **Check tenant configuration** - Which collections to search?
2. **Search industry collection** - Get shared industry knowledge
3. **Search tenant collection** - Get tenant-specific knowledge
4. **Merge and rank results** - Combine results by relevance score
5. **Return top N** - Deduplicated, ranked by similarity

## Example: Ortofaccia Dental Clinic

```typescript
// Tenant config
{
  id: 'ortofaccia',
  industry: {
    type: 'dental',
    knowledgeSources: {
      industryKnowledge: true,  // Search industry_dental
      tenantKnowledge: true,     // Search tenant_ortofaccia
    }
  }
}

// Search collections
await ragTool.search('O que é ortodontia?');
// Searches:
// 1. industry_dental → "Ortodontia: Especialidade que corrige posição dos dentes..."
// 2. tenant_ortofaccia → "Ortofaccia oferece ortodontia com Dra. Maria Julia..."

// Result: Combines both sources, ranked by relevance
```

## Configuration Options

Tenants can control which knowledge sources to use:

```typescript
// Use both industry and tenant knowledge (default)
knowledgeSources: { industryKnowledge: true, tenantKnowledge: true }

// Only tenant knowledge (fully custom)
knowledgeSources: { industryKnowledge: false, tenantKnowledge: true }

// Only industry knowledge (generic assistant)
knowledgeSources: { industryKnowledge: true, tenantKnowledge: false }
```

## Storage Estimate

**Industry collections** (shared):

- ~1000-5000 documents per industry
- ~50-250MB per collection
- **Total**: ~500MB for 7 industries

**Tenant collections** (individual):

- ~100-500 documents per tenant
- ~5-25MB per collection
- **500 tenants**: ~2.5-12.5GB

**Combined**: ~3-13GB for 500 tenants across 7 industries

**Cost savings**: ~70-80% vs duplicating industry knowledge per tenant
