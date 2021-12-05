const BorrowReturnCard=require('../../models/borrow-return-card.js')
const Reader=require('../../models/reader')
const Book=require('../../models/book-head.js')
const UserAccount=require('../../models/user-account')

async function handleEmptyEmail(){
    let kq={
        allBorrowReturnCard:[],
        allNameReader:[]
    }
    
    kq.allBorrowReturnCard=await BorrowReturnCard.find({ngay_tra:null})
    kq.allNameReader=await danh_sach_ten_doc_gia(kq.allBorrowReturnCard)
    return kq

}   
async function handleHasEmail(queryEmail){
    
    let kq={
        allBorrowReturnCard:[],
        allNameReader:[]
    }
    const search={}
    search.email=new RegExp(queryEmail,'i')
    const reader=await Reader.find({email:search.email})
    try{
        kq.allBorrowReturnCard=await BorrowReturnCard.find({doc_gia:reader[0]._id.toString(),ngay_tra:null})
        kq.allNameReader=await danh_sach_ten_doc_gia(kq.allBorrowReturnCard)
    }catch(e){
        
    }

    return kq
}

async function confirmCard(borrowReturnCard){
    const today=new Date()
    const month=((today.getMonth()+1)<10)?('0'+(today.getMonth()+1)):(today.getMonth()+1)
    const ngay_tra=today.getFullYear()+'-'+month+'-'+today.getDate() 

    const lengthOfCardSelected=borrowReturnCard.length

    for(let i=0;i<lengthOfCardSelected;i++){
        const card=await BorrowReturnCard.findById(borrowReturnCard[i])

        card.ngay_tra=ngay_tra    //thêm ngày trả
        card.so_ngay_tra_tre=tinh_ngay_tra_tre(today,card.ngay_muon)  //tính số ngày trả trễ

        try{
            
            if(card.so_ngay_tra_tre>0){
                const reader=await Reader.findById(card.ma_doc_gia)
                const email=reader.email
                reader.tien_no+=card.so_ngay_tra_tre*1000   //xử lý tiền nợ
                await reader.save()
                //
                const userAccount=await UserAccount.find({ten_tai_khoan:email})
                const sachIndex=userAccount.lich_su_dk.indexOf(card.ma_sach)
                const removed=userAccount.lich_su_dk.splice(sachIndex,1)       //xóa sách trong lịch sử đăng ký
                await userAccount.save()  
            }
           
            const book=await Book.findById(card.ma_sach)
            book.so_luong_kha_dung=book.so_luong_kha_dung+1     //xử lý số lượng sách khả dụng
            await book.save()
        }catch{
            console.log("error")
        }
        await card.save()

        }
        let kq={
            allBorrowReturnCard:[],
            allNameReader:[]
        }
        kq.allBorrowReturnCard=await BorrowReturnCard.find({ngay_tra:null})
        kq.allNameReader=await danh_sach_ten_doc_gia(kq.allBorrowReturnCard)
        return kq
}
async function unConfirmCard(){
    let kq={
        allBorrowReturnCard:[],
        allNameReader:[]
    }
    kq.allBorrowReturnCard=await BorrowReturnCard.find({ngay_tra:null})
    kq.allNameReader=await danh_sach_ten_doc_gia(kq.allBorrowReturnCard)
    return kq
}

function tinh_ngay_tra_tre(ngay_tra,ngay_muon){

    const so_ngay_tra_tre=parseInt((ngay_tra.getTime()-ngay_muon.getTime())/(24*3600*1000))

    if(so_ngay_tra_tre>30){
        return so_ngay_tra_tre-30
    }
    else{
        return 0
    }
}
 async function danh_sach_ten_doc_gia(allBorrowReturnCard){
    let allNameReader=[]
    const lengOfCard=allBorrowReturnCard.length
        
    for(let i=0;i<lengOfCard;i++){
        let ten_doc_gia=await Reader.findById(allBorrowReturnCard[i].doc_gia.toString())
        allNameReader.push(ten_doc_gia.ho_ten)
    }

    return allNameReader
}

module.exports={
    handleEmptyEmail,
    handleHasEmail,
    confirmCard,
    unConfirmCard
}