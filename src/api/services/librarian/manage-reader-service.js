const Reader=require('../../models/reader')
const Account=require('../../models/user-account')
const BorrowReturnCard=require('../../models/borrow-return-card')
const Policy=require('../../models/policy')
const fs=require('fs')
const path=require('path')
const excelToJson = require('convert-excel-to-json');
const urlHelper=require('../../helpers/url')

async function searchReader(Query){
    const search={}
    if(Query!=null || Query!=""){
      search.ho_ten=new RegExp(Query,"i")
    }
    const reader=await Reader.find(search)
    return reader
}

async function handleAddFileExcel(reqFile){
    const minAge=await Policy.find({ten_quy_dinh:'tuoi_toi_thieu'})
    const maxAge=await Policy.find({ten_quy_dinh:'tuoi_toi_da'})

    const uploadPath = path.join('./src/public/uploads/addReader',reqFile.originalname+'')
    const result=excelToJson({
        sourceFile:uploadPath,
        header:{
            rows:1
        },
        columnToKey:{
            A:'stt',
            B:'ho_ten',
            C:'ngay_sinh',
            D:'dia_chi',
            E:'email',
            F:'gioi_tinh'
        }
    })
    let length=0
    try{
        length=result.Reader.length;
    }
    catch(e){
        return
    }
    for(let i=0;i<length;i++){
        const nam_sinh=new Date(result.Reader[i].ngay_sinh)
        const today=new Date()
        const checkAge=today.getFullYear()-nam_sinh.getFullYear()

        try{
            const validAccount=await Account.find({ten_tai_khoan:result.Reader[i].email})
            //check ràng buộc
            if(validAccount.length!=0){
                continue;
            }
            if(checkAge<minAge||checkAge>maxAge){
                continue;
            }
            //
            const account=new Account({
                ten_tai_khoan:result.Reader[i].email,
                vai_tro:"reader",
                mat_khau:"reader"
            })
            // break;
            await account.save()

            const today=new Date()
            const month=((today.getMonth()+1)<10)?('0'+(today.getMonth()+1)):(today.getMonth()+1)
            const day=(today.getDate()<10)?('0'+today.getDate()):(today.getDate())
            const ngay_lap_the=today.getFullYear()+'-'+month+'-'+day

            // console.log("ngay lap the",ngay_lap_the,"ngay sinh : ", result.Reader[i].ngay_sinh)

            try{
                const reader=new Reader({
                    ho_ten:result.Reader[i].ho_ten,
                    email:result.Reader[i].email,
                    gioi_tinh:result.Reader[i].gioi_tinh,
                    ngay_sinh:result.Reader[i].ngay_sinh,
                    dia_chi:result.Reader[i].dia_chi,
                    ngay_lap_the:ngay_lap_the,
                    id_account:account._id
                })
                await reader.save()
            }catch(e){
                console.log(e)
            }
        }catch{
            try{
                const account =await Account.find({ten_tai_khoan:result.Reader[i].email})
                await account.remove()
            }catch{

            }
        }
    } 
    fs.unlink(uploadPath,function(err){
        if(err) throw err
        // console.log('file delete!')
    })
}

async function handleAddReader(reqBody){
    const nam_sinh=new Date(reqBody.ngay_sinh)
    const today=new Date()
    const checkAge=today.getFullYear()-nam_sinh.getFullYear()

    const checkEmail=await Reader.find({"email":reqBody.email})
    const minAge=await Policy.find({ten_quy_dinh:'tuoi_toi_thieu'})
    const maxAge=await Policy.find({ten_quy_dinh:'tuoi_toi_da'})

    const data={
        reader:"",
        addAccount:"",
        errorMessage:""
    }

    if(checkAge<minAge[0].gia_tri){    
        data.errorMessage="Không đủ tuổi đăng ký"
    }
    else if(checkAge>maxAge[0].gia_tri){
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
        const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
            type:'error',
            message:dataReturn.error
        })
        return redirectUrl
    }
    else if(checkAge>55){
        dataReturn.error="Vượt quá tuổi đăng ký"
        const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
            type:'error',
            message:dataReturn.error
        })
        return redirectUrl
    }
    else if(checkEmail.toString()!='' ){
        if(checkEmail[0]._id != reqParam.id){
            dataReturn.error="Email đã đăng ký"
            const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
                type:'error',
                message:dataReturn.error
            })
            return redirectUrl
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
            const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
                type:'success',
                message:"Cập nhật thành công"
            })
            return redirectUrl
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
            const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
                type:'success',
                message:"Chỉnh sửa thành công"
            })
            return redirectUrl
        }
     
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
    handleAddFileExcel,
    handleAddReader,
    editReader,
    handleEditReader,
    handleDeleteReader
}