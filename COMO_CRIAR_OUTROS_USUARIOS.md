# 👥 Como Criar Outros Usuários no Sistema

Após criar o primeiro usuário admin usando o guia `CRIAR_USUARIO_ADMIN.md`, você pode criar **todos os outros usuários** diretamente pela interface do sistema!

---

## ✅ Pré-requisitos

1. ✅ Você já tem um usuário admin criado
2. ✅ Você fez login como admin
3. ✅ O backend está rodando em `http://localhost:4000`

---

## 🚀 Processo Simples: Pela Interface

### Passo 1: Acessar Configurações

1. Faça **login** no sistema com sua conta admin
2. Você será redirecionado para `/admin/dashboard`
3. No menu lateral, encontre **"Configurações"** ou **"Administração"**
4. Clique em **"Adicionar Profissional"** ou **"Novo Usuário"**

### Passo 2: Preencher os Dados

Preencha o formulário com:
- **Nome Completo**: Nome da pessoa
- **CPF**: Documento pessoal
- **Telefone**: Contato
- **Endereço**: Endereço completo
- **Função**: Secretária ou Optometrista
- **Email**: Email para login
- **Senha**: Senha inicial (mínimo 6 caracteres)

### Passo 3: Confirmar

Clique em **"Cadastrar Profissional"** e pronto! 🎉

O sistema **automaticamente**:
- ✅ Cria o usuário no Supabase Authentication
- ✅ Insere os dados na tabela `usuarios`
- ✅ Define as permissões corretas
- ✅ Envia notificação de sucesso

---

## 🔧 Como Funciona (Técnico)

Quando você clica em "Cadastrar Profissional":

1. **Frontend** (`AddStaffDialog.tsx`) envia dados para API
2. **Backend** (`/usuarios` POST) recebe os dados
3. **Supabase Admin API** cria o usuário no Auth (com Service Role Key)
4. **Backend** insere dados na tabela `usuarios`
5. **Resposta** retorna ao frontend com sucesso

### Endpoints da API

```
POST http://localhost:4000/usuarios
Content-Type: application/json

{
  "nome_completo": "João Silva",
  "email": "joao@clinica.com",
  "senha": "senha123",
  "perfil": "SECRETARIA",
  "telefone": "(11) 98765-4321",
  "crm": null,
  "estado_crm": null
}
```

---

## 📋 Perfis Disponíveis

- **SECRETARIA**: Gestão de pacientes, agendamentos e fila
- **OPTOMETRISTA**: Atendimento clínico e histórico de consultas
- **ADMINISTRADOR**: Acesso completo (apenas via primeiro usuário ou convite)

---

## 🎯 Vantagens de Usar a Interface

✅ **Não precisa** acessar o Supabase Dashboard  
✅ **Não precisa** copiar UUIDs  
✅ **Não precisa** escrever SQL  
✅ **Validação automática** de dados  
✅ **Feedback visual** de sucesso/erro  
✅ **Segurança garantida** pelo backend  
✅ **Processo rápido** e intuitivo  

---

## 🆘 Problemas Comuns

### "Erro ao criar usuário"
**Causa**: Backend não está rodando ou Service Role Key incorreta  
**Solução**: Verifique se `cd server && npm run dev` está rodando

### "Email já cadastrado"
**Causa**: O email já existe no sistema  
**Solução**: Use outro email ou delete o usuário existente

### "Rede de comunicação corrompida"
**Causa**: Backend não está acessível  
**Solução**: Verifique se a URL `http://localhost:4000` está correta

---

## 📝 Notas

- A senha inicial pode ser alterada pelo próprio usuário após login
- Emails devem ser únicos no sistema
- O perfil define as permissões de acesso
- Usuários podem ser desativados pela interface admin

---

**Simples assim!** 🎉 Você nunca mais precisa acessar o Supabase Dashboard para criar usuários!

