const BorrowReturnCard = require('../../models/borrow-return-card')
const Reader = require('../../models/reader')
const BookHead = require('../../models/book-head')
const mongoose = require('mongoose');
const UserAccount = require('../../models/user-account');
const Policy = require("../../models/policy");
const { getBorrowBookPolicies, getFinePolicies } = require('./policy');
const RegisterBorrowCard = require('../../models/register-borrow-card.js')

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
        var reader  =  await Reader.findOne(query);
        var account = await UserAccount.findById(reader.id_account);      
        reader.account = account;
        return reader;
    }catch{
        return null
    }

}


//check reader
 async function checkReader(maDocGia){
    try{
        const reader = await findReader("id", maDocGia);
        const policy = await getFinePolicies();

        if(!reader)
            return ({ok: false, message:"Không tìm thấy thông tin độc giả"})
        else if(parseFloat(reader.tien_no) > parseFloat(policy.maxAllowedDebt))
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
        const policy = await getBorrowBookPolicies();
        const account = reader.account;
        if(!reader.account)
            return {ok: false, message: "Không tìm thấy thông tin tài khoản của độc giả!"}
        const lich_su_dk = reader.account.lich_su_dk;  
        if(parseInt(lich_su_dk.length) < parseInt(policy.maxAllowedBorrowBook))
            return {ok: true, message: "Khả dụng!"};
        else if(lich_su_dk.indexOf(dauSach)!=-1)
            return {ok: true, message: "Khả dụng!"};      
        else
            return {ok: false, message: "Độc giả mượn quá số lượng quy định!"};
            
    }catch(err){
        console.log(err);
        return {ok: false, message: "Lỗi kiểm tra thông tin tài khoản!"};;
    }
}

//get info of BorrowReturnCard
async function getBRC(dauSach, maDocGia){
    var query = {
        "doc_gia": maDocGia, 
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

//Update quyenSach 
async function updateQuyenSach(dauSach, maSach, tinhTrang){
    var query = {"_id": dauSach, "cac_quyen_sach._id": maSach}
    var update = {
        $inc: { "so_luong_kha_dung": tinhTrang?1:-1},
        "cac_quyen_sach.$.tinh_trang": tinhTrang
    }
    var result = await BookHead.updateOne(query, update);
    return (result)
}

//update BorrowReturnCard: "tinh_trang": 0 --> "tinh_trang": 1
async function updateBRC(id, dauSach, maSach, ngayMuon){
    try{
        var query = {"_id": id,"dau_sach": dauSach ,"tinh_trang": 0}
        var update = {"ngay_muon":ngayMuon ,"tinh_trang": 1, "ma_sach": maSach}
        var option = {useFindAndModify: false, new: false}

        const result = await BorrowReturnCard.findOneAndUpdate(query, update, option)
        
        if(result!=null){
            if(result.ma_sach != maSach){
                await updateQuyenSach(dauSach, result.ma_sach, true);
                await updateQuyenSach(dauSach, maSach, false);
               
            }
            return ({success: 1, updated: 1, message:`Cập nhật phiếu đăng ký thành phiếu mượn thành công!`})
        }    
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
        var result = await UserAccount.updateOne({"ten_tai_khoan": reader.email},{"$push": { "lich_su_dk": maSach }})
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
        const result = await BookHead.findOneAndUpdate(query, update, option)
        if(result)
            return result.cac_quyen_sach[0]._id;
        else
            return null
    }catch{
        return null;
    }
}

//Insert new BorrowReturnCard: "tinh_trang": 1 
async function saveBRC(maDocGia, dauSach, maSach, ngay_muon){
    try{
        // var ma_sach = await selectBookChild(dauSach);
        // if(ma_sach == null)
        //     return ({success: 0, updated: 0, message:`Sách đã được mượn hết!`}) 

        var query = {
            "_id": dauSach, 
            "cac_quyen_sach":{
                "_id": maSach,
                "tinh_trang": true
            }
        };
        var update = {
            $inc: { "so_luong_kha_dung": -1},
            "cac_quyen_sach.$.tinh_trang": false
        };
        var option = {"fields": {"cac_quyen_sach.$": 1}, new: false, useFindAndModify: false}

        var sach = await BookHead.findOneAndUpdate(query, update, option );

        if(sach){
            const borrowReturnCard = new BorrowReturnCard({
                doc_gia: maDocGia,
                dau_sach: dauSach,
                ma_sach: maSach,
                ngay_muon: ngay_muon,
                tinh_trang: 1
            })
            borrowReturnCard.save();
            await updateBorrowHisory(maDocGia, dauSach)
            return ({ success: 1, updated: 1, message:`Thêm phiếu phiếu mượn thành công!`})
        }else{
            return ({ success: 0, updated: 0, message:`Sách không khả dụng!`})
        }   
 
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
        var book = await BookHead.findById(id);
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

        var book = await BookHead.find(query).select(select);
        return book;
    }
    catch{
        return null;
    }   
}



//Save, update borrow-return-card......
 async function saveBorrowData(maDocGia, dsDauSach, dsMaSach, ngayMuon){
    var nSuccess=[];
    var nErrors=[];

    for(let i =0; i< dsDauSach.length; i++){
        try{
            var book = await BookHead.findOne({"_id": dsDauSach[i], "cac_quyen_sach._id": dsMaSach[i] });
            if(!book){
                nErrors.push({success: 0, updated: 0, message:`${dsDauSach[i]} và ${dsMaSach[i]} là cặp ID không hợp lệ!`, dau_sach: dsDauSach[i], ten_dau_sach: "", ma_sach: dsMaSach[i]});
            }
            else{
                const check = await checkBorrowHistory(maDocGia, dsDauSach[i])
                if(!check.ok){
                    nErrors.push({success: 0, updated: 0, message:check.message, dau_sach: book._id, ten_dau_sach: book.ten_dau_sach, ma_sach: dsMaSach[i]});
                } 
                else{
                    
                    const borrowCard = await getBRC(dsDauSach[i], maDocGia);

                    if(!borrowCard){ 
                        //Chưa mượn sách
                        var result = await saveBRC(maDocGia, dsDauSach[i], dsMaSach[i], ngayMuon);

                        if(result.success)
                            nSuccess.push({...result, message:`${result.message}`, dau_sach: book._id, ten_dau_sach: book.ten_dau_sach, ma_sach: dsMaSach[i]});
                        else
                            nErrors.push({...result, message:`${result.message}`, dau_sach: book._id, ten_dau_sach: book.ten_dau_sach, ma_sach: dsMaSach[i]});
                    }
                    else if(borrowCard.tinh_trang == 0)
                    {
                        //Đã đăng ký mượn sách nhưng chưa đến lấy
                        var result = await updateBRC(borrowCard._id, dsDauSach[i], dsMaSach[i], ngayMuon);
                        if(result.success)
                            nSuccess.push({...result, message:`${result.message}`,  dau_sach: book._id, ten_dau_sach: book.ten_dau_sach, ma_sach: dsMaSach[i]});
                        else
                            nErrors.push({...result, message:`${result.message}`,  dau_sach: book._id, ten_dau_sach: book.ten_dau_sach, ma_sach: dsMaSach[i]});
                    }
                    else
                    {
                        //Đã mượn lấy sách nhưng chưa trả
                        nErrors.push({success: 0, updated: 0, message:`Độc giả đã mượn sách này nhưng chưa trả!`, dau_sach: book._id, ten_dau_sach: book.ten_dau_sach, ma_sach: dsMaSach[i]});
                    }  
                }
            }
                         
        }
        catch(err){
            console.log(err)
            nErrors.push({success: 0, updated: 0, message:`Mượn sách không thành công!`, dau_sach: dsDauSach[i], ten_dau_sach: "", ma_sach: dsMaSach[i]});
        }
    }

    return {nSuccess, nErrors}
}


//get PhieuMuonTra of reader
async function getBorrowCardOf(maDocGia, tinhTrang){
    const query = {"doc_gia": maDocGia}
    if(tinhTrang != -1)
        query.tinhTrang = tinhTrang;

    const borrowCards = await BorrowReturnCard
        .find(query)
        .populate({ path: "doc_gia", select: "ho_ten email" })
        .populate({ path: "dau_sach", select: "ten_dau_sach" })
        .sort({"tinhTrang": 1})

    return borrowCards;
}

//Update borrow return card by ID
async function updateBRCByID(id, ngayMuon){
    try{
        var query = {"_id": id}
        var update = {"ngay_muon":ngayMuon ,"tinh_trang": 1}

        const result = await BorrowReturnCard.updateOne(query, update)
        if(result.modifiedCount&&result.matchedCount){
            return ({success: 1, updated: 1, message:`Cập nhật phiếu đăng ký thành phiếu mượn thành công!`})
        }    
        else
            return ({success: 0, updated: 0, message:`Cập nhật phiếu đăng ký thành phiếu mượn không thành công!`})

    }
    catch(err){
        console.log(err);
        return ({success: 0, updated: 0, message:`Cập nhật phiếu đăng ký thành phiếu mượn không thành công!`})
    } 
}

//update borrow return card
async function updateBorrowData(dsMaPhieu, ngayMuon){
    var nSuccess= [];
    var nErrors = [];
   for(var maPhieu of dsMaPhieu)
   {
       try{
            const result = await updateBRCByID(maPhieu, ngayMuon);
            if(result.success)
                nSuccess.push(maPhieu)
            else
                nErrors.push(maPhieu)
       }
       catch(err){
           console.log(err)
            nErrors.push(maPhieu)
       }
   }
   return {nSuccess, nErrors}
}


//Get DauSach by QuyenSach id
async function getBookBorrowByID(readerId, childId){

    if(childId == null || childId == undefined)
        return {success: false, book: null, message: "Không tìm thấy thông tin sách, vui lòng kiểm tra lại!"};
    else if(!mongoose.isValidObjectId(readerId))
        return {success: false, book: null, message: "Mã độc giả không hợp lệ, vui lòng kiểm tra lại!"};
    else if(!mongoose.isValidObjectId(childId))
        return {success: false, book: null, message: "Mã sách không hợp lệ, vui lòng kiểm tra lại!"};


    const query= { "cac_quyen_sach._id": childId };
    const option = {
        "anh_bia":1,
        "kieu_anh_bia":1,
        "bf_anh_bia":1,
        "_id": 1,
        "ten_dau_sach": 1,
        "tac_gia": 1,
        "gia": 1,
        "so_luong": 1,
        "so_luong_kha_dung": 1,
        "cac_quyen_sach.$": 1
    
    };

    const book = await BookHead.findOne(query, option);
    if(book == null)
        return {success: false, book: null, message: "Không tìm thấy thông tin sách, vui lòng kiểm tra lại!"}
    else {
        const borrowQueryMaSach = {
            "ma_sach": childId, 
            "tinh_trang": {$in: [0, 1]}
        }

        const borrowQueryDauSach = {
            "dau_sach": book._id,
            "doc_gia": readerId, 
            "tinh_trang":  1
        }

        const borrowCards = await BorrowReturnCard.findOne(borrowQueryMaSach);
        const readerBorrowCards = await BorrowReturnCard.findOne(borrowQueryDauSach);

        if(borrowCards != null && borrowCards.doc_gia!=readerId)
            return {success: false, book: null, message: "Sách đã được đăng ký bởi người khác!"}
        else if(readerBorrowCards != null)
            return {success: false , book: null, message: "Độc giả đã mượn sách này nhưng chưa trả!"}
        else{
            var newBook = {...book._doc, anh_bia: book.anh_bia};
           
            delete newBook.bf_anh_bia;
            delete newBook.kieu_anh_bia;
            return {success: true, book: newBook, message: "Khả dụng"}
        }
            
    }
}

async function countBorrowRegister(readerId){
    const countBorrow = await BorrowReturnCard.countDocuments({"doc_gia": readerId, "tinh_trang": 1});
    const countRegister = await BorrowReturnCard.countDocuments({"doc_gia": readerId, "tinh_trang": 0});
    const countRegisterCard = await RegisterBorrowCard.countDocuments({"doc_gia": readerId, "tinh_trang": 0});
    return {borrow: countBorrow, register: countRegister + countRegisterCard};
}

module.exports.findReader = findReader;
module.exports.findBookById = findBookById;
module.exports.checkReader = checkReader;
module.exports.findBook = findBook;
module.exports.saveBorrowData = saveBorrowData;
module.exports.getBorrowCardOf = getBorrowCardOf;
module.exports.updateBorrowData = updateBorrowData;
module.exports.getBookBorrowByID = getBookBorrowByID;
module.exports.countBorrowRegister = countBorrowRegister;
