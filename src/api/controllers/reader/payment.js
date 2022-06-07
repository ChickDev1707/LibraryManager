const Order = require("../../models/order");
const mongoose = require("mongoose");
const urlHelper = require("../../helpers/url");
var paypal = require("paypal-rest-sdk");
const { updateOrderById } = require("../../services/librarian/order");
const { convertCurrency } = require("../../services/librarian/payment");

const createPayment = async (orderId, res) => {
  try {
    let rate = await convertCurrency();
    rate *= 100;
    const order = await Order.findById(orderId)
      .populate({
        path: "gio_hang.dau_sach",
        select: "ten_dau_sach",
      })
      .populate({ path: "tai_khoan", select: "ten_tai_khoan" })
      .lean();

    if (!order) throw new Error("Order does not exist");

    let subTotal = 0;
    var items = order.gio_hang.map((item) => {
      subTotal += (Math.round(item.gia * rate) / 100) * item.so_luong;
      return {
        name: item.dau_sach.ten_dau_sach,
        sku: "item",
        price: Math.round(item.gia * rate) / 100,
        currency: "USD",
        quantity: item.so_luong,
      };
    });
    let a = await Order.findOneAndUpdate(
      { _id: orderId },
      { "paypal.tong_tien": subTotal }
    );
    console.log(a);
    var address = order.dia_chi;
    var name = order.tai_khoan.ten_tai_khoan;

    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `http://localhost:3000/reader/order/payment/${orderId}/success`,
        cancel_url: `http://localhost:3000/reader/order/payment/${orderId}/cancel`,
      },
      transactions: [
        {
          item_list: {
            shipping_address: {
              recipient_name: name,
              line1: address.xa,
              city: address.huyen,
              state: address.tinh,
              country_code: "VN",
            },
            items: items,
          },
          amount: {
            currency: "USD",
            total: subTotal,
          },
          description: "Hóa đơn mua sách",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async function (error, payment) {
      if (error) {
        await updateOrderById(orderId, -1);
        throw error;
      } else {
        payment.links.forEach((link) => {
          console.log(link.href);
          if (link.rel == "approval_url") res.redirect(link.href);
        });
      }
    });
  } catch (error) {
    console.log(error);
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/`, {
      type: "fail",
      message: "Đặt hàng không thành công",
    });
    res.redirect(redirectUrl);
  }
};

const successOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order does not exist!");

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: order.paypal.tong_tien,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async function (error, payment) {
      if (error) {
        order.da_thanh_toan = false;
        await Promise.all([order.save, updateOrderById(order._id, -1)]);
        const redirectUrl = urlHelper.getEncodedMessageUrl(`/`, {
          type: "fail",
          message: "Đặt hàng không thành công",
        });
        res.redirect(redirectUrl);
      } else {
        const id = payment.id;
        const refundId = payment.transactions[0].related_resources[0].sale.id;
        const paypalInfo = {
          ...order.paypal,
          _id: id,
          hoan_tien: refundId,
        };
        order.da_thanh_toan = true;
        order.paypal = paypalInfo;
        await order.save();
        const redirectUrl = urlHelper.getEncodedMessageUrl(
          `/reader/yourOrder/${order._id}`,
          {
            type: "success",
            message: "Đặt hàng thành công",
          }
        );
        res.redirect(redirectUrl);
      }
    }
  );
};

module.exports = {
  createPayment,
  successOrder,
};
