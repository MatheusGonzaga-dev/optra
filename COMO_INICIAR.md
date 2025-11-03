# 🚀 Como Iniciar o Optra Vision

## ✅ Status da Configuração

### Frontend (.env) - ✅ CONFIGURADO
```env
VITE_SUPABASE_URL=https://imxvcgixvlxrllkvngsa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Backend (server/.env) - ⚠️ PRECISA DA SERVICE ROLE KEY
```env
PORT=4000
SUPABASE_URL=https://imxvcgixvlxrllkvngsa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_SUA_SERVICE_ROLE_KEY  # ← Falta configurar!
```

---

## 🔑 Passo 1: Obter a Service Role Key

1. Acesse: https://supabase.com/dashboard/project/imxvcgixvlxrllkvngsa/settings/api
2. Copie a chave **service_role** (secret)
3. Cole no arquivo `server/.env` substituindo `COLE_AQUI_SUA_SERVICE_ROLE_KEY`

---

## 📦 Passo 2: Instalar Dependências

### Backend (se ainda não fez)
```bash
cd server
npm install
```

### Frontend
```bash
cd ..  # voltar para raiz
npm install
```

---

## ▶️ Passo 3: Iniciar os Servidores

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

Deve aparecer:
```
[server] listening on http://localhost:4000
```

### Terminal 2 - Frontend
```bash
# Na raiz do projeto
npm run dev
```

Deve aparecer:
```
VITE ready in XXX ms
➜  Local:   http://localhost:8080/
```

---

## 🌐 Passo 4: Acessar o Sistema

Abra: **http://localhost:8080**

Você será redirecionado para a tela de login.

---

## 👤 Passo 5: Criar Primeiro Usuário

### No Supabase Dashboard:

1. **Vá em Authentication** → Users
2. **Clique em "Add user"** → "Create new user"
3. Preencha:
   - Email: `admin@optravision.com`
   - Password: `admin123456` (ou outra senha)
   - Auto Confirm User: ✅ **Ativado**
4. **Copie o UUID** do usuário criado

### No SQL Editor do Supabase:

Execute este SQL (substitua o UUID):

```sql
INSERT INTO usuarios (
  id,
  nome_completo,
  email,
  perfil,
  ativo
) VALUES (
  'UUID_COPIADO_AQUI',  -- ← Cole o UUID do usuário
  'Administrador',
  'admin@optravision.com',
  'ADMINISTRADOR',
  true
);
```

---

## 🔐 Passo 6: Fazer Login

1. Acesse: http://localhost:8080
2. Digite:
   - Email: `admin@optravision.com`
   - Senha: `admin123456`
3. Clique em **Entrar no Sistema**
4. Você será redirecionado para `/admin/dashboard`

---

## 🐛 Solução de Problemas

### ❌ "Cannot find module index.js"
**Causa**: Tentando executar TypeScript com node diretamente.

**Solução**: Use `npm run dev` ao invés de `node index.js`

### ❌ "Missing SUPABASE_SERVICE_ROLE_KEY"
**Causa**: Service Role Key não configurada.

**Solução**: Configure o arquivo `server/.env` com a chave correta.

### ❌ "Invalid login credentials"
**Causa**: Usuário não criado ou credenciais incorretas.

**Solução**: 
1. Verifique se criou o usuário no Supabase Auth
2. Confirme que inseriu na tabela `usuarios`
3. Use as mesmas credenciais

### ❌ Backend não inicia
**Causa**: Dependências não instaladas.

**Solução**:
```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📝 Comandos Úteis

### Backend
```bash
cd server
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm start        # Executar build
npm run lint     # Verificar código
```

### Frontend
```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Verificar código
```

---

## ✅ Checklist Completo

- [ ] Supabase configurado e tabelas criadas
- [ ] Frontend .env configurado ✅
- [ ] Backend .env configurado (SERVICE_ROLE_KEY) ⚠️
- [ ] Dependências instaladas (backend e frontend)
- [ ] Backend rodando (port 4000)
- [ ] Frontend rodando (port 8080)
- [ ] Primeiro usuário criado
- [ ] Login funcionando

---

## 🎯 Está Pronto!

Quando tudo estiver ✅:
- Backend: http://localhost:4000
- Frontend: http://localhost:8080
- Login automático detecta seu perfil e te direciona!

**Desenvolvido com 💙 para profissionais da saúde ocular**


