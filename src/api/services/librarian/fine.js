const mongoose = require("mongoose");
const Fine = require("../../models/fine");
const Reader = require("../../models/reader");

async function getAllFineInfo(){
    const readers = await Reader
        .find()
        .select("_id email ho_ten ngay_sinh tien_no")
        .exec();
    return readers;
}

async function saveFineData(maDocGia, soTienThu, ngayThu){
    try{
        var reader = await Reader.findById(maDocGia);
        if(reader!=null){
            var tienNoMoi = reader.tien_no - soTienThu;

            if(tienNoMoi < 0)
                return ({success: false, message: "Số tiền thanh toán không thể vượt quá số tiền nợ!", noMoi: reader.tien_no})

            const fineCard = new Fine({
                ma_doc_gia: maDocGia,
                so_tien_thu: soTienThu,
                ngay_thu: ngayThu,
                con_lai: tienNoMoi
            });
            fineCard.save();

            const updateResult = await Reader.updateOne({"_id": reader._id}, {"tien_no": tienNoMoi}, {useFindAndModify: false}).exec();
            console.log(updateResult)
            if(updateResult.ok && updateResult.n)
                return ({success: true, message: "Thanh toán thành công!", noMoi: tienNoMoi});
            else
                return ({success: false, message: "Thanh toán không thành công", noMoi: reader.tien_no});
                
        }
        return ({success: false, message: "Thông tin độc giả không đúng!", noMoi: null});
    }
    catch(err){
        console.log(err);
        return ({success: false, message: "Thanh toán không thành công", noMoi: null})
    }

}

module.exports.getAllFineInfo = getAllFineInfo;
module.exports.saveFineData = saveFineData;