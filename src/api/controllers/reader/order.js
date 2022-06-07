const Account = require("../../models/user-account");
const AccountService = require("../../services/account");
const Order = require("../../models/order");
const BookHead = require("../../models/book-head");
const mongoose = require("mongoose");
const urlHelper = require("../../helpers/url");
const { updateOrderById } = require("../../services/librarian/order");
var paypal = require("paypal-rest-sdk");
const { createPayment } = require("./payment");
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

const GetAllOrder = async (req, res) => {
  try {
    const currentUser = await AccountService.getCurrentUserAccount(req);
    const orders = await Order.find({ khach_hang: currentUser._id }).populate({
      path: "gio_hang.dau_sach",
    });
    res.render("reader/all-order.ejs", {
      orders: orders,
      status: ORDER_STATUS_NAME,
    });
  } catch (error) {
    console.log(error);
  }
};

const GetOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id).populate({
      path: "gio_hang.dau_sach",
    });
    const status = {
      "-1": "Hủy",
      0: "Chờ xác nhận",
      1: "Đã xác nhận",
      2: "Đã vận chuyển",
      3: "Đã nhận hàng",
    };
    order.tinh_trang_don_hang = ORDER_STATUS_NAME[order.tinh_trang]
    res.render("reader/order.ejs", {
      order: order,
      status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const AddBook = async (req, res) => {
  try {
    const currentUser = await AccountService.getCurrentUserAccount(req);
    const bookId = req.body.bookHeadId;
    const book = await BookHead.findById(bookId);
    if (book.so_luong_ban == 0) throw new Error("Số lượng còn lại không đủ");

    const bookIndex = currentUser.gio_hang.findIndex(
      (book) => book.dau_sach == bookId
    );
    if (bookIndex == -1) {
      currentUser.gio_hang.push({ dau_sach: bookId, so_luong: 1 });
      await currentUser.save();
    } else {
      currentUser.gio_hang[bookIndex].so_luong++;
      await currentUser.save();
    }
    const redirectUrl = urlHelper.getEncodedMessageUrl(
      `/book-head/${bookId}/`,
      {
        type: "success",
        message: "Đã thêm sách vào giỏ sách",
      }
    );
    res.redirect(redirectUrl);
  } catch (error) {
    console.log(error);
    const redirectUrl = urlHelper.getEncodedMessageUrl(
      `/book-head/${bookId}/`,
      {
        type: "fail",
        message: error,
      }
    );
  }
};

const AddBookJson = async (req, res) => {
  try {
    const currentUser = await AccountService.getCurrentUserAccount(req);
    const bookId = req.body.bookHeadId;
    const book = await BookHead.findById(bookId);
    if (book.so_luong_ban == 0) throw new Error("So luong con lai khong du");

    const bookIndex = currentUser.gio_hang.findIndex(
      (book) => book.dau_sach == bookId
    );
    if (bookIndex == -1) {
      currentUser.gio_hang.push({ dau_sach: bookId, so_luong: 1 });
      await currentUser.save();
    } else {
      currentUser.gio_hang[bookIndex].so_luong++;
      await currentUser.save();
    }
    res.json({ success: true, new: currentUser });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error: error });
  }
};

const DeleteBook = async (req, res) => {
  try {
    const currentUser = await AccountService.getCurrentUserAccount(req);
    const remove = req.body.remove === "true";
    console.log(remove);
    const bookId = req.body.bookHeadId;
    const bookIndex = currentUser.gio_hang.findIndex(
      (book) => book.dau_sach == bookId
    );
    if (bookIndex != -1) {
      if (currentUser.gio_hang[bookIndex].so_luong == 1 || remove)
        currentUser.gio_hang.splice(bookIndex, 1);
      else currentUser.gio_hang[bookIndex].so_luong--;
    }
    await currentUser.save();
    res.json({ success: true, removed: remove, new: currentUser });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error: error });
  }
};

const GetCart = async (req, res) => {
  try {
    const user = await req.user;
    const currentUserAccount = await Account.findById(user._id).populate({
      path: "gio_hang.dau_sach",
    });
    // console.log(currentUserAccount.gio_hang[0])
    res.render("reader/bookCart.ejs", {
      bookHeads: currentUserAccount.gio_hang,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/404");
  }
};

const checkOut = async (req, res) => {
  try {
    const currentUser = await AccountService.getCurrentUserAccount(req);
    const bookHeads = JSON.parse(req.body.bookHeads);

    const cart = currentUser.gio_hang.filter((item) => {
      return bookHeads.indexOf(item.dau_sach.toString()) != -1;
    });

    const books = await BookHead.find({ _id: { $in: bookHeads } });
    let total = 0;
    const bookRenders = books.map((item) => {
      let book = cart.find((b) => {
        return b.dau_sach == item._id.toString();
      });
      item.so_luong_hang = book.so_luong;
      total += book.so_luong * item.gia;
      return item;
    });

    res.render("reader/checkout.ejs", {
      bookHeads: bookRenders,
      total: total,
    });
  } catch (error) {
    console.log(error);
  }
};

const CreateOrder = async (req, res)=>{
  try {
    const currentUser = await AccountService.getCurrentUserAccount(req);
    const bookIds = [].concat(req.body.books)
    const accountId = currentUser._id
    const district = req.body.district
    const ward = req.body.ward
    const province = req.body.province
    const paymentMethod = req.body.payment

    const account = await Account.findById(accountId).populate('gio_hang.dau_sach')

    if (!account)
      throw new Error(JSON.stringify({ code: 404, message: 'Account does not exist' }))

    let total = 0
    const orderBooks = bookIds.map(bookId => {
      const cartItem = account.gio_hang.find(
        item => item.dau_sach._id.toString() == bookId
      )

      if (!cartItem)
        throw new Error(JSON.stringify({
          code: 400,
          message: 'Book and account are not valid'
        }))
      if (cartItem.dau_sach.so_luong_ban < cartItem.so_luong) throw new Error('Not enough')

      total += cartItem.dau_sach.gia * cartItem.so_luong

      return {
        dau_sach: cartItem.dau_sach._id,
        so_luong: cartItem.so_luong,
        gia: cartItem.dau_sach.gia
      }
    })

    const newOrder = new Order({
      tai_khoan: account._id,
      gio_hang: orderBooks,
      tinh_trang: 0,
      da_thanh_toan: false,
      tong_tien: total,
      dia_chi: {
        xa: ward,
        huyen: district,
        tinh: province
      }
    })

    const asyncUpdateBooks = orderBooks.map(orderItem => {
      return BookHead.updateOne(
        { _id: orderItem.dau_sach },
        { $inc: { so_luong_ban: -orderItem.so_luong } }
      )
    })

    //COD
    if (paymentMethod == 'cod') {
      newOrder.hinh_thuc_thanh_toan = 0
      const savedOrder = await newOrder.save()
      const asyncUpdateCart = Account.updateOne(
        { _id: accountId },
        {
          $pull: {
            gio_hang: {
              dau_sach: { $in: bookIds }
            }
          },
          $push: {
            don_hang: savedOrder._id
          }
        },
      )
      await Promise.all([...asyncUpdateBooks, asyncUpdateCart])
      const redirectUrl = urlHelper.getEncodedMessageUrl(
        `/reader/yourOrder/${savedOrder._id}`,
        {
            type: "success",
            message: "Đặt hàng thành công",
        }
      );
      return res.redirect(redirectUrl)
    } else if (paymentMethod == 'paypal') {
      //Payment by 
      newOrder.hinh_thuc_thanh_toan = 1
      const savedOrder = await newOrder.save()
      const asyncUpdateCart = Account.updateOne(
        { _id: accountId },
        {
          $pull: {
            gio_hang: {
              dau_sach: { $in: bookIds }
            }
          },
          $push: {
            don_hang: savedOrder._id
          }
        },
      )
      await Promise.all([...asyncUpdateBooks, asyncUpdateCart])
      await createPayment(savedOrder._id, res)    
    } else throw new Error(JSON.stringify({ code: 400, message: 'Invalid payment method' }))
  } catch (error) {
    console.log(error)
    const redirectUrl = urlHelper.getEncodedMessageUrl(
      `/reader/yourOrder`,
      {
          type: "error",
          message: "Đặt hàng không thành công",
      }
    );
    return res.redirect(redirectUrl)
  }
}

const updateOrder = async (req, res) => {
  try {
    const id = req.params.id
    let newStatus = parseInt(req.body.newStatus)
    if (newStatus !== 4 && newStatus !== -2) throw new Error('Invalid status')

    await updateOrderById(id, newStatus, (error, order) => {
      if (error) {
        console.log(error)
        const redirectUrl = urlHelper.getEncodedMessageUrl(
          `/reader/yourOrder/${id}`,
          {
              type: "error",
              message: "Cập nhật đơn hàng không thành công",
          }
        );
        return res.redirect(redirectUrl)
      } else {
        const redirectUrl = urlHelper.getEncodedMessageUrl(
          `/reader/yourOrder/${id}`,
          {
              type: "success",
              message: "Cập nhật đơn hàng thành công",
          }
        );
        return res.redirect(redirectUrl)
      }
    })
  } catch (error) {
    console.log(error)
    const errorObj = JSON.parse(error)
    const redirectUrl = urlHelper.getEncodedMessageUrl(
      `/reader/yourOrder/${id}`,
      {
          type: "error",
          message: "Cập nhật đơn hàng không thành công",
      }
    );
    return res.redirect(redirectUrl)
  }
}

// const CreateOrder = async (req, res) => {
//   try {
//     //Create new order
//     const currentUser = await AccountService.getCurrentUserAccount(req);
//     if (!req.body.books) throw new Error("Không có sách");

//     const bookIds = req.body.books ? [].concat(req.body.books) : [];

//     const books = await BookHead
//       .find({
//         _id: { $in: bookIds },
//       })
//       .select("_id so_luong_ban gia")
//       .lean();

//     const errBook = books.find(
//       (book) => book.so_luong_ban > req.body[book._id.toString()]
//     );

//     if (!errBook) throw new Error("Rất tiếc: Có sách đã hết");

//     let total = 0;
//     const orderBooks = books.map((book) => {
//       const quantity = req.body[book._id.toString()];
//       total += quantity * book.gia;
//       return { dau_sach: book._id, so_luong: quantity, gia: book.gia };
//     });

//     const newOrder = new Order({
//       tai_khoan: currentUser._id,
//       gio_hang: orderBooks,
//       tinh_trang: 0,
//       da_thanh_toan: false,
//       hinh_thuc_thanh_toan: req.body.payment == "cod" ? 0 : 1,
//       tong_tien: total,
//       dia_chi: req.body.address,
//     });

//     const asyncUpdateBooks = orderBooks.map((book) => {
//       return BookHead.updateOne(
//         { _id: book.dau_sach },
//         { $inc: { so_luong_ban: -book.so_luong } }
//       );
//     });

//     currentUser.gio_hang = currentUser.gio_hang.filter(
//       (item) => bookIds.indexOf(item.dau_sach.toString()) == -1
//     );

//     const updatedBooks = await Promise.all(asyncUpdateBooks);
//     const savedOrder = await newOrder.save();
//     currentUser.don_hang.push(savedOrder._id);
//     const updatedUser = await currentUser.save();

//     //COD
//     if (req.body.payment == "cod") {
//       const redirectUrl = urlHelper.getEncodedMessageUrl(
//         `/reader/yourorder/${savedOrder._id}/`,
//         {
//           type: "success",
//           message: "Đặt hàng thành công",
//         }
//       );
//       res.redirect(redirectUrl);
//     } else {
//       //Paypal
//       await createPayment(savedOrder._id, res);
//     }
//   } catch (error) {
//     console.log(error);
//     const redirectUrl = urlHelper.getEncodedMessageUrl(`/`, {
//       type: "success",
//       message: "Đặt hàng không thành công thành công",
//     });
//     res.redirect(redirectUrl);
//   }
// };

const Cancel = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    const updatedOrder = await Order.findOneAndUpdate(id, -1);
    const udatedBooks = await restoreBooks(updatedOrder.gio_hang);
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error: error });
  }
};

const restoreBooks = async (books) => {
  const asyncUpdateBooks = books.map((book) => {
    return BookHead.findByIdAndUpdate(book.dau_sach, {
      $inc: { so_luong_ban: book.so_luong },
    });
  });
  return await Promise.all(asyncUpdateBooks);
};

// const createPayment = async (orderId, res) => {
//   try {
//     const order = await Order.findById(orderId).populate({
//       path: "gio_hang.dau_sach",
//       select: "ten_dau_sach gia",
//     });

//     if (!order) throw new Error("Error");

//     var total = 0;
//     var items = order.gio_hang.map((item) => {
//       return {
//         name: item.dau_sach.ten_dau_sach,
//         sku: "item",
//         price: item.dau_sach.gia,
//         currency: "USD",
//         quantity: item.so_luong,
//       };
//     });

//     var create_payment_json = {
//       intent: "sale",
//       payer: {
//         payment_method: "paypal",
//       },
//       redirect_urls: {
//         return_url: `http://localhost:3000/reader/order/payment/${orderId}/success`,
//         cancel_url: `http://localhost:3000/reader/order/payment/${orderId}/cancel`,
//       },
//       transactions: [
//         {
//           item_list: {
//             items: items,
//           },
//           amount: {
//             currency: "USD",
//             total: order.tong_tien,
//           },
//           description: "Hoa hon mua sach",
//         },
//       ],
//     };

//     paypal.payment.create(create_payment_json, async function (error, payment) {
//       if (error) {
//         await updateOrderById(orderId, -1);
//         throw error;
//       } else {
//         payment.links.forEach((link) => {
//           if (link.rel == "approval_url") res.redirect(link.href);
//         });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     res.redirect("/");
//   }
// };

const successOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const order = await Order.findById(orderId);
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: order.tong_tien,
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
        await Promise.all([await order.save, updateOrderById(order._id, -1)]);
        res.redirect(`/reader/yourOrder/${orderId}`);
      } else {
        order.da_thanh_toan = true;
        await order.save();
        res.redirect(`/reader/yourOrder/${orderId}`);
      }
    }
  );
};

module.exports = {
  AddBook,
  AddBookJson,
  DeleteBook,
  GetCart,
  CreateOrder,
  checkOut,
  GetAllOrder,
  Cancel,
  GetOrder,
  successOrder,
  updateOrder
};
