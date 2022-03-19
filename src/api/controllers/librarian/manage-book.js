const BookCategory = require('../../models/book-category');
const { getAllBook, getBookCategory, saveBookData, getBookByID, deleteBookData, updateBookData, deleteBookChild, addBookChild, importBooksByExcel } = require('../../services/librarian/manage-book-service');
const ejs = require('ejs');
const path = require('path')
const multer=require('multer')
const XLSX=require('xlsx')
const urlHelper=require('../../helpers/url')


const uploadPath = path.join('./src/public', '/uploads/addBook')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalName)
    }
  })
const uploadBook = multer({ storage: storage })

//Render all books page
async function all(req, res){
    //try-catch
    try {
        //Query find book
        const books = await  getAllBook();
        const bookCategories = await getBookCategory()
        res.render('librarian/book-management/all', {
          books: books,
          bookCategories: bookCategories,
          searchOptions: req.query
        })
    }
    catch (err){
        console.log(err)
        res.send(err)
    }
}

//----------------New book page------------------------------

//Add new book 
async function saveBook(req, res){
    //Init book data
    const book = {
        ten_dau_sach: req.body.ten_dau_sach,
        the_loai: req.body.the_loai,
        tac_gia: req.body.tac_gia,
        nam_xuat_ban: req.body.nam_xuat_ban,
        nha_xuat_ban: req.body.nha_xuat_ban,
        ngay_nhap: req.body.ngay_nhap,
        gia: req.body.gia,
        so_luong: req.body.so_luong,
        tom_tat: req.body.tom_tat,
        so_luong_kha_dung: req.body.so_luong
    }

    //Save book data
    const result = await saveBookData(book, req.body.anh_bia);

    // res.render("partials/book-management/edit_copy", {book: result.book, bookCategories: result.category})
    // res.json(result)
    var rootPath = path.resolve('./');
    var editPath =  rootPath.concat('\\src\\api\\views\\partials\\book-management\\edit_add.ejs');
    var rowPath = rootPath.concat('\\src\\api\\views\\partials\\book-management\\row.ejs')
    if(result.success){
        const redirectUrl =urlHelper.getEncodedMessageUrl('/librarian/books/',{
            type:'success',
            message:"Thêm thành công!"
        })
        result.redirect = redirectUrl
        res.json(result);
    }else{
        result.newModal = "";
        result.newRow = "";
        result.redirect = ""
        res.json(result);
    }
   
   
}

//--------------------Book Detail--------------------

//Render view book
async function bookDetail(req, res){
    var bookId = req.params['id']
    //try-catch
    try {
        //find book 
        const book = await getBookByID(bookId);
        if(book)
            res.render('librarian/book-management/view', {
                book: book
            })
        else
            res.send("Không tìm thấy thông tin sách")
    }
    catch(err){
        console.log(err)
    }
}

//--------------------Book update--------------------

//Update book
async function updateBook(req, res){
    //Middleware error
    var id = req.params['id'];
        //new book
        let newBook = {
            ten_dau_sach: req.body.ten_dau_sach,
            the_loai: req.body.the_loai,
            tac_gia: req.body.tac_gia,
            nam_xuat_ban: req.body.nam_xuat_ban,
            nha_xuat_ban: req.body.nha_xuat_ban,
            ngay_nhap: req.body.ngay_nhap,
            gia: req.body.gia,
            tom_tat: req.body.tom_tat
        };
        
        const result = await updateBookData(id, newBook, req.body.anh_bia)
       
        res.json(result)
}



//------------------------Delete book-----------------

//Delete Book 
async function deleteBook(req, res) {
    var bookId;
    if(req.params)
        bookId = req.params['id'];
    else
        return {success: false, message: "Không tìm thấy sách!"};

    //Try-catch
    try {
        //Query find book
        let result = await deleteBookData(bookId);
        return res.json(result);
    }
    catch (err){
        console.log(err)
        return  res.json({success: false, message: "Xoá sách không thành công!"});
    }
}

async function deleteChildBook(req, res){
    const id = req.params["id"];
    const childId = req.params["child"];
    var result = await deleteBookChild(id, childId);
    res.json(result);
}


async function addChildBook(req, res){
    const id = req.params['id'];
    const number = req.body.so_luong;
    const result = await addBookChild(id, number)
    res.json(result)
}

async function importBooks(req, res){
    if(req.file){
        const result = await importBooksByExcel(req.file);
        var redirectUrl = ''
        if(result){
            redirectUrl =urlHelper.getEncodedMessageUrl('/librarian/books/',{
                type:'success',
                message:"Thêm thành công!"
            })
        }else{
            redirectUrl = urlHelper.getEncodedMessageUrl('/librarian/books/',{
                type:'error',
                message:"Thêm không thành công!"
            })
        }
        res.redirect(redirectUrl)
         
    
    }
}

module.exports = {
    all,
    bookDetail,
    saveBook,
    updateBook,
    deleteBook,
    deleteChildBook,
    addChildBook,
    uploadBook,
    importBooks
};
