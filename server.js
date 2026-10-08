const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const RAIZ = caminho.juntar(__dirname);
const AI_API_URL = process.env.AI_API_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "";
const MAX_BODY = 64 * 1024;

const SYSTEM_PROMPT = `
Você é Pixel, o assistente virtual da PixelUp Studio.
Responda em português do Brasil de forma clara, objetiva, educada e útil.
Você pode responder perguntas gerais, ajudar com cálculos simples, explicar matemática e orientar o visitante sobre a PixelUp Studio.
Para preços da PixelUp Studio, use somente estes valores:
Post Instagram/Facebook R$25; Story R$20; Carrossel 5 páginas R$60; Carrossel 10 páginas R$90;
Flyer digital R$35; Banner digital R$40; Panfleto R$35; Cartaz R$50; Convite digital R$35;
Cardápio digital R$80; Catálogo digital R$100; Logotipo R$150; Logo Premium R$250;
Identidade Visual R$450; Identidade Visual Premium R$700; Cartão de visita R$40;
Papel timbrado R$40; Assinatura de e-mail R$35; Apresentação profissional R$100;
Catálogo de produtos R$120; Tabela de preços R$50; Folder R$70; Panfleto R$50; Faixa R$80;
Outdoor R$100; Adesivo R$40; Etiqueta R$40; Embalagem R$100; Rótulo R$70;
Remoção de fundo R$15; Tratamento de foto R$20; Melhoria de qualidade R$25; Restauração de foto R$30;
Remoção de objetos R$25; Montagem R$30; Edição profissional R$40;
Landing Page R$350; Site institucional R$600; Site profissional R$900; Loja virtual R$1500.
Todos são preços iniciais e podem variar conforme a complexidade.
WhatsApp da empresa: (81) 99144-0114.
Instagram: @arquivo_alpha1.
Nunca invente clientes, depoimentos, endereço ou dados pessoais da empresa.
Para solicitações inadequadas ou perigosas, responda de forma segura.
`.trim();

function send(res, status, type, body) {
  res.writeHead(status, {"Content-Type": type, "Cache-Control":"no-store"});
  res.end(body);
}

async function handleAI(req, res, body) {
  let data;
  try { data = JSON.parse(body); } catch { return send(res,400,"application/json",JSON.stringify({error:"JSON inválido"})); }
  const message = String(data.message || "").trim();
  if (!message) return send(res,400,"application/json",JSON.stringify({error:"Mensagem vazia"}));

  if (!AI_API_URL || !AI_API_KEY) {
    return send(res,200,"application/json",JSON.stringify({
      reply:"Estou no modo local. Posso tirar dúvidas sobre a PixelUp Studio e fazer cálculos. Para respostas gerais mais amplas, configure o servidor de IA."
    }));
  }

  try {
    const payload = {
      model: AI_MODEL || undefined,
      messages: [
        {role:"system", content:SYSTEM_PROMPT},
        {role:"user", content:message}
      ],
      temperature:0.2
    };
    if (!payload.model) delete payload.model;

    const r = await fetch(AI_API_URL, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+AI_API_KEY},
      body:JSON.stringify(payload)
    });
    const text = await r.text();
    if (!r.ok) return send(res,502,"application/json",JSON.stringify({error:"Falha no provedor de IA",detail:text.slice(0,300)}));
    let out;
    try { out = JSON.parse(text); } catch { return send(res,502,"application/json",JSON.stringify({error:"Resposta inválida do provedor"})); }

    const reply =
      out?.choices?.[0]?.message?.content ||
      out?.choices?.[0]?.text ||
      out?.output_text ||
      out?.response ||
      out?.reply ||
      "Não consegui obter uma resposta agora.";

    return send(res,200,"application/json",JSON.stringify({reply}));
  } catch (err) {
    return send(res,500,"application/json",JSON.stringify({error:"Erro ao consultar a IA"}));
  }
}

function staticFile(req,res) {
  let reqPath = decodeURIComponent(req.url.split("?")[0]);
  if (reqPath === "/") reqPath = "/index.html";
  if (reqPath.includes("..")) return send(res,403,"text/plain; charset=utf-8","Acesso negado.");
  const file = path.join(ROOT, reqPath);
  fs.stat(file,(err,stat)=>{
    if(err || !stat.isFile()) return send(res,404,"text/plain; charset=utf-8","Página não encontrada.");
    const ext = path.extname(file).toLowerCase();
    const types = {
      ".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",
      ".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".jpg":"image/jpeg",
      ".jpeg":"image/jpeg",".png":"image/png",".ico":"image/x-icon"
    };
    const cache = ext===".html" ? "no-cache" : "public, max-age=31536000, immutable";
    res.writeHead(200,{"Content-Type":types[ext]||"application/octet-stream","Cache-Control":cache});
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer((req,res)=>{
  if(req.method==="POST" && req.url.split("?")[0]==="/api/pixel"){
    let body="", size=0;
    req.on("data",chunk=>{
      size += chunk.length;
      if(size > MAX_BODY){req.destroy();return;}
      body += chunk.toString("utf8");
    });
    req.on("end",()=>handleAI(req,res,body));
    return;
  }
  if(req.method==="GET") return staticFile(req,res);
  send(res,405,"text/plain; charset=utf-8","Método não permitido.");
});

server.listen(PORT,()=>console.log(`PixelUp Studio online em http://localhost:${PORT}`));
