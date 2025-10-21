const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convert");
const resultDiv = document.getElementById("result");

const API_URL = "https://api.exchangerate-api.com/v4/latest/";

const DEFAULT_SYMBOLS = ["USD", "EUR", "BRL", "GBP", "JPY", "CAD", "AUD"];

// popula as opções de moedas
function loadCurrencies() {
  DEFAULT_SYMBOLS.forEach(symbol => {
    const option1 = document.createElement("option");
    option1.value = symbol;
    option1.textContent = symbol;

    const option2 = document.createElement("option");
    option2.value = symbol;
    option2.textContent = symbol;

    fromSelect.appendChild(option1);
    toSelect.appendChild(option2);
  });

  fromSelect.value = "USD";
  toSelect.value = "BRL";
}

async function convertCurrency() {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = parseFloat(amountInput.value);

  if (!from || !to || isNaN(amount)) {
    resultDiv.textContent = "⚠️ Selecione moedas válidas e insira um valor.";
    return;
  }

  try {
    const res = await fetch(`${API_URL}${from}`);
    const data = await res.json();

    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);

    resultDiv.textContent = `${amount} ${from} = ${converted} ${to}`;
  } catch (error) {
    console.error(error);
    resultDiv.textContent = "❌ Erro ao converter. Verifique a conexão.";
  }
}

loadCurrencies();
convertBtn.addEventListener("click", convertCurrency);
