
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
    const currentUser = await req.user
    if(currentUser.vai_tro == "librarian"){
      return res.redirect('/librarian')
    }else if(currentUser.vai_tro == "reader"){
      return res.redirect('/reader')
    }
  }
  next()
}

async function decideUserPage(req, res, next){
  const currentUser = await req.user
  if(!currentUser){
    req.userPage = "index.ejs"
  }else{
    if(currentUser.vai_tro == "librarian"){
      req.userPage = "librarian/pages/index.ejs" 
    }else if(currentUser.vai_tro == "reader"){
      req.userPage = "reader/pages/index.ejs" 
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