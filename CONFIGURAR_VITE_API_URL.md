# ⚙️ Configurar VITE_API_URL na Vercel

## 🎯 O Problema

O frontend está tentando acessar `http://localhost:4000` mesmo quando está rodando na Vercel.

## ✅ Solução

### Opção 1: Deixar sem configurar (Recomendado)

O código agora detecta automaticamente se está em produção e usa `/api` (mesmo domínio).

**Não precisa configurar nada!** O sistema vai usar `/api` automaticamente na Vercel.

### Opção 2: Configurar VITE_API_URL explicitamente

Se quiser ser explícito, adicione na Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   ```
   VITE_API_URL=/api
   ```
3. Marque para **"All Environments"**
4. Faça **Redeploy**

## 🔍 Como Verificar

Após o deploy, abra o console do navegador (F12) e execute:

```javascript
console.log('API_BASE_URL:', import.meta.env.VITE_API_URL || 'usando /api');
```

**Esperado na Vercel:**
- Se `VITE_API_URL` não estiver configurada: `'usando /api'`
- Se estiver configurada: o valor que você colocou

## 📋 Checklist

- [ ] Código atualizado (já feito ✅)
- [ ] Deploy na Vercel (aguardar 2-5 minutos)
- [ ] Testar: `https://optrasystem.vercel.app/api/health`
- [ ] Verificar console do navegador (não deve mais aparecer `localhost:4000`)

## 🐛 Se Ainda Não Funcionar

1. **Verifique o console do navegador:**
   - Abra F12 → Console
   - Procure por erros de `localhost:4000`
   - Me diga o que aparece

2. **Verifique o Build:**
   - Vá em Deployments → Build Logs
   - Procure por erros

3. **Teste a API diretamente:**
   - `https://optrasystem.vercel.app/api/health`
   - Deve retornar JSON

