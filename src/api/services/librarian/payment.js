var paypal = require("paypal-rest-sdk");
const CC = require("currency-converter-lt");

const refundPayment = (id, callback) => {
  paypal.sale.refund(id, {}, (error, response) => {
    callback(error, response);
  });
};

const convertCurrency = async () => {
  try {
    let currencyConverter = new CC({ from: "USD", to: "VND" });
    const result = await currencyConverter.rates();
    return 1 / result;
  } catch (error) {
    console.log(error);
    return 1 / 23182;
  }
};

module.exports = { refundPayment, convertCurrency };
