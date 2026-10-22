# Arquitetura da Aplicação PWA Reports

## Visão Geral

PWA Reports é construída seguindo princípios de separação de preocupações, com camadas bem definidas para interface, estado, negócio e persistência.

## Camadas

### 1. **Interface (Components)**
Componentes Vue responsáveis apenas por:
- Renderizar dados
- Capturar interações do usuário
- Exibir estados da aplicação

**Localização:** `src/features/`, `src/components/`

### 2. **Estado (Stores - Pinia)**
Gerenciamento centralizado com Pinia:
- `ProjectsStore` - estado de projetos
- `PhotosStore` - estado de fotos
- `I18nStore` - estado de idioma

**Localização:** `src/stores/`

### 3. **Lógica de Negócio (Composables)**
Código reutilizável para operações complexas:
- `useProjects` - operações com projetos
- `usePhotos` - operações com fotos

**Localização:** `src/composables/`

### 4. **Persistência (Database)**
Camada de acesso aos dados via Dexie.js:
- **db.ts** - Configuração Dexie com tabelas
- **schemas/** - Definições Zod para validação

**Localização:** `src/core/database/`

## Fluxo de Dados

```
User Input → Component
    ↓
Component chama Composable
    ↓
Composable valida e chama Store
    ↓
Store chama Database
    ↓
Database (Dexie) persiste no IndexedDB
    ↓
Store atualiza (reatividade)
    ↓
Component re-renderiza
```

## Padrões

1. **Componentes** - apenas exibem dados e disparam eventos
2. **Composables** - encapsulam lógica reutilizável
3. **Stores** - mantêm estado reativo
4. **Database** - persiste dados no IndexedDB

## Offline-First

✅ Funciona 100% offline após primeira carga
✅ Todos dados salvos localmente no IndexedDB
✅ Imagens como Blobs
✅ Sem sincronização remota

---

**Desenvolvido com Claude AI**
