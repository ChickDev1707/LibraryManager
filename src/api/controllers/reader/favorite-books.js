const Account=require('../../models/user-account')
const AccountService=require('../../services/account')
const Books=require('../../models/book-head')
async function getFavoriteBook(req,res){
    const books=[]
    try{
        const favoriteBook=await AccountService.getCurrentUserAccount(req)

        const lengthOfFavoriteBook=favoriteBook.sach_yeu_thich.length
        
        if(lengthOfFavoriteBook>0){
            for(let i=0;i<lengthOfFavoriteBook;i++){
                const book=await Books.findById(favoriteBook.sach_yeu_thich[i]).populate('the_loai')
                books.push(book)
            }
        }
    }catch{
        
    }
    res.render('reader/favorite-book',{
        favoriteBook:books
    })
}

async function postFavoriteBook(req,res){
    try{
        const favoriteBook=await AccountService.getCurrentUserAccount(req)
        if(favoriteBook.vai_tro=="reader"){
            if(favoriteBook.sach_yeu_thich.indexOf(req.body.bookHeadIdFavorite,0)==-1){
                try{
                    favoriteBook.sach_yeu_thich= [...favoriteBook.sach_yeu_thich,req.body.bookHeadIdFavorite]
                    await favoriteBook.save()
                }catch{
        
                }
            }
            res.redirect('/reader/favorite-books')
        }
        else{
            res.redirect(`/book-head/${req.body.bookHeadIdFavorite}`)
        }
    }catch{
        res.redirect(`/book-head/${req.body.bookHeadIdFavorite}`)
    }


    // res.render('reader/favorite-book',{
    //     favoriteBook:favoriteBook.sach_yeu_thich
    // })
}   
async function putFavoriteBook(req,res){
    const favoriteBook=await AccountService.getCurrentUserAccount(req)
    const indexFavoriteBook=favoriteBook.sach_yeu_thich.indexOf(req.body.deleteFavoriteBook)
    favoriteBook.sach_yeu_thich.splice(req.body.deleteFavoriteBook,1)
    await favoriteBook.save()
    res.redirect('/reader/favorite-books')
}
module.exports={
    getFavoriteBook,
    postFavoriteBook,
    putFavoriteBook
}