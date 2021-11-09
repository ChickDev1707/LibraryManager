async function checkNewBook(req, res, next){
    
    if(!req.file)
    {
        return res.json({success: false, message: "Vui lòng chọn ảnh bìa cho sách!"})
    }
    else
    {
        let result = checkBody(req.body)
        if(result.error)
            return res.json({success: false, message: result.message})
        else
        return next()       
    } 
        
}

async function checkUpdateBook(req, res, next){
    let result = checkBody(req.body)
    if(result.error)
        return res.json({success: false, message: result.message})
    else
        return next()    
}

function checkBody(body)
{
    if(body.ten_dau_sach==''
        ||body.the_loai ==''
        ||body.tac_gia == ''
        ||body.nam_xuat_ban ==''
        ||body.nha_xuat_ban == ''
        ||body.ngay_nhap == ''
        ||body.gia == ''
        ||body.so_luong == ''
        ||body.tom_tat == ''
    )
        return {error: true, message: 'Vui lòng điển đầy đủ thông tin sách'}
    else {
        if(isNaN(Date.parse(body.ngay_nhap)))
            return {error: true, message: 'Vui lòng nhập đúng định dạng ngày'}

        if(isNaN(body.nam_xuat_ban) || !Number.isInteger(parseFloat(body.nam_xuat_ban)) || parseFloat(body.nam_xuat_ban) < 0 )
            return {error: true, message: 'Vui lòng nhập đúng năm xuất bản'}

        if(isNaN(body.gia) || parseFloat(body.gia) < 0)
            return {error: true, message: 'Vui lòng nhập đúng giá'}
        
        if(isNaN(body.so_luong) || !Number.isInteger(parseFloat(body.so_luong)) || parseFloat(body.so_luong) < 0 )
            return {error: true, message: 'Vui lòng nhập đúng số lượng'}

        if(parseInt(body.nam_xuat_ban) > parseInt(new Date(Date.parse(body.ngay_nhap)).getFullYear()))
            return {error: true, message: 'Vui lòng kiểm tra năm xuất bản và ngày nhập'}

        return {error: false, message: ''}
    }
        

}

module.exports = {
    checkNewBook,
    checkUpdateBook
} 