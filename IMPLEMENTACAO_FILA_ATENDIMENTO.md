# 🏥 Implementação da Fila de Atendimento

Este documento explica como ativar a funcionalidade de **Fila de Atendimento** no Optra Vision.

---

## 📋 O que foi implementado?

### Backend
- ✅ **Nova tabela `fila_atendimento`** no banco de dados Supabase
- ✅ **API completa** em `/fila` com endpoints:
  - `GET /fila` - Listar todos na fila
  - `GET /fila/:id` - Obter detalhes de um item da fila
  - `POST /fila` - Adicionar paciente à fila
  - `PUT /fila/:id` - Atualizar status (aguardando, em atendimento, atendido)
  - `PUT /fila/:id/posicao` - Alterar posição na fila
  - `POST /fila/:id/chamar` - Chamar paciente para atendimento
  - `POST /fila/:id/finalizar` - Finalizar atendimento
  - `DELETE /fila/:id` - Remover da fila (soft delete)

### Frontend
- ✅ **Cadastro de paciente com anamnese** já envia automaticamente para a fila
- 🔄 Próximos passos: Integrar telas de visualização da fila

---

## 🚀 Como Ativar

### Passo 1: Executar o Script SQL no Supabase

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá em **SQL Editor** (no menu lateral esquerdo)
3. Clique em **+ New query**
4. Copie todo o conteúdo do arquivo `database/fila_atendimento.sql`
5. Cole no editor SQL
6. Clique em **RUN** (ou pressione Ctrl+Enter)
7. Verifique se a tabela foi criada:
   - Vá em **Table Editor** > **fila_atendimento**
   - Você deve ver a nova tabela vazia

### Passo 2: Reiniciar o Backend

O backend precisa ser reiniciado para carregar a nova rota `/fila`.

```bash
# No terminal do servidor (dentro da pasta server/)
# Pressione Ctrl+C para parar o servidor
# Depois execute novamente:
npm run dev
```

Você verá a mensagem:
```
[server] listening on http://localhost:4000
```

### Passo 3: Testar a Funcionalidade

#### 3.1 Cadastrar um Paciente com Anamnese

1. Acesse a tela de **Pacientes**
2. Clique em **Novo Paciente**
3. Preencha os dados pessoais
4. **NÃO marque** "Pular Anamnese"
5. Preencha a anamnese:
   - Sintomas
   - Medicamentos
   - Tipo de Exame
6. Clique em **Cadastrar e Enviar para Fila**

✅ Você verá duas notificações:
- "Paciente cadastrado com sucesso!"
- "Paciente adicionado à fila de atendimento!"

#### 3.2 Verificar a Fila (via API)

Abra o navegador e acesse:
```
http://localhost:4000/fila
```

Você verá um JSON com os pacientes na fila:

```json
[
  {
    "id": "uuid-aqui",
    "paciente_id": "uuid-do-paciente",
    "posicao": 1,
    "tipo_atendimento": "CONSULTA_COMPLETA",
    "status": "AGUARDANDO",
    "prioridade": "NORMAL",
    "sintomas": "Visão embaçada...",
    "hora_chegada": "2025-10-31T18:30:00.000Z",
    "pacientes": {
      "id": "...",
      "nome_completo": "Nome do Paciente",
      "cpf": "123.456.789-00",
      ...
    }
  }
]
```

---

## 📊 Estrutura da Tabela `fila_atendimento`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `paciente_id` | UUID | Referência ao paciente |
| `posicao` | INTEGER | Posição na fila (1 = primeiro) |
| `tipo_atendimento` | ENUM | `CONSULTA_COMPLETA`, `REFRACAO`, `RETORNO`, `EXAME_LENTE_CONTATO` |
| `status` | ENUM | `AGUARDANDO`, `EM_ATENDIMENTO`, `ATENDIDO`, `CANCELADO` |
| `prioridade` | ENUM | `NORMAL`, `ALTA`, `URGENTE` |
| `sintomas` | TEXT | Sintomas relatados |
| `usa_medicamentos` | BOOLEAN | Se usa medicamentos |
| `medicamentos_lista` | TEXT | Lista de medicamentos |
| `optometrista_id` | UUID | Optometrista responsável |
| `hora_chegada` | TIMESTAMP | Hora de entrada na fila |
| `hora_chamada` | TIMESTAMP | Hora que foi chamado |
| `hora_inicio_atendimento` | TIMESTAMP | Início do atendimento |
| `hora_fim_atendimento` | TIMESTAMP | Fim do atendimento |
| `tempo_espera_minutos` | INTEGER | Calculado automaticamente |
| `valor_consulta` | DECIMAL | Valor da consulta |
| `forma_pagamento` | ENUM | Método de pagamento |
| `observacoes` | TEXT | Observações adicionais |

---

## 🔄 Fluxo Completo da Fila

### 1. Cadastro do Paciente
```
Secretária → Cadastra paciente → Preenche anamnese → Envia para fila
```

### 2. Gerenciamento da Fila (Secretária)
```
Visualizar fila → Alterar prioridade → Reordenar posições → Confirmar pagamento
```

### 3. Atendimento (Optometrista)
```
Ver fila → Chamar próximo paciente → Iniciar atendimento → Finalizar
```

---

## 🧪 Testando os Endpoints Manualmente

### Adicionar Paciente à Fila

```bash
curl -X POST http://localhost:4000/fila \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": "uuid-do-paciente-aqui",
    "tipo_atendimento": "CONSULTA_COMPLETA",
    "sintomas": "Visão embaçada",
    "usa_medicamentos": false,
    "prioridade": "NORMAL",
    "valor_consulta": 180,
    "forma_pagamento": "PENDENTE"
  }'
```

### Listar Fila

```bash
curl http://localhost:4000/fila
```

### Chamar Paciente

```bash
curl -X POST http://localhost:4000/fila/{id}/chamar \
  -H "Content-Type: application/json" \
  -d '{
    "optometrista_id": "uuid-do-optometrista"
  }'
```

### Finalizar Atendimento

```bash
curl -X POST http://localhost:4000/fila/{id}/finalizar
```

---

## 🎯 Próximos Passos

### Para Completar a Funcionalidade

1. ✅ Backend da fila implementado
2. ✅ Cadastro de paciente integrado com fila
3. 🔄 **Atualizar `SecretaryQueue.tsx`** para usar dados reais da API
4. 🔄 **Atualizar `PatientQueue.tsx`** (optometrista) para usar dados reais
5. 🔄 Adicionar botão "Enviar para Fila" na tela de detalhes do paciente
6. 🔄 Implementar painel em tempo real com WebSockets (opcional)

---

## ❓ Troubleshooting

### Erro: "relation fila_atendimento does not exist"
➡️ Execute o script SQL no Supabase (Passo 1)

### Erro: "Cannot GET /fila"
➡️ Reinicie o servidor backend (Passo 2)

### Paciente não é adicionado à fila automaticamente
➡️ Verifique se preencheu a anamnese e **NÃO marcou** "Pular Anamnese"

### Erro de permissão no Supabase
➡️ Verifique as políticas RLS (Row Level Security) no Supabase Dashboard

---

## 📞 Suporte

Se encontrar algum problema, verifique:
1. ✅ Tabela `fila_atendimento` existe no Supabase
2. ✅ Backend está rodando em `http://localhost:4000`
3. ✅ Frontend está rodando
4. ✅ Variáveis de ambiente configuradas corretamente

---

**Implementado em:** 31/10/2025  
**Versão:** 1.0.0

