
const Order = require("../../models/order");
const mongoose = require("mongoose");
const { updateOrderById } = require("../../services/librarian/order");
const ORDER_STATUS_NAME = {
  '-3': "Không thành công",
  '-2': 'Hủy',
  '-1': 'Từ chối',
  0: 'Chờ xác nhận',
  1: 'Đã xác nhận',
  2: 'Đã vận chuyển',
  3: 'Giao hàng thành công',
  4: 'Đã nhận hàng'
}

const getOrders = async (req, res) => {
  try {
    console.log(req.query.status);
    const statusQuery = req.query.status ? req.query.status : 0;
    const all = await Order.find({ tinh_trang: statusQuery })
      .populate({ path: "tai_khoan", select: "ten_tai_khoan" })
      .populate({ path: "gio_hang.dau_sach", select: "ten_dau_sach" })
      .lean();

    res.render("librarian/order/view-confirm-order", {
      orders: all,
      status: ORDER_STATUS_NAME,
      statusQuery,
    });
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    let currentStatus = parseInt(req.body.current);
    let newStatus = parseInt(req.body.new);
    if (newStatus != -1) newStatus = currentStatus + 1;
    else if (currentStatus == 0) newStatus = -1;
    else if (currentStatus > 0 && currentStatus < 3) newStatus = -3
    console.log("newStatus", newStatus)

    await updateOrderById(id, newStatus, (error, order) => {
      if (error) {
        console.log(error)
        return res.json({success: false, newOrder: order})
      } else {
        return res.json({success: true, newOrder: order})
      }
    })
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

module.exports = {
  getOrders,
  updateOrder,
};
