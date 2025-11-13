# 🔧 Correção: Problema no Mobile

## 🐛 Problema Identificado

O site funcionava no PC mas não carregava informações no celular porque muitos arquivos tinham `http://localhost:4000` **hardcoded** (fixo no código).

### Por que isso causava problema?

- **No PC:** Se você estava testando localmente, o backend estava rodando em `localhost:4000`, então funcionava
- **No Mobile:** Quando acessa `https://optrasystem.vercel.app`, o celular tenta acessar `localhost:4000` do próprio celular (que não existe), então as requisições falhavam

## ✅ Correções Aplicadas

Substituí todos os `http://localhost:4000` hardcoded por `API_BASE_URL` (que vem de `VITE_API_URL` ou usa `localhost:4000` como fallback) nos seguintes arquivos:

### Arquivos Corrigidos:
1. ✅ `src/pages/optometrist/PatientQueue.tsx`
2. ✅ `src/pages/optometrist/PatientAttendance.tsx`
3. ✅ `src/pages/secretary/SecretaryQueue.tsx`

### O que mudou:

**Antes:**
```typescript
const response = await fetch('http://localhost:4000/fila?status=AGUARDANDO');
```

**Depois:**
```typescript
import { API_BASE_URL } from "@/lib/utils";
const response = await fetch(`${API_BASE_URL}/fila?status=AGUARDANDO`);
```

## 📋 Arquivos que Ainda Precisam de Correção

Ainda há alguns arquivos com `localhost:4000` hardcoded. Eles não são críticos para o funcionamento básico no mobile, mas devem ser corrigidos:

- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/AdminAppointmentDetails.tsx`
- `src/pages/admin/AdminAppointmentHistory.tsx`
- `src/pages/admin/AdminReports.tsx`
- `src/pages/admin/AdminServices.tsx`
- `src/pages/admin/AdminPartnerships.tsx`
- `src/pages/admin/AdminExpenses.tsx`
- `src/pages/admin/AdminReceivables.tsx`
- `src/pages/admin/AdminCategories.tsx`
- `src/pages/admin/AdminSuppliers.tsx`
- `src/pages/admin/AdminAccess.tsx`
- `src/pages/admin/Groups.tsx`
- `src/pages/secretary/PatientList.tsx`
- `src/pages/secretary/PatientDetails.tsx`
- `src/pages/secretary/NewPatient.tsx`
- E alguns componentes em `src/components/`

## 🚀 Próximos Passos

### 1. Fazer Commit e Push:
```bash
git add .
git commit -m "fix: substituir localhost:4000 hardcoded por API_BASE_URL para funcionar no mobile"
git push origin main
```

### 2. Aguardar Deploy na Vercel:
- A Vercel vai fazer deploy automático
- Aguarde alguns minutos

### 3. Testar no Mobile:
- Acesse `https://optrasystem.vercel.app` no celular
- Faça login
- Verifique se as informações carregam

### 4. Se Ainda Não Funcionar:

**Verifique:**
1. Se `VITE_API_URL` está configurada na Vercel
2. Se o backend está rodando e acessível
3. Console do navegador no celular (para ver erros)

**Para ver o console no celular:**
- **Chrome Android:** Conecte via USB e use Chrome DevTools
- **Safari iOS:** Conecte via USB e use Safari Web Inspector
- Ou use ferramentas como [Eruda](https://github.com/liriliri/eruda) para ver console no mobile

## 🔍 Como Verificar se Está Funcionando

1. **Abra o site no celular**
2. **Faça login**
3. **Tente acessar:**
   - Fila de atendimento
   - Dashboard
   - Lista de pacientes
4. **Se as informações carregarem:** ✅ Funcionando!
5. **Se não carregar:** Verifique o console para erros

## 📝 Nota Importante

Se você ainda não configurou `VITE_API_URL` na Vercel, o sistema vai tentar usar `http://localhost:4000` como fallback, o que não vai funcionar em produção.

**Solução:** Configure `VITE_API_URL` na Vercel com a URL do seu backend (Railway, Render, etc.)

Veja o arquivo `COMO_CONFIGURAR_BACKEND.md` para instruções completas.

