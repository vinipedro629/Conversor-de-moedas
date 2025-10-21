# Conversor de Moedas (HTML / CSS / JS)

Projeto simples de conversor de moedas usando a API gratuita exchangerate.host (sem chave).

## Como usar
1. Abra `index.html` localmente (ou sirva com um server estático, ex: `npx http-server .`).
2. Informe valor, selecione moedas e clique em **Converter**.
3. Histórico é salvo no `localStorage` (últimas 10 conversões).

## Notas técnicas
- Endpoint usado: `https://api.exchangerate.host/convert?from=USD&to=BRL&amount=1`. Docs: exchangerate.host. :contentReference[oaicite:2]{index=2}
- Pode-se melhorar com: caching por 10–30 minutos, PWA, suporte offline, lista mais rica de moedas (nomes + símbolos), e tratamento de limite de requisições.

