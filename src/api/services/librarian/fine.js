const mongoose = require("mongoose");
const Fine = require("../../models/fine");
const Reader = require("../../models/reader");

async function getAllFineInfo() {
    const readers = await Reader
        .find()
        .select("_id email ho_ten ngay_sinh tien_no")
        .exec();
    return readers;
}

async function saveFineData(maDocGia, soTienThu, ngayThu) {
    try {
        var reader = await Reader.findById(maDocGia);
        if (reader != null) {
            var tienNoMoi = parseInt(reader.tien_no) - parseInt(soTienThu);

            if (tienNoMoi < 0)
                return ({ success: false, message: "Số tiền thanh toán không thể vượt quá số tiền nợ!", noMoi: reader.tien_no })
            else if (parseInt(soTienThu) <= 0)
                return ({ success: false, message: "Số tiền thanh toán phải lớn hơn 0!", noMoi: reader.tien_no })
            else if (!checkDate(ngayThu))
                return ({ success: false, message: "Ngày thanh toán nợ không được vượt quá thời gian hiện tại!", noMoi: reader.tien_no })

            const fineCard = new Fine({
                ma_doc_gia: maDocGia,
                so_tien_thu: soTienThu,
                ngay_thu: ngayThu,
                con_lai: tienNoMoi
            });
            fineCard.save();

            const updateResult = await Reader.updateOne({ "_id": reader._id }, { "tien_no": tienNoMoi }, { useFindAndModify: false }).exec();
            return ({ success: true, message: "Thanh toán thành công!", noMoi: tienNoMoi });
        }
        return ({ success: false, message: "Thông tin độc giả không đúng!", noMoi: null });
    }
    catch (err) {
        console.log(err);
        return ({ success: false, message: "Thanh toán không thành công", noMoi: null })
    }

}

function checkDate(dateString) {
    var q = new Date();
    var m = q.getMonth();
    var d = q.getDate();
    var y = q.getFullYear();

    var toDate = new Date(y, m, d)
    var date = new Date(dateString + " GMT+0700");

    return date <= toDate;
}

module.exports.getAllFineInfo = getAllFineInfo;
module.exports.saveFineData = saveFineData;