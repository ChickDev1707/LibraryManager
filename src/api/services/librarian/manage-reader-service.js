const Reader=require('../../models/reader')
const Account=require('../../models/user-account')
const BorrowReturnCard=require('../../models/borrow-return-card')
const Policy=require('../../models/policy')
const fs=require('fs')
const path=require('path')
const excelToJson = require('convert-excel-to-json');
const urlHelper=require('../../helpers/url')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

async function searchReader(Query){
    const search={}
    if(Query!=null || Query!=""){
      search.ho_ten=new RegExp(Query,"i")
    }
    const reader=await Reader.find(search)

    const arr=[]
    const lengthOfReader=reader.length
    for(let i=0;i<lengthOfReader;i++){
        let r=await Reader.findOne({email:reader[i].email})
        arr.push({...r._doc,anh_bia:r.anh_bia})
    }
    
    return arr
}

async function handleAddFileExcel(reqFile){


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
        const minAge=await checkminage(today,nam_sinh)
        const maxAge=await checkmaxage(today,nam_sinh)

        try{
            const validAccount=await Account.find({ten_tai_khoan:result.Reader[i].email})
            //check ràng buộc
            if(validAccount.length!=0){
                continue;
            }
            if(minAge==false||maxAge==false){
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
            const defaultImgPath = path.join(__dirname.split('\\').slice(0, -3).join('\\'),'/public/assets/images/user.png')
            defaultImg = JSON.stringify(base64_encode(defaultImgPath));
    

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
                try{
                    const avatar = JSON.parse(defaultImg)
                    if (avatar != null && imageMimeTypes.includes(avatar.type)) {
                        reader.bf_anh_bia = new Buffer.from(avatar.data, 'base64')
                        reader.kieu_anh_bia = avatar.type
                    }
                  
                }catch(e){
                    console.log(e)
                }
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
    const minAge=await checkminage(today,nam_sinh)
    const maxAge=await checkmaxage(today,nam_sinh)

    const data={
        reader:"",
        addAccount:"",
        errorMessage:""
    }

    if(minAge==false){    
        data.errorMessage="Không đủ tuổi đăng ký"
    }
    else if(maxAge==false){
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
        const defaultImgPath = path.join(__dirname.split('\\').slice(0, -3).join('\\'),'/public/assets/images/default-reader-avatar.png')
        defaultImg = JSON.stringify(base64_encode(defaultImgPath));

        data.reader=new Reader({
            ho_ten:reqBody.ho_ten,
            email:reqBody.email,
            gioi_tinh:reqBody.gioi_tinh,
            ngay_sinh:reqBody.ngay_sinh,
            dia_chi:reqBody.dia_chi,
            ngay_lap_the:reqBody.ngay_lap_the,
            bf_anh_bia: defaultImg.Data,
            id_account:data.addAccount.id,

        })
        try{
            const avatar = JSON.parse(defaultImg)
            if (avatar != null && imageMimeTypes.includes(avatar.type)) {
                data.reader.bf_anh_bia = new Buffer.from(avatar.data, 'base64')
                data.reader.kieu_anh_bia = avatar.type
            }
            
        }catch(e){
            console.log(e)
        }
    }
    return data
}

async function editReader(reqParam){
    const reader= await Reader.findById(reqParam.id)

    const r=await Reader.findOne({email:reader.email})


  return {...r._doc,anh_bia:r.anh_bia}
}
async function handleEditReader(reqParam,reqBody){
    const nam_sinh=new Date(reqBody.ngay_sinh)
    const today=new Date()

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
    const minAge=await checkminage(today,nam_sinh)
    const maxAge=await checkmaxage(today,nam_sinh)
    if(minAge==false){
        dataReturn.error="Không đủ độ tuổi"
        const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
            type:'error',
            message:dataReturn.error
        })
        return redirectUrl
    }
    else if(maxAge==false){
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
            if (reqBody.anh_bia != null || reqBody.anh_bia !=''){
                try{
                    const avatar = JSON.parse(reqBody.anh_bia)
                    if (avatar != null && imageMimeTypes.includes(avatar.type)) {
                        reader.bf_anh_bia = new Buffer.from(avatar.data, 'base64')
                        reader.kieu_anh_bia = avatar.type
                    }
                }catch(e){
                    // console.log(e)
                }

            } 
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
        if (reqBody.anh_bia != null){
            const avatar = JSON.parse(reqBody.anh_bia)
            if (avatar != null && imageMimeTypes.includes(avatar.type)) {
                reader.bf_anh_bia = new Buffer.from(avatar.data, 'base64')
                reader.kieu_anh_bia = avatar.type
            }
        } 

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
async function checkminage(today,namsinh){
    console.log('today')
    console.log(today.getDate(),today.getMonth(),today.getFullYear())
    const minAge=await Policy.find({ten_quy_dinh:'tuoi_toi_thieu'})
    const year=today.getFullYear()-namsinh.getFullYear()
    const month=today.getMonth()-namsinh.getMonth()
    const day=today.getDate()-namsinh.getDate()
    if(year<minAge[0].gia_tri){
        return false
    }
    else if (year==minAge[0].gia_tri){
        if(month<0){
            return false
        }
        else if(month==0){
            if(day<0){
                return false
            }
            else{
                return true
            }
        }
        else{
            return true
        }
    }else{
        return true
    }
}
async function checkmaxage(today,namsinh){
    const maxAge=await Policy.find({ten_quy_dinh:'tuoi_toi_da'})
    const year=today.getFullYear()-namsinh.getFullYear()
    const month=today.getMonth()-namsinh.getMonth()
    const day=today.getDate()-namsinh.getDate()
    if(year>maxAge[0].gia_tri){
        return false
    }
    else if (year==maxAge[0].gia_tri){
        if(month<0){
            return true
        }
        else if(month==0){
            if(day>0){
                return false
            }
            else{
                return true
            }
        }
        else{
            return false
        }
    }else{
        return true
    }
}
function base64_encode(file) {
    var file_buffer   = fs.readFileSync(file); 
    var type = 'image/' +  file.split('.').pop()
    return {data: file_buffer.toString('base64'), type: type}
}
module.exports={
    searchReader,
    handleAddFileExcel,
    handleAddReader,
    editReader,
    handleEditReader,
    handleDeleteReader
}