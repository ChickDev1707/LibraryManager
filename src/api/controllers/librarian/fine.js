const mongoose = require("mongoose");
const Fine = require("../../models/fine");
const Reader = require("../../models/reader");
const { getAllFineInfo, saveFineData } = require("../../services/librarian/fine");

async function getAllFine(req, res, next){
    const fineData = await getAllFineInfo();
    res.render("librarian/fine/fine", {fineData})
}

async function saveFine(req, res, next){
    const maDocGia = req.body.maDocGia;
    const tienThu = req.body.thanhToan;
    const ngayThu = req.body.ngayThu;
    const result = await saveFineData(maDocGia, tienThu, ngayThu)
    console.log(result)
    res.json(result)
}
module.exports = {
    getAllFine,
    saveFine
}