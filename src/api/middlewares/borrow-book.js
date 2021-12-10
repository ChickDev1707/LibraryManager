function checkDate(dateString) {
    var q = new Date();
    var m = q.getMonth();
    var d = q.getDate();
    var y = q.getFullYear();

    var toDate = new Date(y, m, d)
    var date = new Date(dateString + " GMT+0700");

    return date <= toDate;
}

async function checkNewBorrow(req, res, next) {
    const ma_doc_gia = req.body.ma_doc_gia;
    const ngay_muon = req.body.ngay_muon;
    const dsDauSach = req.body.dau_sach;
    const dsMaSach = req.body.ma_sach;

    if (!ma_doc_gia) {
        return res.json({ error: true, message: "Vui lòng nhập thông tin độc giả" })
    }
    else if (!ngay_muon && !checkDate(ngay_muon)) {
        return res.json({ error: true, message: "Ngày mượn không được vượt quá thời gian hiện tại!" })
    }
    else if (!dsDauSach || !dsMaSach) {
        return res.json({ error: true, message: "Vui lòng chọn sách!" })
    }
    else {
        return next()
    }
}

module.exports.checkNewBorrow = checkNewBorrow;