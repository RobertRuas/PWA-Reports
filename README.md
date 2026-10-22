# PWA Reports

Organiza fotos de trabalho com triagem, revisão e exportação ZIP. Tudo fica no iPhone (IndexedDB). Sem contas nem nuvem.

Baseado no **PWA-Starter-Kit-Offline-First** com arquitetura profissional e componentes PrimeVue.

## Funcionalidades

- **Vue 3 + TypeScript** — Framework moderno com tipos
- **Offline-first** — Funciona sem internet após o primeiro carregamento
- **IndexedDB com Dexie.js** — Persistência local estruturada
- **Projetos com mapas** — T1–T24, Retrofit de tendões
- **Triagem com toque** — Organização rápida de fotos
- **Revisão com arrastar** — Mover fotos entre pastas
- **Exportação ZIP** — Compatível com FastReport para Mac
- **PWA** — Instalável com manifest e Service Worker
- **Design system** — PrimeVue + tokens CSS, tema claro/escuro
- **Testes** — Vitest para unitários

## Requisitos

- Node.js >= 22
- npm >= 10

## Início rápido

```bash
npm install
npm run dev
```

## Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint` | Verificar regras de código |
| `npm run format` | Formatar código |
| `npm run test` | Testes unitários |

## Estrutura

```
src/
  app/          — App.vue, router, layouts
  features/     — Funcionalidades isoladas (projects, photos, reports, settings)
  components/   — Componentes reutilizáveis (ui, feedback)
  core/         — Database, storage, sync
  stores/       — Estado global (Pinia)
  styles/       — Tokens CSS globais
```

## Dados locais

Os dados são armazenados no dispositivo usando IndexedDB via Dexie.js. Use a exportação para manter backups.

## Offline

Após o primeiro carregamento online bem-sucedido, a aplicação funciona sem internet. Um Service Worker gerencia o cache dos recursos estáticos.

## GitHub Pages

Deploy automático em cada push para `main`:  
https://robertruas.github.io/PWA-Reports/

## Licença

MIT
