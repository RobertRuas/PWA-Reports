# PWA Reports v2.0.0

Uma aplicação web progressiva (PWA) para organização e gerenciamento de fotos de trabalho com suporte offline completo.

## 🚀 Características

- ✅ **Funciona completamente offline** - Após o carregamento inicial, a aplicação funciona sem conexão
- ✅ **Gerenciamento de projetos** - Crie e organize múltiplos projetos
- ✅ **Triagem de fotos** - Upload via drag-drop e clique
- ✅ **Organização por pastas** - Reorganize fotos entre pastas via drag-drop
- ✅ **Exportação em ZIP** - Exporte projetos em formato compatível com FastReport para Mac
- ✅ **Suporte bilíngue** - Português e English com troca rápida
- ✅ **Tema claro/escuro** - Escolha entre claro, escuro ou automático
- ✅ **Responsivo** - Funciona em desktop, tablet e mobile
- ✅ **Persistência local** - Todos os dados são armazenados no IndexedDB

## 🛠️ Tecnologias

- **Vue 3** com TypeScript e Composition API
- **Vite** para build e desenvolvimento
- **PrimeVue 4.x** para componentes de UI
- **Pinia** para state management
- **Dexie.js** para IndexedDB
- **JSZip** para exportação em ZIP
- **Workbox** para Service Worker e PWA

## 📋 Estrutura do Projeto

```
src/
├── app/                          # Configuração da aplicação
│   ├── config/                  # Configurações
│   ├── layouts/                 # Layouts (AppLayout)
│   ├── router/                  # Vue Router
│   └── App.vue                  # Componente raiz
├── components/
│   ├── ui/                      # Componentes UI reutilizáveis
│   └── feedback/                # Componentes de feedback
├── features/
│   ├── projects/                # Funcionalidade de projetos
│   ├── photos/                  # Funcionalidade de fotos
│   ├── reports/                 # Funcionalidade de exportação
│   └── settings/                # Funcionalidade de configurações
├── stores/                       # Pinia stores (state management)
├── core/
│   └── database/               # Database e schemas
├── composables/                 # Vue composables reutilizáveis
└── styles/                      # Estilos globais
```

## 📱 Fluxo de uso

### 1. HomePage - Gerenciamento de Projetos
- Visualize todos os projetos
- Crie novo projeto com nome e seleção de mapa
- Delete projetos (com confirmação)
- Clique para entrar em um projeto

### 2. ProjectPage - Visão geral do Projeto
- Veja estatísticas (total de fotos, inbox, organizadas)
- Acesse as funcionalidades principais:
  - **Triagem** - Upload de fotos
  - **Revisão** - Organização em pastas
  - **Exportação** - Download em ZIP

### 3. TriagePage - Upload de Fotos
- Drag-drop de fotos na área designada
- Ou clique para selecionar múltiplas fotos
- Todas as fotos começam na pasta "Inbox"
- Navegação para revisão

### 4. ReviewPage - Organização
- Veja todas as pastas (Inbox, General, Trash, etc)
- Arraste fotos entre pastas
- Clique em uma foto para visualizar em tela cheia
- Navegação para exportação

### 5. ViewerPage - Visualização
- Foto em tela cheia
- Informações (nome, pasta, data)
- Botão para deletar (exceto em Trash)
- Voltar para revisão

### 6. ExportPage - Exportação
- Revise informações do projeto
- Baixe ZIP com estrutura de pastas
- ZIP inclui metadados (fastreport.json)

### 7. SettingsPage - Configurações
- Mudar idioma (PT/EN)
- Escolher tema (Claro/Escuro/Automático)
- Ver informações de armazenamento
- Limpar cache
- Sobre a aplicação

## 🗄️ Estrutura de dados

### Projetos
```typescript
{
  id: string           // UUID
  name: string         // Nome do projeto
  mapId: string        // 'inspection-t24' | 'tendons-retrofit'
  createdAt: string    // ISO 8601
  updatedAt: string    // ISO 8601
}
```

### Fotos
```typescript
{
  id: string          // UUID
  projectId: string   // Referência ao projeto
  filename: string    // Nome original do arquivo
  folder: string      // Nome da pasta ('Inbox', 'General', 'Trash', etc)
  data: Blob          // Arquivo de imagem
  createdAt: string   // ISO 8601
  updatedAt: string   // ISO 8601
}
```

## 🔧 Instalação e Desenvolvimento

### Requisitos
- Node.js 18+ 
- npm ou yarn

### Setup
```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## 🚀 Deploy

A aplicação é automaticamente deployada para GitHub Pages quando há push na branch `main`.

**URL de produção:** https://robertruas.github.io/PWA-Reports/

## 📦 Exportação ZIP

A estrutura do ZIP exportado é:
```
ProjectName.zip
├── fastreport.json
├── Inbox/
│   └── photo1.jpg
├── General/
│   └── photo2.jpg
├── Trash/
└── [outras pastas customizadas]/
```

## 🌐 Traduções

Suporte a:
- **Português (pt)** - Padrão
- **English (en)**

## 🎨 Temas

- **Light** - Tema claro
- **Dark** - Tema escuro
- **Auto** - Respeita preferência do SO

## 💾 Dados e Privacidade

- ✅ **Todos os dados são locais** - Nenhum envio para servidor
- ✅ **Armazenamento IndexedDB** - Persistência automática
- ✅ **Backup via ZIP** - Exporte para segurança
- ✅ **Cache limpo sob demanda** - Limpe em Settings

---

**Desenvolvido com Claude AI**
