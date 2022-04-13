const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    tai_khoan: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "UseAccount",
    },
    gio_hang: [
      {
        dau_sach: {
          type: mongoose.Types.ObjectId,
          ref: "BookHead",
        },
        so_luong: {
          type: Number,
        },
        gia: {
          type: Number
        }
      },
    ],
    tinh_trang: {
      type: Number, //-3 khong thanh cong, -2 huy, -1 tu choi, 0 cho xac nhan, 1 xac nhan, 2 van chuyen, 3 giao thanh cong, 4 da nhan hang
      required: true,
    },
    hinh_thuc_thanh_toan: {
      type: Number,
      required: true,
    },
    paypal: {
      _id: {
        type: String,
        default: ''
      },
      refund: {
        type: String,
        default: ''
      }
    },
    da_thanh_toan: {
      type: Boolean,
      required: true,
    },
    da_hoan_tien: {
      type: Boolean,
      default: false
    },
    tong_tien: {
      type: Number,
      required: true,
    },
    dia_chi: {
      xa: {
        type: String, 
        default: ''
      },
      huyen: {
        type: String, 
        default: ''
      },
      tinh: {
        type: String, 
        default: ''
      }
    },
    so_dien_thoai: {
      type: String,
      default: ''
    },
    chu_thich: {
      type: String, 
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema, "PhieuMua");
