const BorrowReturnCard = require('../../models/borrow-return-card')
const Reader = require('../../models/reader')
const Book = require('../../models/book')
const mongoose = require('mongoose');
const userAccount = require('../../models/user-account');
const ReaderAccount = require('../../models/reader-account');
const Policy = require("../../models/policy")

//function 
async function findReader(option, string){
    try{
        var query = {}
        switch(option)
        {
            case "id":{
                if(!mongoose.Types.ObjectId.isValid(string))
                    return null
                else
                    query = {_id: string};
                break;
            }
            case "email":{
                query = {email: {'$regex': `^${string}$`, $options:'i'}}
                break;
            }
            default :{
                query ={}
                query[option] = string;
            }
        }
        var reader  =  await Reader.findOne(query).populate("account");
        return reader;
    }catch{
        return null
    }

}


//check reader
 async function checkReader(maDocGia){
    try{
        const reader = await findReader("id", maDocGia);
        const policy = await Policy.findOne({"_id": process.env.IDNoToiDa});

        if(!reader)
            return ({ok: false, message:"Không tìm thấy thông tin độc giả"})
        else if(parseFloat(reader.tien_no) > parseFloat(policy.gia_tri))
            return ({ok: false, message:"Độc giả nợ tiền vượt quá qui định"})
        else
            return ({ok: true, message:"Khả dụng"}) 
    }
    catch(err){
        console.log(err);
        return ({ok: false, message:"Không tìm thấy thông tin độc giả"})
    }
}

//check lich_su_dk
async function checkBorrowHistory(maDocGia, dauSach){

    try{
        const reader = await findReader("id", maDocGia);
        const policy = await Policy.findOne({"_id": process.env.IDSoSachToiDaDuocMuon});
        const account = reader.account;
        const lich_su_dk = account.lich_su_dk;

        if(parseInt(lich_su_dk.length) < parseInt(policy.gia_tri))
            return true;
        else if(lich_su_dk.indexOf(dauSach)!=-1)
            return true      
        else
            return false;
            
    }catch{
        return false;
    }
    
}

//get info of BorrowReturnCard
async function getBRC(dauSach, maDocGia){
    var query = {
        "ma_doc_gia": maDocGia, 
        "dau_sach": dauSach, 
        $or:[{"tinh_trang": 1}, {"tinh_trang": 0}]
    }

    const borrowCard = await BorrowReturnCard.findOne(query)

    if(borrowCard) 
    {   var result = {
            _id: borrowCard._id,
            tinh_trang: borrowCard.tinh_trang,
            ma_doc_gia: borrowCard.ma_doc_gia,
            dau_sach: borrowCard.dau_sach,
            ma_sach: borrowCard.ma_sach
        }
        return result;
    }
    else{
        return null;
    }
        
}

//update BorrowReturnCard: "tinh_trang": 0 --> "tinh_trang": 1
async function updateBRC(id, ngayMuon){
    try{
        var query = {"_id": id, "tinh_trang": 0}
        var update = {"ngay_muon":ngayMuon ,"tinh_trang": 1}

        const result = await BorrowReturnCard.updateOne(query, update)
        
        if(result.ok && result.nModified)
            return ({success: 1, updated: 1, message:`Cập nhật phiếu đăng ký thành phiếu mượn thành công!`})
        else
            return ({success: 0, updated: 0, message:`Cập nhật phiếu đăng ký thành phiếu mượn không thành công!`})

    }
    catch(err){
        console.log(err);
        return ({success: 0, updated: 0, message:`Cập nhật phiếu đăng ký thành phiếu mượn không thành công!`})
    }  
}

//Update "lich_su_dk"
async function updateBorrowHisory(maDocGia, maSach){
    try{
        var reader = await Reader.findById(maDocGia);
        var result = await ReaderAccount.updateOne({"ten_tai_khoan": reader.email},{"$push": { "lich_su_dk": maSach }})
    }catch(err){
        console.log(err);
    }
}



//get _id of "cac_quyen_sach", set "so_luong_kha_dung" = "so_luong_kha_dung" - 1
async function selectBookChild(dauSach){
    var query = {"_id": dauSach, so_luong_kha_dung: {$gt: 0}, "cac_quyen_sach.tinh_trang": true};
    var update = {  
        $inc: { "so_luong_kha_dung": -1},
        $set:{"cac_quyen_sach.$.tinh_trang": false}
    }
    var option = {
        "fields": {"so_luong_kha_dung": 1, "cac_quyen_sach.$": 1},
        new: false, 
        useFindAndModify: false
    }

    try{
        const result = await Book.findOneAndUpdate(query, update, option)
        if(result)
            return result.cac_quyen_sach[0]._id;
        else
            return null
    }catch{
        return null;
    }
}

//Insert new BorrowReturnCard: "tinh_trang": 1 
async function saveBRC(maDocGia, dauSach, ngay_muon){
    try{
        var ma_sach = await selectBookChild(dauSach)
        if(ma_sach == null)
            return ({success: 0, updated: 0, message:`Sách đã được mượn hết!`}) 

        const borrowReturnCard = new BorrowReturnCard({
            ma_doc_gia: maDocGia,
            dau_sach: dauSach,
            ma_sach: ma_sach,
            ngay_muon: ngay_muon,
            tinh_trang: 1
        })

        borrowReturnCard.save();
        await updateBorrowHisory(maDocGia, dauSach)

        return ({ success: 1, updated: 1, message:`Thêm phiếu phiếu mượn thành công!`})
    }
    catch(err){
        console.log(err);
        return ({success: 0, updated: 0, message:`Thêm phiếu phiếu mượn không thành công!`})
    }  
}


//Get data of book by id
 async function findBookById(id){
    try
    {
        var book = await Book.findById(id);
        return book;
    }
    catch{
        return null;
    }   
}


//find book
async function findBook(option, value){
    try
    {
        var query ={};
        var select = "_id anh_bia ten_dau_sach the_loai tac_gia nam_xuat_ban nha_xuat_ban ngay_nhap gia so_luong_kha_dung"
        if(option!=null)
            query[option] = value

        var book = await Book.find(query).select(select);
        return book;
    }
    catch{
        return null;
    }   
}



//Save, update borrow-return-card......
 async function saveBorrowData(maDocGia, dsDauSach, ngayMuon){
    var nSuccess=[];
    var nErrors=[];

    for(var dauSach of dsDauSach){
        try{
            var book = await findBookById(dauSach);
            if(!book){
                nErrors.push({success: 0, updated: 0, message:`${dauSach} là ID không hợp lệ!`});
            }
            else{
                const check = await checkBorrowHistory(maDocGia, dauSach)
                if(!check){
                    nErrors.push({success: 0, updated: 0, message:`${book.ten_dau_sach}: Độc giả mượn quá số lượng quy định!`, dauSach});
                } 
                else{
                    

                    const borrowCard = await getBRC(dauSach, maDocGia);
                    if(!borrowCard){ 
                        //Chưa mượn sách
                        var result = await saveBRC(maDocGia, dauSach, ngayMuon);
                        if(result.success)
                            nSuccess.push({...result, message:`${book.ten_dau_sach}: ${result.message}`, dauSach});
                        else
                            nErrors.push({...result, message:`${book.ten_dau_sach}: ${result.message}`, dauSach});
                    }
                    else if(borrowCard.tinh_trang == 0)
                    {
                        //Đã đăng ký mượn sách nhưng chưa đến lấy
                        var result = await updateBRC(borrowCard._id, ngayMuon);
                        if(result.success)
                            nSuccess.push({...result, message:`${book.ten_dau_sach}: ${result.message}`, dauSach});
                        else
                            nErrors.push({...result, message:`${book.ten_dau_sach}: ${result.message}`, dauSach});
                    }
                    else
                    {
                        //Đã mượn lấy sách nhưng chưa trả
                        nErrors.push({success: 0, updated: 0, message:`${book.ten_dau_sach}: Độc giả đã mượn sách nhưng chưa trả!`, dauSach});
                    }  
                }
            }
                         
        }
        catch(err){
            console.log(err)
            nErrors.push({success: 0, updated: 0, message:`${book.ten_dau_sach}: Mượn sách không thành công!`});
        }
    }

    return {nSuccess, nErrors}
}


//get PhieuMuonTra of reader
async function getBorrowCardOf(maDocGia, tinhTrang){
    const query = {"ma_doc_gia": maDocGia}
    if(tinhTrang != -1)
        query.tinhTrang = tinhTrang;

    const borrowCards = await BorrowReturnCard
        .find(query)
        .populate({ path: "ma_doc_gia", select: "ho_ten email" })
        .populate({ path: "dau_sach", select: "ten_dau_sach" })
        .sort({"tinhTrang": 1})

    return borrowCards;
}

//
async function updateBorrowData(dsMaPhieu, ngayMuon){
    var nSuccess= [];
    var nErrors = [];
   for(var maPhieu of dsMaPhieu)
   {
       try{
            const result = await updateBRC(maPhieu, ngayMuon);
            if(result.success)
                nSuccess.push(maPhieu)
            else
                nErrors.push(maPhieu)
       }
       catch(err){
            nErrors.push(maPhieu)
       }
   }
   return {nSuccess, nErrors}
}

module.exports.findReader = findReader;
module.exports.findBookById = findBookById;
module.exports.checkReader = checkReader;
module.exports.findBook = findBook;
module.exports.saveBorrowData = saveBorrowData;
module.exports.getBorrowCardOf = getBorrowCardOf;
module.exports.updateBorrowData = updateBorrowData;
