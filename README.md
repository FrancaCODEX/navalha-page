# Navalha 27 — site estático

HTML, CSS e JavaScript puros. Sem dependências, sem build, sem backend.

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Estrutura, textos e SEO (meta tags, Open Graph) |
| `assets/config.js` | **Dados comerciais**: WhatsApp, Instagram, endereço, horários e mensagens de agendamento |
| `assets/styles.css` | Visual e responsividade (mobile/tablet até 1023 px; desktop a partir de 1024 px) |
| `assets/app.js` | Aplica os dados do `config.js`, menu, realce da seção atual, galeria e depoimentos |
| `assets/` | Imagens otimizadas (JPEG/PNG), ícones com transparência, fontes e licenças |
| `robots.txt` | Permite indexação |
| `public/_headers` | Cabeçalhos de segurança e cache (Cloudflare) |
| `wrangler.jsonc` | Configuração do Cloudflare Workers (assets estáticos em `public/`) |

## Alterar dados comerciais

Edite só `assets/config.js`. Ele atualiza automaticamente:
- todos os botões de agendamento (`data-booking` no HTML) → `wa.me` com a mensagem do serviço;
- o telefone exibido, os links e o @ do Instagram, o endereço (com link para o Google Maps) e os horários;
- os dados estruturados (schema.org `BarberShop`) para buscadores.

O HTML mantém os mesmos valores como conteúdo de reserva (aparece sem JavaScript). Se mudar um dado,
atualize também o texto correspondente no `index.html` e a `description` das meta tags.

Para um novo botão de agendamento: `<a class="btn2" href="https://wa.me/NUMERO" target="_blank" rel="noopener" data-booking="CHAVE">`
e crie `CHAVE` em `mensagens` no `config.js`.

## Executar localmente

Abrir `index.html` direto no navegador funciona. Para testar como em produção, sirva a pasta:

```
jwebserver -p 8027 -d public      # Java 18+
npx serve public                               # Node
python -m http.server 8027 -d public           # Python
```

## Publicar no Cloudflare

O projeto é só arquivos estáticos em `public/`, sem etapa de build.

**Workers (recomendado, usa `wrangler.jsonc`):**

```
npx wrangler login
npx wrangler deploy
```

Ou, no painel: Workers & Pages → Create → Import a repository → este repositório.
Build command: vazio · Deploy command: `npx wrangler deploy`.

**Pages (alternativa):** Create → Pages → conectar o repositório. Framework: None ·
Build command: vazio · Build output directory: `public`.

Teste local equivalente ao Cloudflare: `npx wrangler dev`.

Depois de definir o domínio:
1. No `<head>` do `public/index.html`, adicione `canonical` e `og:url` (há um comentário no local) e troque
   `og:image` por URL absoluta (`https://SEU-DOMINIO/assets/og-image.jpg`).
2. Opcional: crie `public/sitemap.xml` e referencie-o no `public/robots.txt`.
3. Cadastre o site no Google Search Console e no Perfil da Empresa no Google.

`docs/` guarda a referência visual e o wireframe; não é publicado.
