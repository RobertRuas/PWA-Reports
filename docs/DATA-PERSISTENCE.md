# Garantia de Persistência de Dados Locais

## 📍 Onde os dados são armazenados

### ✅ 100% Local - Nenhum servidor
Todos os dados da aplicação PWA Reports são armazenados **exclusivamente no dispositivo do usuário**, nunca em servidores externos.

### IndexedDB
- **Localização**: Armazenamento local do navegador
- **Tamanho**: Até 50GB+ dependendo do dispositivo
- **Persistência**: Permanente até o usuário apagar manualmente
- **Banco de dados**: `pwa-reports`

### Estrutura de Dados

```
pwa-reports (Database)
├── projects          # Metadados dos projetos
├── photos            # Blobs de imagens + metadados
├── syncQueue         # Fila (não usada, para futura expansão)
└── exampleRecords    # Dados de exemplo
```

## 📸 Fotos - Armazenamento Seguro

### Como as fotos são salvas

```typescript
// Em stores/photos.ts
async function addPhoto(projectId: string, folder: string, file: File) {
  const photo: Photo = {
    id: generateId(),
    projectId,        // Referência ao projeto
    filename: file.name,
    folder,
    data: file,       // Blob do arquivo original
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // Salva no IndexedDB
  await db.photos.add(photo)
}
```

### Segurança das Fotos
1. ✅ **Armazenadas como Blobs** - Formato binário puro
2. ✅ **No IndexedDB** - Não no localStorage (que é de texto)
3. ✅ **Criptografia local** - Proteção do SO/navegador
4. ✅ **Indexadas por projectId** - Rápido acesso filtrado
5. ✅ **Sem compressão automática** - Qualidade 100%

## 🗑️ Exclusão de Dados

### Quando fotos são apagadas

As fotos **NÃO** são apagadas automaticamente. Apenas dois cenários:

#### 1. **Usuário move para Trash manualmente**
```typescript
// ReviewPage.vue - Arrastar para pasta "Trash"
await photoStore.movePhoto(photoId, 'Trash')
// Foto ainda existe, apenas em outra pasta
```

#### 2. **Usuário deleta do ViewerPage**
```typescript
// ViewerPage.vue - Botão de delete
await photoStore.deletePhoto(photoId)
// Se estiver em Trash, é apagada
// Se estiver em outra pasta, vai para Trash primeiro
```

#### 3. **Projeto inteiro é deletado**
```typescript
// HomePage.vue - Delete projeto
await projectStore.deleteProject(projectId)
// Remove projeto + todas suas fotos do IndexedDB
```

#### 4. **Cache é limpo manualmente**
```typescript
// SettingsPage.vue - Clear Cache
await db.photos.clear()
await db.projects.clear()
// Apaga tudo (confirmação do usuário)
```

## 🔒 Proteção contra Perda

### Backups via ZIP
```
Qualquer momento → ExportPage → Baixar ZIP
└── projeto.zip contém todas as fotos + metadados
```

### Recuperação
1. Fotos estão em IndexedDB enquanto estiverem no browser
2. ZIP é backup para importar em outro dispositivo
3. Após atualizar browser, dados permanecem (Service Worker)

## 🌐 Características Offline

### Funciona 100% Offline
- ✅ Upload de fotos
- ✅ Organização em pastas
- ✅ Exportação ZIP
- ✅ Visualização de fotos
- ✅ Tudo sem conexão

### Service Worker
- Caches assets (CSS, JS, HTML)
- Não sincroniza dados (não há servidor)
- Todos dados já são locais

## ⚠️ Limitações Naturais

### Browser Storage
- Limite depende do dispositivo/browser
- Chrome: ~50GB
- Firefox: ~50GB
- Safari: ~50MB (mais restrito)

### Segurança
- Dados dentro da origem do site
- Não acessíveis por sites externos
- Protegidos pela sandbox do navegador

## 🔐 Garantias

### ✅ Garantido
1. Fotos nunca saem do seu dispositivo
2. Sem servidor, sem nuvem, sem sincronização
3. Sem análise de dados ou tracking
4. Sem anúncios ou conteúdo externo
5. Funciona completamente offline

### ❌ Não garantido
1. Recuperação se o browser é formatado
2. Sincronização entre dispositivos
3. Acesso remoto

### 💡 Recomendação
**Use o ZIP export regularmente** para ter backup seguro que pode ser importado em outro computador.

## 🛠️ Implementação Técnica

### Índices no IndexedDB

```typescript
db.version(1).stores({
  projects: 'id',                    // Por ID
  photos: 'id, projectId, folder',   // Por ID, projeto, pasta
  syncQueue: 'id',
  exampleRecords: 'id'
})
```

### Query rápida por projeto
```typescript
// Buscar todas fotos de um projeto
const photos = await db.photos
  .where('projectId')
  .equals(projectId)
  .toArray()
```

### Validação com Zod
```typescript
// Garante integridade
const photo = PhotoSchema.parse({...})
await db.photos.add(photo)  // Valida antes de salvar
```

## 📊 Monitoramento de Armazenamento

### Verificar uso
- SettingsPage → Storage
- Vê: Total de projetos, fotos, tamanho em MB

### Limpar se necessário
- SettingsPage → Clear Cache
- ⚠️ Apaga TUDO (irrecuperável)

---

**Resumo**: Seus dados são seus. Completamente locais, completamente seguros, completamente offline.

Desenvolvido com Claude AI
