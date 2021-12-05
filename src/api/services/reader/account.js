const {countBorrowRegister} = require('../librarian/borrow')

const Reader = require("../../models/reader");
const UserAccount = require("../../models/user-account");
const { getReaderPolicies } = require('../librarian/policy');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']


async function getProfileByAccountId(id){
    try{
        const account = await UserAccount.findById(id);
        if(account == null)
            return null;
        
        var reader = await Reader.findOne({id_account: account._id});
        var count = await countBorrowRegister(reader._id);
        return {...reader._doc, anh_bia:reader.anh_bia, borrow: count.borrow, register: count.register};

    }catch(err){
        console.log(err);
        return null;
    }
    
}

async function updateUserProfile(id, newData){
    try{;
        const account = await UserAccount.findById(id);
        const oldProfile = await Reader.findOne({id_account: account._id});
        if(oldProfile==null)
            return ({success: false, message: "Không tìm thấy thông tin độc giả!"});
        else { 
            const policy = await getReaderPolicies();
            if(newData.ngay_sinh!= undefined && (getAge(newData.ngay_sinh) - policy.minAge < 0 || getAge(newData.ngay_sinh) - policy.maxAge > 0 ))
                return {success: false, message: "Tuổi của độc giả không hợp lệ"};          
            const updated = await Reader.updateOne({_id: oldProfile._id}, newData);
            return {success: true, message: "Cập nhật thông tin độc giả thành công"};
        }
        
    }catch(err){
        console.log(err)
        return {success: false, message: "Cập nhật thông tin độc giả không thành công"}
    }
}

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

async function updatePassword(id, currentPass, newPass){
    try{
        var account = await UserAccount.findById(id);
        if(account==null)
            return {success: false, message: "Không tìm thấy độc giả!"};
        else{
            if(account.mat_khau!=currentPass)
                return {success: false, message: "Sai mật khẩu!"}
            else
            {
                var result = await UserAccount.updateOne({_id: id}, {mat_khau: newPass});
                return {success: true, message: "Cập nhật mật khẩu thành công!"}
            }
        }
    }catch(err){
        console.log(err);
        return {success: false, message: "Cập nhật mật khẩu không thành công!"}
    }
    
}

async function updateAvatar(id, ava){
    var userProfile  = await getProfileByAccountId(id);
    saveAvatar(userProfile, ava);
    var result = await Reader.findByIdAndUpdate(userProfile._id, userProfile, {new: true} )
    if(result)
        return ({success: true, anh_bia: result.anh_bia, message: "Cập nhật thành công"});
    else
        return ({success: false, anh_bia: null, message: "Cập nhật không thành công"})
}

function saveAvatar(reader, avatarEncoded){
    if (avatarEncoded == null) 
        return
    const avatar = JSON.parse(avatarEncoded)
    if (avatar != null && imageMimeTypes.includes(avatar.type)) {
        reader.bf_anh_bia = new Buffer.from(avatar.data, 'base64')
        reader.kieu_anh_bia = avatar.type
    }
}

module.exports.updateUserProfile = updateUserProfile;
module.exports.getProfileByAccountId = getProfileByAccountId;
module.exports.updatePassword = updatePassword;
module.exports.updateAvatar = updateAvatar;