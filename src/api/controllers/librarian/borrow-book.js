const BorrowReturnCard = require('../../models/borrow-return-card')
const Reader = require('../../models/reader')
const Book = require('../../models/book-head')
const mongoose = require('mongoose');
const { findReader, findBookById, checkReader, findBook, saveBorrowData, getBorrowCardOf, updateBorrowData, getBookBorrowByID } = require('../../services/librarian/borrow');


//Render borrow form 
async function borrowForm(req, res, next){
    const searchString = req.query.search_string;
    const option = req.query.search_option;

    try {
        if(searchString == undefined || option == undefined){
            return res.render('librarian/borrow-book/new',{
                books: null, 
                reader: null,
                option: "id",
                searchString: null,
                status: {alert: false, type: "", message: ""}
            })

        }else{

            const reader = await findReader(option, searchString);
            const books = await findBook();

            res.render('librarian/borrow-book/new',{
                books: reader?books:null,
                reader: reader,
                option: option,
                searchString: searchString,
                status: reader?{alert: false, type: "", message: ""}:{alert: true, type: "danger", message: "Không tìm thấy thông tin độc giả!"}     
            })
            
        }
        
    }catch (err) {
        res.render('librarian/borrow-book/new',{
            books: null,
            reader: null,
            searchString: searchString,
            option: option,
            status: {alert: false, type: "danger", message: "Lỗi: vui lòng thử lại!"}  
        })
    }
}


//Save BorrowReturnCard data from POST method
async function saveBorrowCard(req, res, next)
{
    const ma_doc_gia = req.body.ma_doc_gia;
    const ngay_muon = req.body.ngay_muon;
    const dsDauSach = req.body.dau_sach;
    const dsMaSach = req.body.ma_sach;

    const check = await checkReader(ma_doc_gia)
    if(!check.ok)
        return res.json({
            success: false, 
            nSuccess: [], 
            nErrors: [{ok: 0, updated: 1, message: check.message}]
        });

    var result = await saveBorrowData(ma_doc_gia, dsDauSach, dsMaSach, ngay_muon)
    return res.json({success: result.nErrors.length == 0, nSuccess: result.nSuccess, nErrors: result.nErrors});
}

//-----------------------------------------------XÁC NHẬN PHIẾU MƯỢN---------------------------------------

//Render form to confirm BorrowReturnCard
async function confirmForm(req, res, next){
    try {

        if(req.query.search_string === undefined)
            return res.render('librarian/borrow-book/confirm',{
                reader: null,
                option: 'id',
                searchString: "",
                borrowCards: null,
                error: false,
                message: "" 
            })
        else
        {
            const option = req.query.search_option;
            var searchString = req.query.search_string;

            const reader = await findReader(option, searchString);
            var borrowCards = null;
            if(reader!=null)
                borrowCards =  await getBorrowCardOf(reader._id, -1)

            return res.render('librarian/borrow-book/confirm',{ 
                    reader: reader,
                    option: option,
                    searchString: searchString,
                    borrowCards: borrowCards,
                    error: reader==null?true:false,
                    message: reader==null?"Không tìm thấy thông tin độc giả!":""    
            })     
        }
    }
    catch (err) {
        console.log(err)
    }
}


async function updateBorrowForm(req, res, next){
    const dsMaPhieu = req.body.dsMaPhieu;
    const ngayMuon = req.body.ngayMuon;
    if(checkDate(ngayMuon)){
        const result = await updateBorrowData(dsMaPhieu, ngayMuon)
        return res.json({success: result.nErrors.length == 0, nSuccess: result.nSuccess, updated: true, nErrors: result.nErrors})
    }else{
        return res.json({success: 0, nSuccess: 0, updated: true, nErrors: 0, message: "Ngày lấy không được vượt quá ngày hiện tại!"})
    }

    
}

async function getBorrowBook(req, res, next){
    const childId = req.query.ma_sach;
    const readerId = req.query.ma_doc_gia;
    const book = await getBookBorrowByID(readerId, childId)
    res.json(book)
}

function checkDate(dateString){
    var date = new Date(dateString);
    var toDate = new Date();
    return date <= toDate
}

module.exports = {
    borrowForm,
    confirmForm,
    saveBorrowCard,
    updateBorrowForm,
    getBorrowBook
}