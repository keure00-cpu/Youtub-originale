# YT2 FFmpeg Worker

Este worker é separado do site Vercel Static.

## Variáveis

`SUPABASE_URL`
`SUPABASE_SERVICE_ROLE_KEY`
`POLL_MS` (opcional)

## Pré-requisitos

- Docker
- FFmpeg
- Storage bucket `videos` criado no Supabase

## Execução

Dentro de `worker/`:

```bash
docker build -t yt2-ffmpeg-worker .
docker run --restart unless-stopped \
  -e SUPABASE_URL="https://SEU_PROJETO.supabase.co" \
  -e SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE" \
  yt2-ffmpeg-worker
```

O worker busca projetos `queued`, marca como `processing`, baixa os clipes autorizados, normaliza para 1080p/30fps H.264/AAC, concatena, envia o MP4 ao bucket `videos` e marca o projeto como `ready`.

## Segurança

A service-role key deve existir SOMENTE no worker/servidor. Nunca coloque essa chave no frontend.

## Limitação atual

A versão inicial concatena os clipes e normaliza o formato. A opção de fade, música e legendas está registrada no manifesto do Builder, mas ainda não é aplicada pelo FFmpeg. Essas funções podem ser adicionadas ao pipeline na próxima versão.
