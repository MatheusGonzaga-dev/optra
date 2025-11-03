# 🔍 Como Ver a Opção "Chamar Paciente"

## ⚠️ IMPORTANTE

A opção **"Chamar Paciente"** só aparece quando você está logado como **Optometrista**!

Se você está logado como **Administrador**, verá: Subir, Descer, Editar, Remover
Se você está logado como **Optometrista**, verá: **Chamar Paciente**

---

## 🚀 Como Criar um Usuário Optometrista

### **Método 1: Pela Interface (Recomendado)**

1. **Faça login como Admin**
2. Vá em **"Acessos"** no menu lateral
3. Clique em **"Adicionar Profissional"**
4. Preencha:
   - Nome: `Dr. João Optometrista`
   - Email: `optometrista@clinica.com`
   - CPF: `111.222.333-44`
   - Telefone: `(11) 99999-9999`
   - Endereço: `Rua Teste, 123`
   - Função: **Optometrista**
   - Senha: `senha123`
5. Clique em **"Cadastrar"**
6. ✅ Usuário criado!

### **Método 2: Via SQL no Supabase**

Se preferir criar diretamente no banco:

1. Acesse **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute:

```sql
-- Criar usuário no Auth primeiro
-- Depois copie o UUID que será gerado e use no INSERT abaixo

INSERT INTO usuarios (
  id,
  nome_completo,
  email,
  senha_hash,
  perfil,
  telefone,
  ativo
) VALUES (
  'uuid-gerado-aqui',  -- Cole o UUID do usuário criado no Auth
  'Dr. João Optometrista',
  'optometrista@clinica.com',
  '',
  'OPTOMETRISTA',
  '(11) 99999-9999',
  true
);
```

---

## 🧪 Como Testar o "Chamar Paciente"

### **Passo 1: Criar um Optometrista**
Siga o método acima para criar um usuário optometrista.

### **Passo 2: Fazer Login como Optometrista**
1. Clique em **"Sair"** no menu
2. Faça login com:
   - Email: `optometrista@clinica.com`
   - Senha: `senha123`
3. ✅ Você será redirecionado para `/optometrist/dashboard`

### **Passo 3: Ir para Fila**
1. No menu lateral, clique em **"Fila de Atendimento"**
2. Você verá todos os pacientes aguardando
3. ✅ Cada paciente terá o botão **"Chamar Paciente"**!

### **Passo 4: Chamar um Paciente**
1. Clique em **"Chamar Paciente"** em qualquer paciente
2. ✅ O sistema vai:
   - Atualizar status para "Em Atendimento"
   - Abrir a tela de atendimento
   - Mostrar prescrição e dados do paciente

---

## 🎯 Diferença entre Perfis

### **Administrador** vê:
- Subir ↑
- Descer ↓
- Editar ✏️
- Remover ❌

### **Optometrista** vê:
- **Chamar Paciente** 🎯

### **Secretária** vê:
- Subir ↑
- Descer ↓
- Editar ✏️
- Remover ❌

---

## 📝 Por Que Assim?

Esta divisão faz sentido:
- **Secretária/Admin**: Gerencia a fila (adiciona, remove, reordena)
- **Optometrista**: Apenas chama pacientes para atendimento

O optometrista não precisa mexer na ordem da fila, ele só precisa chamar o próximo!

---

## ✅ Resumo

1. Crie um optometrista em **Acessos → Adicionar Profissional**
2. Faça login como optometrista
3. Vá em **Fila de Atendimento**
4. ✅ Verá o botão **"Chamar Paciente"**!

---

**Agora você consegue testar todo o fluxo!** 🎉

