# YT2 — Login e vídeos longos (correção)

## Login
A aplicação agora possui reenvio de confirmação e recuperação de senha. O envio de e-mail é feito pelo Supabase Auth; o frontend não consegue obrigar o provedor a entregar mensagens.

O Supabase documenta que o SMTP padrão é limitado e pode enviar somente para endereços pré-autorizados; para produção, configure SMTP próprio.

Configure em Authentication > URL Configuration:
- Site URL: domínio final da Vercel
- Redirect URL: `https://SEU-DOMINIO/login.html`

## Vídeos longos
O worker agora, depois de renderizar o MP4, grava o resultado também na tabela `videos`. Assim o vídeo longo passa a aparecer na Home e no Studio.

É obrigatório manter o FFmpeg Worker ligado. A Vercel Static apenas cria a fila; ela não renderiza o MP4.

Execute `supabase-schema.sql` antes do uso.
