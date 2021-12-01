const { getCurrentUserAccount } = require("../../services/account");
const { getProfileByAccountId, updateUserProfile, updatePassword, updateAvatar } = require("../../services/reader/account");
//Get user profile
async function getUserProfile(req, res, next){
    try{
        var currentUsert = await getCurrentUserAccount(req);
        if(!currentUsert)
           return res.redirect('/')
        var userProfile  = await getProfileByAccountId(currentUsert._id);
        res.render("reader/account", {reader:userProfile})
    }catch(err){
        console.log(err);
        res.redirect('/')
    }
    
}
//Update user profile
async function updateUser(req, res, next){
    var currentUsert = await getCurrentUserAccount(req);
    if(!currentUsert)
        return res.json({success: false, anh_bia: null, message: "Không tìm thấy thông tin tài khoản"})
    if(req.body.anh_bia){
        const result = await updateAvatar(currentUsert._id, req.body.anh_bia)
        return res.json(result);
    }
    else if(req.body.ho_ten){
        const newData = {
            ho_ten: req.body.ho_ten,
            gioi_tinh: req.body.gioi_tinh,
            ngay_sinh: req.body.ngay_sinh,
            email: req.body.email,
            dia_chi: req.body.dia_chi,
        };
        const result = await updateUserProfile(currentUsert._id, newData);
        return res.json(result);
    }else{
        var currentPass = req.body.currentPass;
        var newPass = req.body.newPass;
        console.log(currentPass)
        if(newPass==undefined || currentPass == undefined || newPass == "" || currentPass == "")
            return res.json({success: false, anh_bia: null, message: "Vui lòng nhập mật khẩu!"})

        var result = await updatePassword(currentUsert._id, currentPass, newPass);
        return res.json(result);
    }
    
}



module.exports= {
    getUserProfile,
    updateUser,
    updateAvatar
}