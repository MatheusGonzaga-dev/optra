# Instruções para Configurar Exames Clínicos

Este documento explica como configurar a funcionalidade de exames clínicos no sistema Optra Vision.

## 1. Criar a Tabela de Exames

Execute o script SQL no Supabase (Dashboard > SQL Editor > New Query):

```sql
-- Arquivo: database/exames_atendimento.sql
```

Copie todo o conteúdo do arquivo `exames_atendimento.sql` e execute no SQL Editor do Supabase.

## 2. Verificar a Instalação

Execute a seguinte query para verificar se a tabela foi criada corretamente:

```sql
SELECT * FROM public.exames_atendimento LIMIT 1;
```

## 3. Como Funciona

### No Frontend (Tela de Atendimento)
1. Durante o atendimento, o optometrista pode adicionar múltiplos exames
2. Para cada exame, é necessário informar:
   - **Nome do Exame** (obrigatório): Ex: Refração, Tonometria, Biomicroscopia, etc.
   - **Resultado** (obrigatório): O resultado ou descrição do exame
   - **Observações** (opcional): Informações adicionais sobre o exame

3. Os exames são salvos automaticamente quando o atendimento é finalizado ou salvo como rascunho

### Visualização do Histórico
- Os exames salvos podem ser visualizados na aba "Exames" do histórico de atendimentos
- Tanto o optometrista quanto o administrador podem visualizar os exames
- Os exames são exibidos com data de realização, nome, resultado e observações

## 4. API Endpoints

O backend fornece os seguintes endpoints:

- `GET /exames?fila_id=xxx` - Buscar exames de um atendimento
- `POST /exames/:filaId` - Criar exame para um atendimento
- `PUT /exames/:id` - Atualizar um exame existente
- `DELETE /exames/:id` - Deletar um exame

## 5. Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único do exame |
| fila_id | UUID | Referência ao atendimento (fila) |
| prontuario_id | UUID | Referência ao prontuário (opcional) |
| paciente_id | UUID | Referência ao paciente |
| nome_exame | TEXT | Nome do exame realizado |
| resultado | TEXT | Resultado ou descrição do exame |
| observacoes | TEXT | Observações adicionais (opcional) |
| data_realizacao | TIMESTAMPTZ | Data e hora da realização |
| criado_em | TIMESTAMPTZ | Data de criação do registro |
| atualizado_em | TIMESTAMPTZ | Data da última atualização |

## 6. Permissões (RLS)

As políticas de segurança (RLS) estão configuradas para:
- Todos os usuários autenticados podem **visualizar** exames
- Apenas OPTOMETRISTA e ADMINISTRADOR podem **criar e atualizar** exames

## 7. Solução de Problemas

### Erro: "relation exames_atendimento does not exist"
**Solução:** Execute o script `exames_atendimento.sql` no Supabase SQL Editor

### Exames não aparecem no histórico
**Solução:** 
1. Verifique se os exames foram salvos corretamente no banco
2. Verifique o console do navegador para erros de API
3. Certifique-se de que o backend está rodando na porta 4000

### Erro 500 ao salvar exames
**Solução:**
1. Verifique se todas as tabelas relacionadas existem (fila_atendimento, pacientes, prontuarios)
2. Verifique os logs do backend para mais detalhes
3. Certifique-se de que o usuário tem permissões adequadas



