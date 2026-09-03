# Monetização do YouTube2

O projeto agora possui a estrutura de **monetização por vídeo**:
- conta de criador;
- pedido de análise para monetização;
- tabela `video_earnings`;
- receita estimada por vídeo;
- painel do criador com receita total;
- status de monetização.

## Importante sobre dinheiro real

A aplicação não pode simplesmente fabricar ou creditar dinheiro no navegador. Para receber receita de anúncios de verdade é necessário um **provedor de anúncios/pagamentos** e aprovação da conta (por exemplo, um programa de anúncios compatível). O valor real deve ser calculado/confirmado no backend por webhook/API e gravado em `video_earnings`.

Nesta versão, o banco está preparado para receber esses valores com segurança. Não há uma promessa de pagamento automático só por publicar um vídeo.

## Upload
Crie um bucket público chamado `videos` no Supabase Storage e configure as políticas de Storage adequadas para permitir upload autenticado e leitura pública.

## Conta
O cadastro cria o perfil do canal via trigger no Supabase. O usuário pode publicar vários vídeos, todos vinculados ao `auth.users.id`.
