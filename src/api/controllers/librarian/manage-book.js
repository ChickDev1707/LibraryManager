const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Book = require('../../models/book')
const BookCategory = require('../../models/book-category')

const uploadPath = path.join('./src/public', Book.coverImageBasePath)
const getImagePath = path.join('/public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

//init storage for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
      cb(null, Date.now().toString() + file.originalname);
    }
  });

//init upload multer
const upload = multer({
    storage: storage,   
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//Remove book cover image
function removeBookCover(getPath) {
    const fileName = getPath&&getPath.split('\\')[4];
    const removePath = path.join(uploadPath, fileName)
    fs.unlink(removePath, err => {
        if (!err)
            return true;
        console.log("ERROR", err)
        return false; 
            
    })
}


//Render all books page
async function all(req, res){

    //try-catch
    try {
        //Query find book
        const books = await  Book.find().exec()
        res.render('librarian/book-management/all', {
          books: books,
          searchOptions: req.query
        })
    }
    catch (err){
        res.send(err)
    }
}

//Render new book page
async function newBookForm(req, res){
    //try-catch
    try {
        //Query find book-category
        const bookCategories = await BookCategory.find().exec();
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
    //error
    if(req.error)
    {
        //Query find book category
        const bookCategories = await BookCategory.find().exec();
        res.render('librarian/book-management/new', {
            bookCategories: bookCategories,
            message: req.message,
            error: req.message
        })
    }
    else
    {
        //New book 
        const book = new Book({
            anh_bia: path.join(getImagePath, req.file.filename),
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
        })
        
        for(let i=0;i<req.body.so_luong;i++)
        {
            book.cac_quyen_sach.push({tinh_trang: true})
        }
        //try-catch
        try {
           book.save();
           res.redirect(`/librarian/books/${book._id}`)
        }
        catch{
            res.send('Error')
        }

    } 
}


//Render view book
async function bookDetail(req, res){
    var bookId = req.params['id']
    //try-catch
    try {
        //Query find book
        let book = await Book.findById(bookId).exec();
        //Query find book-category
        var bookCategory = await BookCategory.findById(book.the_loai).exec();
        //set book-category-book-name
        book.the_loai = bookCategory.ten_the_loai;

        res.render('librarian/book-management/view', {
            book: book
          })
    }
    catch{
        res.send('error ')
    }
}

//Render edit book page 
async function updateBookForm(req, res){
    var bookId = req.params['id']
    try {
        //Query find book
        const book = await Book.findById(bookId).exec()
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
    const bookId = req.params["id"]
    //Middleware error
    if(req.error)
    {
        try {
            //Query find book
            const book = await Book.findById(bookId).exec()
            //Query find book-category
            const bookCategories = await BookCategory.find().exec();

            res.render('librarian/book-management/edit', {
                book: book,
                bookCategories: bookCategories,
                error: req.message
            })
        }
        catch{
            res.send('error ')
        }
    }
    else {
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
            tom_tat: req.body.tom_tat
        };
    
        //Check update book cover image
        if(req.file)
            newBook.anh_bia =  path.join(getImagePath, req.file.filename)
        //Try-catch
        try {
            //Query find book
            const book = await Book.findOneAndUpdate(bookId, newBook, {useFindAndModify: false}).exec();
            
            //Book does not exist
            if(!book)
                return res.redirect('/librarian/books');
    
            //Remove book cover image
            if(req.file)
                removeBookCover(book.anh_bia);
    
           res.redirect(`/librarian/books/${bookId}`)
        }
        catch{
            res.send('error ')
        }
    }
}


//Delete Book 
async function deleteBook(req, res) {
    var bookId = req.params['id'];

    //Try-catch
    try {
        //Query find book
        let book = await Book.findByIdAndRemove(bookId, {useFindAndModify: false}).exec();
        //Book does not exist
        if(!book)
            return res.redirect('/librarian/books')
        
        //Remove book cover image
        removeBookCover(book.anh_bia);
        res.redirect("/librarian/books")
    }
    catch (err){
        res.send(err)
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
    upload
};
