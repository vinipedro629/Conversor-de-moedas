// app.js - Conversor de Moedas (HTML/CSS/JS puro)
// API usada: exchangerate.host (endpoints /symbols e /convert). Docs: https://api.exchangerate.host/ (sem API key)
// Referência: exchangerate.host docs. :contentReference[oaicite:1]{index=1}

const API_BASE = 'https://api.exchangerate.host';

const amountEl = document.getElementById('amount');
const fromEl = document.getElementById('from');
const toEl = document.getElementById('to');
const convertBtn = document.getElementById('convertBtn');
const swapBtn = document.getElementById('swapBtn');
const resultEl = document.getElementById('result');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

const HISTORY_KEY = 'currency_converter_history_v1';
const SYMBOLS_CACHE_KEY = 'currency_symbols_cache_v1';

// Helpers
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function setText(el, txt){ el.textContent = txt; }
function formatMoney(value, currency){
  try {
    return new Intl.NumberFormat(undefined, { style:'currency', currency }).format(value);
  } catch (e) {
    return `${value.toFixed(2)} ${currency}`;
  }
}

// fetch helpers with basic error handling
async function fetchJson(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Erro na requisição: ${res.status}`);
  return res.json();
}

// Carrega lista de símbolos (moedas) e popula selects
async function loadSymbols(){
  // tenta cache local (1 dia)
  const cached = localStorage.getItem(SYMBOLS_CACHE_KEY);
  if(cached){
    try{
      const parsed = JSON.parse(cached);
      populateSymbols(parsed);
      return;
    } catch {}
  }

  try {
    const data = await fetchJson(`${API_BASE}/symbols`);
    if(data && data.symbols){
      const symbols = Object.keys(data.symbols).sort();
      localStorage.setItem(SYMBOLS_CACHE_KEY, JSON.stringify(symbols));
      populateSymbols(symbols);
    }
  } catch (err) {
    console.error('Falha ao carregar símbolos', err);
    // fallback mínimo: algumas moedas comuns
    populateSymbols(['USD','EUR','BRL','GBP','JPY','CAD','AUD']);
  }
}

function populateSymbols(symbolsArray){
  // Limpa selects
  fromEl.innerHTML = '';
  toEl.innerHTML = '';
  symbolsArray.forEach(code=>{
    const opt1 = document.createElement('option');
    opt1.value = code;
    opt1.textContent = code;
    const opt2 = opt1.cloneNode(true);
    fromEl.appendChild(opt1);
    toEl.appendChild(opt2);
  });
  // valores padrão
  fromEl.value = 'USD';
  toEl.value = 'BRL';
}

// Conversão usando endpoint /convert
async function convert(){
  hide(errorEl);
  const amount = parseFloat(amountEl.value);
  const from = fromEl.value;
  const to = toEl.value;
  if(isNaN(amount) || amount < 0) {
    showError('Informe um valor válido.');
    return;
  }
  if(!from || !to){
    showError('Selecione moedas válidas.');
    return;
  }

  setText(resultEl, '');
  hide(resultEl);
  show(loadingEl);

  try{
    // endpoint: /convert?from=USD&to=BRL&amount=1
    const url = `${API_BASE}/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`;
    const data = await fetchJson(url);
    if(!data || data.success === false) throw new Error('Resposta inválida da API');

    const converted = Number(data.result);
    const rate = data.info && data.info.rate ? Number(data.info.rate) : (converted / amount);

    setText(resultEl, `${formatMoney(amount, from)} → ${formatMoney(converted, to)} (1 ${from} = ${rate.toFixed(6)} ${to})`);
    show(resultEl);

    // salva histórico
    addHistory({ ts: Date.now(), from, to, amount, converted, rate });
  } catch (err){
    console.error(err);
    showError('Não foi possível converter. Verifique sua conexão ou tente novamente.');
  } finally {
    hide(loadingEl);
  }
}

function showError(msg){
  setText(errorEl, msg);
  show(errorEl);
}

// swap from/to
function swap(){
  const a = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = a;
}

// Histórico (localStorage simples)
function getHistory(){
  try{
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}
function setHistory(list){ localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); }
function addHistory(item){
  const list = getHistory();
  list.unshift(item); // mais recente primeiro
  setHistory(list.slice(0, 10)); // mantém só últimos 10
  renderHistory();
}
function renderHistory(){
  const list = getHistory();
  historyList.innerHTML = '';
  if(list.length === 0){
    historyList.innerHTML = '<li class="muted">Nenhuma conversão ainda.</li>';
    return;
  }
  list.forEach(it=>{
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.textContent = `${new Date(it.ts).toLocaleString()} — ${formatMoney(it.amount, it.from)} → ${formatMoney(it.converted, it.to)}`;
    const right = document.createElement('div');
    right.className = 'muted';
    right.textContent = `1 ${it.from} = ${it.rate.toFixed(6)} ${it.to}`;
    li.appendChild(left);
    li.appendChild(right);
    historyList.appendChild(li);
  });
}

// clear history
function clearHistory(){
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

// Init
function init(){
  loadSymbols().then(()=>{
    renderHistory();
  });

  convertBtn.addEventListener('click', convert);
  swapBtn.addEventListener('click', swap);
  clearHistoryBtn.addEventListener('click', clearHistory);

  // submit on Enter in amount field
  amountEl.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') convert();
  });
}

document.addEventListener('DOMContentLoaded', init);
