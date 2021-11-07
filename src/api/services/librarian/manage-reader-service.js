const Reader=require('../../models/reader')
const Account=require('../../models/user-account')
const BorrowReturnCard=require('../../models/borrow-return-card')
async function searchReader(Query){
    const search={}
    if(Query!=null || Query!=""){
      search.ho_ten=new RegExp(Query,"i")
    }
    const reader=await Reader.find(search)
    return reader
}

async function handleAddReader(reqBody){
    const nam_sinh=new Date(reqBody.ngay_sinh)
    const today=new Date()
    const checkAge=today.getFullYear()-nam_sinh.getFullYear()

    const checkEmail=await Reader.find({"email":reqBody.email})

    const data={
        reader:"",
        addAccount:"",
        errorMessage:""
    }

    if(checkAge<18){
        data.errorMessage="Không đủ tuổi đăng ký"
    }
    else if(checkAge>55){
        data.errorMessage="Vượt quá độ tuổi đăng ký"
    }
    else if(checkEmail.toString()!=''){
        data.errorMessage="Email đã được sử dụng!!!"
    }
    else{
        data.addAccount=new Account({
            ten_tai_khoan:reqBody.email,
            mat_khau:"reader",
            vai_tro:"reader"
        })

        data.reader=new Reader({
            ho_ten:reqBody.ho_ten,
            email:reqBody.email,
            gioi_tinh:reqBody.gioi_tinh,
            ngay_sinh:reqBody.ngay_sinh,
            dia_chi:reqBody.dia_chi,
            ngay_lap_the:reqBody.ngay_lap_the,
            id_account:data.addAccount.id,
        })
    }
    return data
}
async function editReader(reqParam){
    const reader= await Reader.findById(reqParam.id)

    const Data={
      id:reader.id,
      ho_ten:reader.ho_ten,
      email:reader.email,
      gioi_tinh:reader.gioi_tinh,
      ngay_sinh:reader.ngay_sinh.toISOString().split('T')[0],
      dia_chi:reader.dia_chi,
      ngay_lap_the:reader.ngay_lap_the.toISOString().split('T')[0],
  }
  return Data
}
async function handleEditReader(reqParam,reqBody){
    const nam_sinh=new Date(reqBody.ngay_sinh)
    const today=new Date()
    const checkAge=today.getFullYear()-nam_sinh.getFullYear()

    let reader= await Reader.findById(reqParam.id)
    const account=await Account.findById(reader.id_account)
    const checkEmail=await Reader.find({"email":reqBody.email})

    const dataReturn={
        data:{
            id:reader.id,
            ho_ten:reader.ho_ten,
            email:reader.email,
            gioi_tinh:reader.gioi_tinh,
            ngay_sinh:reader.ngay_sinh.toISOString().split('T')[0],
            dia_chi:reader.dia_chi,
            ngay_lap_the:reader.ngay_lap_the.toISOString().split('T')[0],
        },
        error:"",
        reader:'',
        account:''
    }

    if(checkAge<18){
        dataReturn.error="Không đủ độ tuổi"
       
    }
    else if(checkAge>55){
        dataReturn.error="Vượt quá tuổi đăng ký"
        
    }
    else if(checkEmail.toString()!='' ){
        if(checkEmail[0]._id != reqParam.id){
            dataReturn.error="Email đã đăng ký"
        }   
        else{
        
            reader.ho_ten=reqBody.ho_ten
            reader.email=reqBody.email
            reader.gioi_tinh=reqBody.gioi_tinh
            reader.ngay_sinh=reqBody.ngay_sinh
            reader.dia_chi=reqBody.dia_chi
            reader.ngay_lap_the=reqBody.ngay_lap_the

            dataReturn.reader=reader
            await reader.save()
            
            account.ten_tai_khoan=reqBody.email
            dataReturn.account=account
            await account.save() 
        }
    }
    else{
        
            reader.ho_ten=reqBody.ho_ten
            reader.email=reqBody.email
            reader.gioi_tinh=reqBody.gioi_tinh
            reader.ngay_sinh=reqBody.ngay_sinh
            reader.dia_chi=reqBody.dia_chi
            reader.ngay_lap_the=reqBody.ngay_lap_the

            dataReturn.reader=reader
            await reader.save()
            
            account.ten_tai_khoan=reqBody.email
            dataReturn.account=account
            await account.save() 
        }
    return dataReturn 
}
async function handleDeleteReader(reqParam){
    const reader=await Reader.findById(reqParam)
    const account=await Account.findById(reader.id_account)
    await reader.remove()
    await account.remove()
    const card=await BorrowReturnCard.find({ma_doc_gia:reqParam})
    const lengthOfCard=card.length

    for(let i=0;i<lengthOfCard;i++){
        await card[i].remove()
    }
}

module.exports={
    searchReader,
    handleAddReader,
    editReader,
    handleEditReader,
    handleDeleteReader
}