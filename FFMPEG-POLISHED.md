# YT2 FFmpeg Worker — Pipeline aprimorado

A versão inclui:
- fade-in de 0,5s quando `transition=fade`;
- música de fundo opcional usando `MUSIC_URL` confiável no ambiente do worker, em volume reduzido;
- legendas quando `captions=true` e `captions_url` aponta para um arquivo confiável;
- normalização 1920x1080 / 30fps / H.264 / AAC;
- atualização `queued -> processing -> ready/failed`.

## Progresso

O status do projeto pode ser consultado pelo endpoint `/api/video-project/status?id=PROJECT_ID`.

A Vercel continua servindo o frontend; o FFmpeg continua separado.
