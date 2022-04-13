const mongoose = require("mongoose");
const BookHead = require("../../models/book-head");
const Order = require("../../models/order");
const userAccount = require("../../models/user-account");
const { refundPayment } = require("./payment");
const ORDER_STATUS_NAME = {
  '-3': "Không thành công",
  '-2': 'Đã hủy',
  '-1': 'Bị từ chối',
  0: 'Chờ xác nhận',
  1: 'Đã xác nhận',
  2: 'Đã vận chuyển',
  3: 'Giao hàng thành công',
  4: 'Đã nhận hàng'
}

const updateOrderById = async (id, status, callback = null) => {
  try {
    if (!mongoose.isValidObjectId(id))
      throw new Error(JSON.stringify({ code: 400, message: 'invalid order id' }))

    const currentOrder = await Order.findById(id)

    if (!currentOrder)
      throw new Error(JSON.stringify({ code: 404, message: 'Order does not exist' }))

    if (checkValidNewStatus(currentOrder.tinh_trang, status)) {
      if (
        (status == -1 || status == -2 || status == -3) &&
        currentOrder.hinh_thuc_thanh_toan === 1 &&
        currentOrder.da_thanh_toan
      ) {
        refundPayment(currentOrder.paypal.refund, async (error, response) => {
          if (error) {
            const jsonError = JSON.stringify(error);
            callback(jsonError, null)
          } else {
            const updatedOrder = await Order.findOneAndUpdate(
              {_id: id},
              { tinh_trang: status, da_hoan_tien: true },
              { new: true }
            )
            await restoreBooks(currentOrder.gio_hang)
            callback(null, updatedOrder)
          }
        })
      } else {
        const updatedOrder = await Order.findOneAndUpdate(
          {_id: id},
          { tinh_trang: status },
          { new: true }
        )
        if (status == -1 || status == -2 || status == -3)
          await restoreBooks(currentOrder.gio_hang)
        updatedOrder.tinh_trang_don_hang = ORDER_STATUS_NAME[updatedOrder.tinh_trang]
        callback(null, updatedOrder) 
      }
    }
  } catch (error) {
    console.log(error)
    if (callback) {
      callback(error, null)
    }
  }
}

const checkValidNewStatus = (currentStatus, newStatus) => {
  if (newStatus < -3 || newStatus > 4 || parseInt(newStatus) != newStatus)
    throw new Error(JSON.stringify({ code: 400, message: 'invalid status' }))
  else if (newStatus == currentStatus) throw new Error('Invalid new status')
  else if (newStatus > 0 && newStatus != currentStatus + 1)
    throw new Error(
      JSON.stringify({ code: 400, message: 'Invalid new status' })
    )
  else if (currentStatus < 0 || currentStatus == 4)
    throw new Error(
      JSON.stringify({ code: 400, message: 'Can not change order status' })
    )
  else if (currentStatus < 0)
    throw new Error(
      JSON.stringify({ code: 400, message: 'Can not change order status' })
    )
  else if (currentStatus > 0 && newStatus < 0 && newStatus != -3)
    throw new Error(
      JSON.stringify({ code: 400, message: 'Invalid new status' })
    )
  else return true
}

const restoreBooks = async books => {
  const asyncUpdateBooks = books.map(bookItem => {
    return BookHead.findByIdAndUpdate(bookItem.dau_sach, {
      $inc: { so_luong_ban: bookItem.so_luong }
    })
  })
  return await Promise.all(asyncUpdateBooks)
}

const addMessage = async (order) => {
  try {
    let accountId = order.tai_khoan;
    let orderId = order._id;
    let newStatus = order.tinh_trang;
    const account = await userAccount.findById(accountId);
    switch (newStatus) {
      case 1: {
        account.thong_bao.push({
          tieu_de: "Xác nhận đơn hàng",
          noi_dung: `Đơn hàng ${orderId} đã được xác nhận`,
        });
        break;
      }
      case 2: {
        account.thong_bao.push({
          tieu_de: "Đơn hàng đã dược vận chuyển",
          noi_dung: `Đơn hàng ${orderId} đã được giao cho đơn vị vận chuyển`,
        });
        break;
      }
      case 3: {
        account.thong_bao.push({
          tieu_de: "Đơn hàng đã giao thành công",
          noi_dung: `Đơn hàng ${orderId} đã được giao thành công`,
        });
        break;
      }
      case -1: {
        account.thong_bao.push({
          tieu_de: "Đơn hàng bị từ chối",
          noi_dung: `Đơn hàng ${orderId} của bạn dã bị từ chối đã được xác nhận`,
        });
        break;
      }
    }
    account.thong_bao_moi = true;
    return await account.save();
  } catch (error) {
    console.log(error);
  }
};


module.exports = {
  updateOrderById,
  restoreBooks,
  addMessage
};