# 🚀 PASSO A PASSO: Criar Tabela da Fila no Supabase

## ❗ IMPORTANTE
Você precisa executar este passo **UMA VEZ** para criar a tabela no banco de dados!

---

## 📝 Passo 1: Copiar o SQL

Abra o arquivo: **`database/fila_atendimento_simples.sql`**

Copie **TODO** o conteúdo do arquivo (Ctrl+A, Ctrl+C)

---

## 🌐 Passo 2: Abrir o Supabase

1. Acesse: **https://supabase.com**
2. Faça login na sua conta
3. Clique no seu projeto (o mesmo que você usou para criar as outras tabelas)

---

## 📊 Passo 3: Abrir o SQL Editor

1. No menu lateral esquerdo, procure por **"SQL Editor"** (ícone de console/terminal)
2. Clique em **SQL Editor**
3. Clique no botão **"+ New query"** (canto superior direito)

---

## 📋 Passo 4: Colar e Executar

1. **Cole** todo o SQL que você copiou (Ctrl+V)
2. Clique no botão **"RUN"** (canto inferior direito) ou pressione **Ctrl+Enter**
3. Aguarde alguns segundos...

---

## ✅ Passo 5: Verificar se Deu Certo

Você verá uma mensagem de sucesso:

```
✓ Success. No rows returned
```

E no final, uma linha:
```
resultado: "Tabela fila_atendimento criada com sucesso!"
```

---

## 🔍 Passo 6: Confirmar a Tabela

1. No menu lateral, clique em **"Table Editor"**
2. Você verá a tabela **`fila_atendimento`** na lista
3. Clique nela para ver as colunas

Você deve ver colunas como:
- `id`
- `paciente_id`
- `posicao`
- `tipo_atendimento`
- `status`
- `prioridade`
- `sintomas`
- etc.

---

## 🔄 Passo 7: Reiniciar o Backend

Agora que a tabela existe, reinicie o servidor:

```bash
# No terminal do servidor (dentro da pasta server/)
# Pressione Ctrl+C para parar

# Depois execute:
npm run dev
```

---

## 🎉 Passo 8: Testar!

1. Acesse o sistema
2. Vá em **Pacientes** → **Novo Paciente**
3. Cadastre um paciente com anamnese
4. Clique em **"Cadastrar e Enviar para Fila"**
5. Vá em **"Fila de Atendimento"**
6. ✅ **O paciente deve aparecer na fila!**

---

## ❓ Problemas?

### Erro: "permission denied for table fila_atendimento"
➡️ Execute o SQL novamente, pode ter falhado na primeira vez

### Erro: "relation fila_atendimento already exists"
➡️ A tabela já existe! Só reiniciar o backend (Passo 7)

### Erro: "syntax error at or near..."
➡️ Copie o SQL novamente, pode ter copiado incompleto

### Ainda não funciona?
➡️ Verifique se você está no projeto correto do Supabase (mesmo que tem as outras tabelas como `pacientes` e `usuarios`)

---

## 📸 Precisa de Ajuda Visual?

Se precisar, posso te ajudar com screenshots ou vídeo! Mas o processo é simples:

1. Supabase → SQL Editor → New query
2. Colar o SQL
3. RUN
4. Reiniciar backend
5. Testar!

---

**Executou? Me avise para testarmos juntos!** 🚀

