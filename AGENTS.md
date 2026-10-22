# Regras para agentes de IA

## Antes de editar

1. Consultar este arquivo e `docs/AI-INDEX.md` antes de alterar qualquer módulo.
2. Ler o código existente da área afetada e reutilizar padrões implementados.
3. Não recriar componentes ou serviços que já existem sem justificativa.

## Arquitetura

- **Interface/páginas**: exibir dados, receber ações, mostrar estados. Não acessar IndexedDB diretamente.
- **Serviços/casos de uso**: regras de negócio. Não depender de componentes visuais.
- **Repositórios**: ler e gravar dados via contratos previsíveis. Ficam em `src/core/database/repositories/`.
- **Persistência**: IndexedDB via Dexie.js em `src/core/database/db.ts`.

## Interface visual

- **Framework de UI**: PrimeVue 4.x com tema Aura (licença MIT). Usar exclusivamente componentes oficiais do PrimeVue.
- **Não utilizar**: Tailwind CSS, Bootstrap, Vuetify ou outras bibliotecas de UI externas.
- **Tema**: `@primeuix/themes/aura` configurado em `src/main.ts`.
- **Ícones**: PrimeIcons (`primeicons`).
- **Layout**: `AppLayout.vue` com sidebar (desktop) e bottom tabs (mobile). Não recriar o layout antigo com TabsLayout.
- **Componentes reutilizáveis**: `src/components/ui/` e `src/components/feedback/`.
- **Estilos globais**: `src/styles/global.css` — mínimo necessário, variáveis CSS do PrimeVue.
- **Estilos personalizados**: usar `<style scoped>` nos componentes, com variáveis CSS do PrimeVue (`var(--p-*)`).

## Regras obrigatórias

- Manter separação entre interface, casos de uso e persistência.
- Componentes não devem importar diretamente a instância do Dexie.
- Operações que devem funcionar offline não podem fazer chamadas de rede.
- Não apagar ou recriar o banco para resolver uma migração.
- Não adicionar dependências sem necessidade comprovada.
- Não adicionar funcionalidade de domínio ao núcleo genérico.
- Criar ou atualizar testes para toda mudança de regra importante.
- Executar `npm run check` e relatar os resultados.
- Atualizar documentação quando mudar comportamento ou arquitetura.
- Inputs devem ter `font-size >= 16px` (CSS px) para evitar zoom no iOS Safari.
- Não usar `user-scalable=no` nem `maximum-scale=1`.

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run type-check   # Verificar tipos TypeScript
npm run lint         # Verificar regras de código
npm run test         # Testes unitários
npm run check        # Todas as verificações
```

## Estrutura de pastas

```
src/
  app/          — App.vue, router, layouts (AppLayout), configuração, páginas de exemplo
  components/   — Componentes reutilizáveis (ui, feedback)
  features/     — Funcionalidades específicas (cada uma isolada)
  core/         — Banco, rede, storage, sync, erros, validação
  composables/  — Composables Vue reutilizáveis
  stores/       — Estado global (Pinia)
  styles/       — Estilos globais mínimos
```

## Convenções

- Código em inglês, comentários e documentação em português do Brasil.
- Validação com Zod para formulários, importações e dados externos.
- IDs com `crypto.randomUUID()`.
- Datas em ISO 8601 UTC.
- Todos os componentes visuais devem usar PrimeVue exclusivamente.
