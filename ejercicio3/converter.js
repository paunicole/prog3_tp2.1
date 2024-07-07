class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {

    apiUrl;
    currencies;

    constructor() {
        this.apiUrl = "api.frankfurter.app";
        this.currencies = [];
        this.currenciesName = [];
    }

    async getCurrencies(apiUrl) {
        try {
            const response = await fetch(`https://${this.apiUrl}/currencies`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            Object.keys(data).map((key) => {
                this.currencies.push(new Currency(key, data[key]));
              });

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    async getCurrenciesName(){
        try {
            const response = await fetch(`https://cdn.dinero.today/api/currency.json`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            this.currenciesName = data;

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency.code === toCurrency.code) {
            return amount;
        }
        try {
            const response = await fetch(
              `https://${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
      
            if (!data.rates || !data.rates[toCurrency.code]) {
                throw new Error('Invalid currency conversion data received');
            }

            return data.rates[toCurrency.code];
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            return null;
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
