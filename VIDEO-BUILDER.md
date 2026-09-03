# YT2 Video Builder
O usuário seleciona seus próprios vídeos, ordena os clipes e cria um projeto de vídeo longo.
O navegador salva um manifesto em `video_projects`.

A renderização final deve ser feita por um worker de vídeo (FFmpeg/serviço de jobs), não pela Vercel Static. O worker deve concatenar/processar os clipes, enviar o MP4 ao Storage e atualizar `status=ready` e `output_video_url`.
