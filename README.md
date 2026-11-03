# Domaine XXV — Landing page (variante B) + Centro de leads

Landing page de uma só página para as 3 moradias T3 em planta em Oliveirinha (Aveiro), no formato de ficha de imóvel
(RE/MAX / Idealista), com mensagens em vez de formulário, conversa privada para o cliente e centro de leads.

## O que existe

| Rota | O quê |
|---|---|
| `/` | Ficha do imóvel: galeria, preço, lotes (disponível/reservado/vendido), descrição, características, plantas, compra em planta, simulador de crédito, localização, construtora, testemunhos, FAQ, promotor |
| `/conversa/<token>` | Conversa privada do cliente com o André (link enviado por email/SMS e guardado no dispositivo) |
| `/leads` | Centro de leads (com palavra-passe): lista, estados, notas, ligar, WhatsApp, responder no chat, exportar CSV, estado dos lotes |
| `/privacidade` | Política de privacidade (RGPD) |

**Fluxo de uma lead:** a pessoa escreve a mensagem (pré-preenchida), nome e telemóvel (email opcional) →
fica guardada na base de dados → o André recebe um **email** com botões *Ligar / WhatsApp / Abrir no centro de leads* →
a pessoa vê a confirmação “o André contacta-o ainda hoje” e o link da conversa → quando o André responde em `/leads`,
a pessoa é avisada por **email** (se deixou) e/ou **SMS** (se o Twilio estiver ligado).
Se a mesma pessoa voltar a escrever (mesmo telemóvel), a mensagem junta-se à conversa existente — sem duplicados.

**Tracking Meta:** Pixel no browser + Conversions API no servidor, com o mesmo `event_id` (deduplicação).
Eventos: `PageView`, `ViewContent` (galeria, vídeo, secções-chave), `Contact` (WhatsApp, ligar, ver número),
`CustomizeProduct` (começou a escrever / simulador), `Lead` (mensagem enviada, com telefone/email/nome encriptados em SHA-256,
`fbp`/`fbc`, IP e user agent) e `Schedule` (pedido de visita). UTMs e `fbclid` ficam gravados em cada lead.

## Alterar conteúdos

Quase tudo está em **`src/lib/config.ts`** (preço, contactos, divisões, FAQ, testemunhos, mensagens rápidas, pressupostos do simulador).
O estado dos lotes muda-se sem código em `/leads → Lotes`.

## Deploy (Vercel + Neon)

1. **GitHub** — faça push deste repositório.
2. **Vercel** → *Add New Project* → importar o repositório (deteta Next.js automaticamente).
3. **Base de dados** — no projeto da Vercel: *Storage → Create → Neon (Postgres)* → *Connect*.
   Isto cria a variável `DATABASE_URL`. As tabelas são criadas automaticamente.
4. **Variáveis de ambiente** — copie de `.env.example` para *Settings → Environment Variables* e preencha.
5. **Domínio** — *Settings → Domains*. Atualize `NEXT_PUBLIC_SITE_URL` para o domínio final e faça *Redeploy*.

### Email
- **Recomendado: Resend** (grátis até 3.000 emails/mês) com o domínio do site verificado.
  Assim os emails para os clientes saem de `andre@o-seu-dominio.pt` e o seu Gmail pessoal nunca fica público.
  `SMTP_HOST=smtp.resend.com`, `SMTP_PORT=465`, `SMTP_USER=resend`, `SMTP_PASS=<API key>`.
- Alternativa rápida: Gmail com *palavra-passe de aplicação* (`smtp.gmail.com`, porta 465). Funciona, mas os clientes veem o endereço Gmail.

### Meta
- `NEXT_PUBLIC_META_PIXEL_ID` e `META_CAPI_ACCESS_TOKEN` (Events Manager → Definições → API de Conversões → Gerar token).
- Para testar: defina `META_TEST_EVENT_CODE`, abra o site e veja em *Testar eventos*. Remova depois.

### SMS (opcional)
Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`. Sem isto, a opção “Avisar por SMS” fica desligada no centro de leads.

## Desenvolvimento local

```bash
cp .env.example .env.local   # preencher DATABASE_URL e ADMIN_PASSWORD no mínimo
npm install
npm run dev
```

Funciona com qualquer Postgres (Neon, Supabase, Railway, Docker) e em qualquer alojamento Node (`npm run build && npm start`).
