# PixelUp Studio — pacote profissional

## O que foi incluído
- Site responsivo inspirado nas telas fornecidas.
- Imagens de serviço e portfólio otimizadas em WebP.
- Lazy loading e carregamento assíncrono das imagens.
- SEO básico + Open Graph + JSON-LD + favicon.
- Pixel com dúvidas, calculadora matemática e orçamento detalhado.
- Formulário de orçamento inteligente.
- WhatsApp configurado para +55 81 99144-0114.
- Instagram configurado para https://www.instagram.com/pixelup_studio1/
- Barra fixa para celular com Pixel, Calculadora, Orçamento e WhatsApp.
- Estrutura para Google Analytics: preencha GOOGLE_ANALYTICS_ID no HTML.
- Endpoint /api/pixel para conectar um provedor real de IA sem expor a chave no navegador.

## Rodar localmente
1. Instale Node.js 18+.
2. Execute `npm start`.
3. Abra `http://localhost:3000`.

## Ativar IA real
1. Copie `.env.example` para `.env`.
2. Preencha `AI_API_URL`, `AI_API_KEY` e, se necessário, `AI_MODEL`.
3. Inicie o servidor.
4. O frontend já chama `/api/pixel`.

Não coloque a chave da IA no `index.html`.
