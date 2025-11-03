# 🔐 Como Criar Usuário Admin no Supabase

Este guia te ajudará a criar o **primeiro usuário admin** manualmente:
- **Email**: `teste@teste.com`
- **Senha**: `1234`
- **Perfil**: `ADMINISTRADOR`

⚠️ **IMPORTANTE**: Este processo manual é apenas para criar o **PRIMEIRO** usuário admin. Após isso, você pode criar outros usuários diretamente pela interface do sistema em **Configurações → Adicionar Profissional**.

---

## Passo a Passo Detalhado

### 1️⃣ Criar Usuário na Autenticação do Supabase

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione o projeto: `imxvcgixvlxrllkvngsa`
3. Vá para **Authentication** → **Users** (no menu lateral esquerdo)
4. Clique no botão **"Add user"** ou **"Invite"**
5. Selecione **"Create new user"**
6. Preencha os campos:
   - **Email**: `teste@teste.com`
   - **Password**: `1234`
   - **Auto Confirm User**: ✅ **MARQUE ESTA OPÇÃO** (importante!)
7. Clique em **"Create user"** ou **"Create"**

### 2️⃣ Copiar o UUID do Usuário

Após criar o usuário, você verá o UUID dele (ex: `12345678-1234-1234-1234-123456789abc`)

**⚠️ IMPORTANTE**: Copie esse UUID, você vai precisar dele no próximo passo!

### 3️⃣ Inserir Dados na Tabela `usuarios`

1. No menu lateral do Supabase, clique em **"SQL Editor"**
2. Clique em **"New query"** ou use a área de texto existente
3. Cole o seguinte SQL (substitua o UUID pelo que você copiou):

```sql
INSERT INTO usuarios (
  id,
  nome_completo,
  email,
  senha_hash,
  perfil,
  ativo
) VALUES (
  'COLE_O_UUID_AQUI',  -- ← Cole o UUID copiado no passo anterior
  'Usuário Admin',
  'teste@teste.com',
  '',  -- senha_hash será vazio pois a autenticação é feita via Supabase Auth
  'ADMINISTRADOR',  -- Perfil de administrador
  true  -- Usuário ativo
);
```

4. Clique em **"Run"** ou pressione **Ctrl+Enter** (Windows) / **Cmd+Enter** (Mac)

### 4️⃣ Verificar se o Usuário foi Criado

1. Vá para **Table Editor** → **usuarios**
2. Você deve ver o novo usuário na lista

### 5️⃣ Fazer Login no Sistema

1. Acesse: http://localhost:8080
2. Você será direcionado para a página de login automaticamente
3. Digite:
   - **Email**: `teste@teste.com`
   - **Senha**: `1234`
4. Clique em **"Entrar no Sistema"**
5. ✅ **Você será redirecionado automaticamente** para a tela principal do admin (`/admin/dashboard`)

---

## 🔍 Verificação Visual

### Antes de Criar
- Tabela `usuarios` vazia
- Nenhum usuário na lista

### Depois de Criar
- 1 usuário na tabela `usuarios`
- Email: `teste@teste.com`
- Perfil: `ADMINISTRADOR`
- Ativo: `true`

---

## ❓ Troubleshooting

### Erro: "Email already registered"
**Solução**: O email já existe. Use outro email ou delete o usuário existente.

### Erro: "Invalid email format"
**Solução**: Verifique se o email está correto (teste@teste.com)

### Erro: "User not found" ao fazer login
**Causa**: O usuário foi criado no Auth mas não na tabela `usuarios`
**Solução**: Execute o SQL novamente com o UUID correto

### Erro: "Invalid login credentials"
**Causas possíveis**:
- Email ou senha incorretos
- Usuário não confirmado (Auto Confirm User não estava marcado)
- UUID incorreto na tabela usuarios

**Solução**: 
1. Delete o usuário no Auth
2. Crie novamente garantindo que "Auto Confirm User" está marcado
3. Execute o SQL novamente

---

## 📝 Notas Importantes

⚠️ **Segurança**: A senha `1234` é apenas para testes. Troque por uma senha forte em produção!

✅ **Boa Prática**: Após criar o primeiro admin, use a interface do sistema para criar outros usuários.

---

## 🎉 Próximos Passos

Após criar o primeiro usuário admin:

1. **Faça login** com o usuário criado
2. **Acesse** a área administrativa
3. **Use a interface** para criar novos usuários (Secretários e Optometristas)
4. **Não precisa mais** usar o Supabase Dashboard para criar usuários!

---

**Pronto!** Você agora tem um usuário admin configurado e pode fazer login no sistema. 🎉

### 📋 Resumo

- ✅ Criar o **primeiro admin** manualmente → Use este guia
- ✅ Criar **outros usuários** → Use a interface do sistema

