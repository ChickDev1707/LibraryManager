const mongoose = require('mongoose');
const BorrowReturnCard = require('../../models/borrow-return-card')
const Reader = require('../../models/reader');
const BookHead = require('../../models/book-head');
const RegisterBorrowCard = require('../../models/register-borrow-card');
const UserAccount = require('../../models/user-account');
const { getBorrowBookPolicies, getFinePolicies } = require('./policy');


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
 async function checkReader(readerId, amount){
    try{
        const reader = await findReader("id", readerId);
        const Finepolicy = await getFinePolicies();
        const borowPolicy = await getBorrowBookPolicies();
        const borowHistory = reader.account.lich_su_dk;
        const maximum =  parseInt(borowPolicy.maxAllowedBorrowBook) - parseInt(borowHistory.length)

        if(!reader)
            return ({ok: false, message:"Không tìm thấy thông tin độc giả"})
        else if(parseFloat(reader.tien_no) > parseFloat(Finepolicy.maxAllowedDebt))
            return ({ok: false, message:"Độc giả nợ tiền vượt quá qui định"})
        else if(maximum - amount < 0)
            return ({ok: false, message:`Độc giả đăng ký và mượn quá số lượng quy định, chỉ có thể mượn thêm tối đa ${maximum} cuốn`})
        else
            return ({ok: true, message:"Khả dụng"}) 
    }
    catch(err){
        console.log(err);
        return ({ok: false, message:"Không tìm thấy thông tin độc giả"})
    }
}

//check lich_su_dk
async function checkBorrowHistory(readerId, bookId){

    try{
        const reader = await findReader("id", readerId);
        const lich_su_dk = reader.account.lich_su_dk; 

        if(!reader.account)
            return {ok: false, message: "Không tìm thấy thông tin tài khoản của độc giả!"}        
        else if(lich_su_dk.indexOf(bookId)!=-1)
            return {ok: false, message: "Độc giả đang đăng ký hoặc đang mượn sách này!"}; 
        else
            return {ok: true, message: "khả dụng!"};              
            
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
        "ngay_tra": null
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

//
async function getBorrowRegisterCard(readerId, bookHeadId){
    var query = {
        "doc_gia": maDocGia, 
        "cac_dau_sach": dauSach, 
       "tinh_trang": {$in: [0, 1]}
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
async function updateQuyenSach(bookHeadId, bookId){
    var query = {
        "_id": bookHeadId, 
        "cac_quyen_sach":{
            "_id": bookId,
            "tinh_trang": true
        }
    };
    var update = {
        $inc: { "so_luong_kha_dung": -1},
        "cac_quyen_sach.$.tinh_trang": false
    };
    var option = {"fields": {"cac_quyen_sach.$": 1}, new: false, useFindAndModify: false}

    var book = await BookHead.findOneAndUpdate(query, update, option );
    return book;
}

//Update "lich_su_dk"
async function updateBorrowHisory(readerId, bookHeadId){
    try{
        var reader = await Reader.findById(readerId);
        var result = await UserAccount.updateOne({"ten_tai_khoan": reader.email},{"$push": { "lich_su_dk": bookHeadId }})
    }catch(err){
        console.log(err);
    }
}


//Insert new BorrowReturnCard: "tinh_trang": 1 
async function saveBRC(readerId, bookHeadId, bookId, dateBorrow){
    try{

        var book = await  updateQuyenSach(bookHeadId, bookId)

        if(book){
            const borrowReturnCard = new BorrowReturnCard({
                doc_gia: readerId,
                dau_sach: bookHeadId,
                ma_sach: bookId,
                ngay_muon: dateBorrow
            })
            await borrowReturnCard.save();
            await updateBorrowHisory(readerId, bookHeadId)
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

    const readerChecked = await checkReader(maDocGia, dsDauSach.length);
    if(!readerChecked.ok){
        nErrors.push({success: 0, updated: 0, message:readerChecked.message});
        return {nSuccess, nErrors}
    }

    for(let i =0; i< dsDauSach.length; i++){
        try{
            var book = await BookHead.findOne({"_id": dsDauSach[i], "cac_quyen_sach._id": dsMaSach[i] });
            if(!book){
                nErrors.push({success: 0, updated: 0, message:`${dsDauSach[i]} và ${dsMaSach[i]} là cặp ID không hợp lệ!`, dau_sach: dsDauSach[i], ten_dau_sach: "", ma_sach: dsMaSach[i]});
                continue;
            }
            const borrowHis = await checkBorrowHistory(maDocGia, dsDauSach[i]);
            if(!borrowHis.ok){
                nErrors.push({success: 0, updated: 0, message: borrowHis.message, dau_sach: dsDauSach[i], ten_dau_sach: "", ma_sach: dsMaSach[i]});
                continue;
            }

            var result = await saveBRC(maDocGia, dsDauSach[i], dsMaSach[i], ngayMuon);
            if(result.success)
                nSuccess.push({...result, message:`${result.message}`, dau_sach: book._id, ten_dau_sach: book.ten_dau_sach, ma_sach: dsMaSach[i]});
            else
                nErrors.push({...result, message:`${result.message}`, dau_sach: book._id, ten_dau_sach: book.ten_dau_sach, ma_sach: dsMaSach[i]}); 

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
        const borrowHis = await checkBorrowHistory(readerId, book._id);
        if(!borrowHis.ok){
            return {success: false, book: null, message: borrowHis.message}
        }
        else if(!book.cac_quyen_sach[0].tinh_trang)
            return {success: false, book: null, message: "Sách đã được đăng ký bởi người khác!"}
        else{
            var newBook = {...book._doc, anh_bia: book.anh_bia};          
            delete newBook.bf_anhs_bia;
            delete newBook.kieu_anh_bia;
            return {success: true, book: newBook, message: "Khả dụng"}
        }
            
    }
}

async function countBorrowRegister(readerId){
    const countBorrow = await BorrowReturnCard.countDocuments({"doc_gia": readerId, "ngay_tra": null});
    const countRegisterCard = await RegisterBorrowCard.countDocuments({"doc_gia": readerId, "tinh_trang": {$in: [0, 1]}});
    return {borrow: countBorrow, register: countRegisterCard};
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
