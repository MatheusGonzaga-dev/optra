# 🆓 Plataformas Gratuitas para Hospedar Backend

## 🚂 Railway (Recomendado) ⭐

**Plano Gratuito:**
- $5 de crédito grátis por mês
- Sem cold start
- Deploy automático via GitHub
- HTTPS automático

**Limites:**
- 512MB RAM por serviço
- CPU compartilhado

**Link:** https://railway.app

---

## 🎨 Render

**Plano Gratuito:**
- Totalmente gratuito (sem limite de crédito)
- Deploy automático via GitHub
- HTTPS automático

**Limitações:**
- ⚠️ Cold start: ~30 segundos após 15 min de inatividade
- Serviço "dorme" após inatividade

**Link:** https://render.com

---

## 🚀 Fly.io

**Plano Gratuito:**
- 3 VMs compartilhadas grátis
- 160GB transferência/mês
- Sem cold start

**Limites:**
- 256MB RAM por VM
- CPU compartilhado

**Link:** https://fly.io

---

## ☁️ Google Cloud Run

**Plano Gratuito:**
- 2 milhões de requisições/mês
- 360.000 GB-segundos de memória
- 180.000 vCPU-segundos

**Limitações:**
- Cold start (pode demorar alguns segundos)
- Requer cartão de crédito (mas não cobra se ficar dentro do limite)

**Link:** https://cloud.google.com/run

---

## 🔷 Heroku

**Plano Gratuito:**
- ❌ **REMOVIDO em 2022** - Não oferece mais plano gratuito
- Agora só tem planos pagos (a partir de $5/mês)

**Link:** https://heroku.com (não recomendado - só pago)

---

## 🐳 Railway (Alternativa Docker)

**Plano Gratuito:**
- Similar ao Railway normal
- Suporta Docker
- $5 de crédito grátis/mês

**Link:** https://railway.app (mesma plataforma)

---

## 🌐 Vercel (Serverless Functions)

**Plano Gratuito:**
- 100GB bandwidth/mês
- Serverless functions
- Deploy automático

**Limitações:**
- ⚠️ Funções têm timeout de 10s (Hobby)
- Cold start
- Pode ser complicado adaptar Express

**Link:** https://vercel.com (já está usando para frontend)

---

## 🔥 Firebase Functions

**Plano Gratuito:**
- 2 milhões de invocações/mês
- 400.000 GB-segundos
- 200.000 CPU-segundos

**Limitações:**
- Precisa adaptar código para Firebase
- Cold start
- Requer conta Google

**Link:** https://firebase.google.com

---

## 📊 Comparação Completa

| Plataforma | Plano Grátis | Cold Start | Facilidade | Melhor Para |
|------------|--------------|------------|------------|-------------|
| **Railway** | $5/mês crédito | ❌ Não | ⭐⭐⭐⭐⭐ | ⭐ **Melhor opção geral** |
| **Render** | Ilimitado | ✅ Sim (~30s) | ⭐⭐⭐⭐ | Projetos pessoais |
| **Fly.io** | 3 VMs | ❌ Não | ⭐⭐⭐ | Projetos técnicos |
| **Cloud Run** | 2M req/mês | ✅ Sim | ⭐⭐⭐ | Projetos Google |
| **Vercel** | 100GB/mês | ✅ Sim | ⭐⭐⭐ | Serverless simples |
| **Firebase** | 2M inv/mês | ✅ Sim | ⭐⭐ | Apps Firebase |
| **Heroku** | ❌ Removido | - | - | Não usar |

---

## 🎯 Recomendações por Situação

### Para seu projeto (Optra Vision):

**1ª Opção: Railway** ⭐
- Melhor experiência (sem cold start)
- Fácil de configurar
- $5 grátis geralmente suficiente

**2ª Opção: Render**
- 100% gratuito
- Aceita cold start de ~30s

**3ª Opção: Fly.io**
- Se quiser mais controle técnico
- Sem cold start

### Se quiser 100% gratuito sem limites:

**Render** é a melhor opção, mas aceite o cold start.

---

## 💡 Dica Extra: Combinar Serviços

Você pode usar:
- **Frontend:** Vercel (já está usando) ✅
- **Backend:** Railway ou Render
- **Banco de Dados:** Supabase (já está usando) ✅

Tudo gratuito! 🎉

---

## 🔍 Como Escolher?

### Escolha Railway se:
- ✅ Quer a melhor experiência
- ✅ Não se importa com limite de $5/mês
- ✅ Quer simplicidade

### Escolha Render se:
- ✅ Quer 100% gratuito sem limites
- ✅ Aceita cold start de ~30s
- ✅ Projeto pessoal/teste

### Escolha Fly.io se:
- ✅ Quer mais controle técnico
- ✅ Conhece Docker
- ✅ Quer sem cold start e gratuito

---

## 📝 Resumo Rápido

**Top 3 Recomendadas:**

1. **Railway** - Melhor experiência geral ⭐
2. **Render** - 100% gratuito (com cold start)
3. **Fly.io** - Técnico e gratuito

**Todas têm:**
- ✅ Deploy automático via GitHub
- ✅ HTTPS automático
- ✅ Logs disponíveis
- ✅ Fácil de configurar

---

## 🆘 Qual Escolher?

Para seu projeto, recomendo **Railway** ou **Render**:

- **Railway:** Se quiser melhor experiência (sem cold start)
- **Render:** Se quiser 100% gratuito sem limites

Quer que eu te guie no deploy em alguma delas?

