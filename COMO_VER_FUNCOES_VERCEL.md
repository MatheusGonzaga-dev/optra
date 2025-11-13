# 🔍 Como Ver Funções Serverless na Vercel

## 📍 Onde Encontrar as Funções

### Método 1: Na Página do Deployment (Mais Fácil)

1. **Acesse:** https://vercel.com → Seu projeto
2. **Vá em:** "Deployments" (aba no topo)
3. **Clique no deployment mais recente** (o que tem o badge "Current")
4. **Role a página para baixo**
5. **Procure por:** Seção "Functions" ou "Serverless Functions"
6. **Você verá:** Lista de funções como:
   - `api/index.ts`
   - `api/health.ts`

### Método 2: Aba Functions (Se Disponível)

1. **Acesse:** https://vercel.com → Seu projeto
2. **Procure pela aba:** "Functions" (pode estar no menu lateral ou no topo)
3. **Se não aparecer:** Significa que não há funções criadas ainda

### Método 3: Verificar Logs

1. **Acesse:** https://vercel.com → Seu projeto
2. **Vá em:** "Deployments"
3. **Clique no deployment mais recente**
4. **Vá na aba:** "Logs" ou "Build Logs"
5. **Procure por:** Erros relacionados a `api/` ou "functions"

## 🐛 Se Não Aparecer Nenhuma Função

Isso significa que a Vercel não está reconhecendo os arquivos em `api/` como funções serverless.

### Possíveis Causas:

1. **Arquivos não estão na pasta `api/`**
   - Verifique se `api/index.ts` e `api/health.ts` existem

2. **Erro de build/compilação**
   - Verifique os "Build Logs" do deployment
   - Procure por erros de TypeScript ou dependências

3. **Configuração do `vercel.json`**
   - Pode estar interferindo

4. **Deploy não incluiu os arquivos**
   - Verifique se os arquivos foram commitados e enviados

## ✅ Verificação Rápida

### 1. Verificar se os arquivos existem no GitHub:

Acesse: `https://github.com/MatheusGonzaga-dev/optra/tree/main/api`

Você deve ver:
- `index.ts`
- `health.ts`

### 2. Verificar Build Logs:

1. Vá em **Deployments** → Clique no deployment mais recente
2. Vá na aba **"Build Logs"** ou **"Logs"**
3. Procure por:
   - ✅ `Compiling /api/index.ts`
   - ✅ `Compiling /api/health.ts`
   - ❌ Erros de compilação
   - ❌ `Cannot find module`
   - ❌ `SyntaxError`

### 3. Testar Diretamente:

Mesmo sem ver as funções na interface, você pode testar:

- `https://optrasystem.vercel.app/api/health`
- `https://optrasystem.vercel.app/api`

Se funcionar, as funções estão lá, só não aparecem na interface.

## 🔧 Próximos Passos

1. **Me diga:**
   - O que aparece quando acessa `/api/health`?
   - O que aparece nos Build Logs do deployment mais recente?
   - Os arquivos `api/index.ts` e `api/health.ts` existem no GitHub?

2. **Vou verificar e corrigir!**

