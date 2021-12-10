async function checkUpdateProfile(req, res, next) {
    if (req.body.anh_bia)
        return next();
    else if (req.body.currentPass) {
        let result = checkPassword(req.body)
        if (result.error)
            return res.json({ success: false, message: result.message })
        else
            return next()
    }
    else {
        let result = checkBody(req.body)
        if (result.error)
            return res.json({ success: false, message: result.message })
        else
            return next()
    }

}

function checkBody(body) {
    if (body.ho_ten == ''
        || body.email == ''
        || body.gioi_tinh == ''
        || body.ngay_sinh == ''
        || body.dia_chi == ''
    )
        return { error: true, message: 'Vui lòng điển đầy đủ thông tin cá nhân!' }
    else if (isNaN(Date.parse(body.ngay_sinh)))
        return { error: true, message: 'Vui lòng nhập đúng định dạng ngày!' }
    else if (!checkDate(body.ngay_sinh))
        return { error: true, message: 'Ngày sinh không được vượt quá thời gian hiện tại!' }
    else if (body.tien_no != undefined)
        return { error: true, message: 'Độc giả không thể tự thay đổi nợ của mình!' }
    else
        return { error: false, message: '' }

}

function checkPassword(body) {
    if (body.currentPass == "")
        return { error: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
    else if (body.newPass == "")
        return { error: true, message: 'Mật khẩu không được bỏ trống!' }
    else if (body.newPass.indexOf(' ') >= 0)
        return { error: true, message: 'Mật khẩu không được có khoảng trắng!' }
    else
        return { error: false, message: '' }
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


module.exports = {
    checkUpdateProfile
}