# 🔧 Troubleshooting - Exames não aparecem no histórico

## Checklist de Verificação

### 1. ✅ Tabela foi criada no Supabase?

Acesse Supabase Dashboard > SQL Editor > Execute:

```sql
SELECT * FROM public.exames_atendimento LIMIT 5;
```

**Se der erro "relation does not exist":**
- Execute o arquivo `database/exames_atendimento.sql` completo no SQL Editor

---

### 2. ✅ Exames foram adicionados antes de salvar?

Na tela de atendimento:
1. Clique na aba "Exames"
2. Clique em "+ Adicionar Exame"
3. Preencha Nome do Exame e Resultado
4. Depois clique em "Salvar e Finalizar"

---

### 3. ✅ Backend está rodando?

No terminal, verifique se o backend está ativo:
```bash
cd server
npm run dev
```

Deve aparecer: `[server] listening on http://localhost:4000`

---

### 4. ✅ Verifique o Console do Navegador

Pressione **F12** e vá na aba "Console"

**Quando você salvar o atendimento, deve aparecer:**
```
📝 Salvando exames: [{nome_exame: "...", resultado: "..."}]
✅ Exame salvo: {id: "...", nome_exame: "..."}
✅ Todos os exames foram processados
```

**Se aparecer erro 404:**
- Verifique se o backend tem a rota `/exames` registrada
- Reinicie o backend

**Se aparecer erro 500:**
- Verifique se a tabela foi criada no Supabase
- Verifique os logs do backend no terminal

---

### 5. ✅ Verifique se os dados foram salvos no banco

Execute no Supabase SQL Editor:

```sql
-- Ver todos os exames cadastrados
SELECT * FROM public.exames_atendimento
ORDER BY criado_em DESC
LIMIT 10;

-- Ver exames de um atendimento específico (substitua o ID)
SELECT * FROM public.exames_atendimento
WHERE fila_id = 'SEU_FILA_ID_AQUI';
```

---

### 6. ✅ Verifique os logs do Backend

No terminal onde o backend está rodando, procure por:
```
POST /exames/:filaId
```

Se aparecer erro, copie e cole a mensagem completa.

---

## Soluções Rápidas

### Solução 1: Recriar a tabela
```sql
-- Deletar a tabela antiga (CUIDADO: apaga todos os dados)
DROP TABLE IF EXISTS public.exames_atendimento CASCADE;

-- Executar novamente o arquivo database/exames_atendimento.sql
```

### Solução 2: Verificar permissões RLS
```sql
-- Verificar se RLS está ativado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'exames_atendimento';

-- Se necessário, desativar temporariamente para testes
ALTER TABLE public.exames_atendimento DISABLE ROW LEVEL SECURITY;
```

### Solução 3: Limpar cache e recarregar

1. Pressione **Ctrl + Shift + R** (ou Cmd + Shift + R no Mac) para recarregar sem cache
2. Feche todas as abas do sistema
3. Abra novamente e faça login

---

## Teste Manual da API

Use o Thunder Client, Postman ou curl para testar:

```bash
# Criar um exame de teste
curl -X POST http://localhost:4000/exames/SEU_FILA_ID_AQUI \
  -H "Content-Type: application/json" \
  -d '{
    "nome_exame": "Teste Refração",
    "resultado": "Teste -2.00",
    "observacoes": "Teste manual"
  }'

# Buscar exames
curl http://localhost:4000/exames?fila_id=SEU_FILA_ID_AQUI
```

---

## Ainda não funciona?

Por favor, envie:
1. Screenshot do console do navegador (F12)
2. Logs do terminal do backend
3. Resultado da query: `SELECT * FROM public.exames_atendimento LIMIT 5;`





