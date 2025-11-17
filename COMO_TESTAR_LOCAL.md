# 🧪 Como Testar Localmente

## ✅ Pré-requisitos

1. **Node.js instalado** (versão 18 ou superior)
2. **Backend rodando** (Railway ou local na porta 4000)
3. **Variáveis de ambiente configuradas**

---

## 🚀 Passo a Passo

### 1. Instalar Dependências

```bash
npm install
```

### 2. Criar Arquivo `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_API_URL=http://localhost:4000
```

**Ou se o backend estiver no Railway:**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_API_URL=https://optra-production.up.railway.app
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O frontend vai rodar em: **http://localhost:5173**

---

## 🔧 Comandos Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento (porta 5173)
```

### Build
```bash
npm run build        # Cria build de produção
npm run preview      # Visualiza o build de produção localmente
```

### Lint
```bash
npm run lint         # Verifica erros de código
```

---

## 📝 Notas Importantes

### Variáveis de Ambiente

- **`.env.local`** → Usado apenas localmente (não vai para o Git)
- **`.env`** → Não use este arquivo (pode ser commitado por engano)
- As variáveis devem começar com `VITE_` para serem acessíveis no frontend

### Backend

- Se o backend estiver rodando **localmente** na porta 4000, use: `VITE_API_URL=http://localhost:4000`
- Se o backend estiver no **Railway**, use a URL do Railway: `VITE_API_URL=https://optra-production.up.railway.app`

### Hot Reload

- O Vite tem **hot reload automático** - qualquer mudança no código atualiza o navegador automaticamente
- Não precisa reiniciar o servidor a cada mudança!

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 5173 already in use"
```bash
# Use outra porta
npm run dev -- --port 3000
```

### Variáveis de ambiente não funcionam
- Certifique-se de que o arquivo se chama `.env.local` (não `.env`)
- Reinicie o servidor após criar/modificar o arquivo
- As variáveis devem começar com `VITE_`

---

## ✅ Pronto!

Agora você pode:
- ✅ Desenvolver e testar localmente
- ✅ Ver mudanças em tempo real (hot reload)
- ✅ Testar antes de fazer commit
- ✅ Debuggar com mais facilidade

**Dica:** Mantenha o terminal do `npm run dev` aberto enquanto desenvolve!



