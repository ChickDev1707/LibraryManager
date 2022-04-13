var paypal = require("paypal-rest-sdk");

const refundPayment = (id, callback) => {
  paypal.sale.refund(id, {}, (error, response) => {
    callback(error, response)
  })
}

module.exports= {refundPayment}