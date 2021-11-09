const BookCategory = require('../../models/book-category');
const { getAllBook, getBookCategory, saveBookData, getBookByID, deleteBookData, updateBookData } = require('../../services/librarian/manage-book-service');


//Render all books page
async function all(req, res){
    //try-catch
    try {
        //Query find book
        const books = await  getAllBook();
        res.render('librarian/book-management/all', {
          books: books,
          searchOptions: req.query
        })
    }
    catch (err){
        console.log(err)
        res.send(err)
    }
}

//----------------New book page------------------------------

//Render new book page
async function newBookForm(req, res){
    //try-catch
    try {
        //Query find book-category
        const bookCategories = await getBookCategory();
        res.render('librarian/book-management/new', {
            bookCategories: bookCategories
        })
    }
    catch(err){
        console.log(err)
        res.send(err)
    }
}


//Add new book 
async function saveBook(req, res){
    //Init book data
    const book = {
        anh_bia: req.file.filename,
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
    const result = await saveBookData(book);
    if(result.success)
        res.redirect(`/librarian/books/${result._id}`)
    else{
        //Query find book category
        const bookCategories = await BookCategory.find().exec();
        res.render('librarian/book-management/new', {
            bookCategories: bookCategories,
            message: req.message,
            error: req.message
        })
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

//---------------------Update book page-----------------------

//Render edit book page 
async function updateBookForm(req, res){
    var bookId = req.params['id']
    try {
        
        //Query find book
        const book = await getBookByID(bookId)
        //Query find book-category
        const bookCategories = await BookCategory.find().exec();

        res.render('librarian/book-management/edit', {
            book: book,
            bookCategories: bookCategories
        })
    }
    catch{
        res.send('error ')
    }
}

//Update book
async function updateBook(req, res){
    //Middleware error
    if(req.error)
    {
        res.json({success: false, message: req.message})
    }
    else {
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
            so_luong: req.body.so_luong,
            so_luong_kha_dung:req.body.so_luong,
            tom_tat: req.body.tom_tat,
            anh_bia: req.file
        };
        
        const result = await updateBookData(id, newBook)
        res.json(result)
    }
}



//------------------------Delete book-----------------

//Delete Book 
async function deleteBook(req, res) {
    var bookId;
    if(req.params)
        bookId = req.params['id'];
    else
        return {success: false, message: ""};

    //Try-catch
    try {
        //Query find book
        let result = await deleteBookData(bookId);
        return res.json(result);
    }
    catch (err){
        console.log(err)
        return  res.json({success: false, message: ""});
    }
}




module.exports = {
    all,
    bookDetail,
    newBookForm,
    updateBookForm,
    saveBook,
    updateBook,
    deleteBook,
};
