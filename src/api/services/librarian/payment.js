var paypal = require("paypal-rest-sdk");
const fetch = require("node-fetch");

const refundPayment = (id, callback) => {
  paypal.sale.refund(id, {}, (error, response) => {
    callback(error, response);
  });
};

const convertCurrency = async () => {
  const response = await fetch(
    "https://free.currconv.com/api/v7/convert?q=VND_USD&compact=ultra&apiKey=6426789aa17a2b67eedb"
  );
  const data = await response.json();
  return data.VND_USD;
};

module.exports = { refundPayment, convertCurrency };
