
async function checkAuthenticatedAsLibrarian(req, res, next){
  if(req.isAuthenticated()){
    const currentUser = await req.user
    if(currentUser.vai_tro == "librarian"){
      return next()
    }
  }
  res.redirect('/')
  // to home page, home page will determine user route
}
async function checkAuthenticatedAsReader(req, res, next){
  if(req.isAuthenticated()){
    const currentUser = await req.user
    if(currentUser.vai_tro == "reader"){
      return next()
    }
  }
  res.redirect('/')
  // to home page, home page will determine user route
}
async function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    res.redirect('/')
  }
  next()
}

async function decideUserPage(req, res, next){
  const currentUser = await req.user
  if(!currentUser){
    req.userPage = "user/index.ejs"
  }else{
    if(currentUser.vai_tro == "librarian"){
      req.userPage = "librarian/index.ejs" 
    }else if(currentUser.vai_tro == "reader"){
      req.userPage = "reader/index.ejs" 
    }
  }
  next()
}

module.exports = {
  checkNotAuthenticated,
  checkAuthenticatedAsLibrarian,
  checkAuthenticatedAsReader,
  decideUserPage
}