# 🔧 Solução: Erro de senha_hash

## ❌ Erro Encontrado

```
ERROR: 23502: null value in column "senha_hash" of relation "usuarios" violates not-null constraint
```

Este erro acontece porque a coluna `senha_hash` na tabela `usuarios` não aceita valores `null`.

---

## ✅ Solução

A coluna `senha_hash` existe mas **não é usada** para autenticação (o Supabase Auth gerencia as senhas). Você precisa passar um valor vazio `''` para essa coluna.

### SQL Corrigido

```sql
INSERT INTO usuarios (
  id,
  nome_completo,
  email,
  senha_hash,  -- ← Adicionar esta linha
  perfil,
  ativo
) VALUES (
  'COLE_O_UUID_AQUI',  -- ← Cole o UUID copiado
  'teste',
  'teste@teste.com',
  '',  -- ← Valor vazio pois auth é feita via Supabase Auth
  'ADMINISTRADOR',
  true
);
```

---

## 🎯 Por Que Isso?

- **Supabase Auth** gerencia as senhas de forma segura
- A coluna `senha_hash` na tabela `usuarios` é apenas um campo legado
- Precisamos passar `''` (vazio) para satisfazer a constraint NOT NULL
- O backend já foi atualizado para fazer isso automaticamente

---

## 📝 Notas

⚠️ **Importante**: A partir de agora, a criação de usuários pela interface do sistema já inclui o `senha_hash: ''` automaticamente.

Este guia manual é apenas para o **primeiro usuário admin**.

---

**Agora o INSERT deve funcionar!** ✅

