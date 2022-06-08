
const LocalStrategy = require('passport-local').Strategy
const UserAccount = require('../api/models/user-account.js')

function init(passport){

  const authenticateUser = async function(email, password, done){

    let user = await getUserAccountByEmail(email)
    if(user == null){
      done(null, false, {message: 'Không tìm thấy người dùng'})
    }else{
      try{
        if(password == user.mat_khau){
          
          if(user.kich_hoat) return done(null, user)
          else return done(null, false, {message: 'Tài khoản chưa được kích hoạt'})
        }else{
          return done(null, false, {message: 'Mật khẩu không đúng'})
        }
      }catch(e){
        console.log(e)
        return done(e)
      }
    }
  }
  passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
  passport.serializeUser((user, done)=> done(null, user.id))
  passport.deserializeUser((id, done)=> done(null, getUserById(id)))
}

async function getUserAccountByEmail(email){
  try{
    const account = await UserAccount.find({ten_tai_khoan: email})
    return account[0]
  }catch{
    console.log("get user account by email error")
  }
}
async function getUserById(id){
  try{
    const user = await UserAccount.findById({_id: id})
    return user
  }catch(error){
    console.error(error)
  }
}

module.exports = {
  init
}