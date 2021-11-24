async function checkUpdateProfile(req, res, next){
    let result = checkBody(req.body, false)
    if(result.error)
        return res.json({success: false, message: result.message})
    else
        return next()    
}

function checkBody(body, checkQuantity)
{
    if(body.ho_ten==''
        ||body.email ==''
        ||body.gioi_tinh == ''
        ||body.ngay_sinh ==''
        ||body.dia_chi == ''
    )
        return {error: true, message: 'Vui lòng điển đầy đủ thông tin sách!'}
    else  if(isNaN(Date.parse(body.ngay_sinh)))
        return {error: true, message: 'Vui lòng nhập đúng định dạng ngày!'}
    else if(body.tien_no!=undefined)
        return {error: true, message: 'Độc giả không thể tự thay đổi nợ của mình!'}
    else
        return {error: false, message:''}
        
}


module.exports = {
    checkUpdateProfile
} 