if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
// includes packages
const express = require('express')
const expressLayout = require('express-ejs-layouts')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const passportConfig = require('./config/passport-config.js')
const path = require('path')
global.appRoot = path.resolve(__dirname, "..");
// includes routes
const indexRoute = require('./api/routes/index.js')
const librarianAuthRoute = require('./api/routes/librarian/auth.js')
const readerAuthRoute = require('./api/routes/reader/auth.js')
const loginRoute = require('./api/routes/shared/login.js')

const app = express()
const port = 3000

// setting
app.set('view engine', 'ejs')
app.set('views', __dirname+ '/api/views')
app.set('layout', 'layouts/layout')

// utilities
app.use('/css', express.static(path.join(appRoot, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(appRoot, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(appRoot, 'node_modules/jquery/dist')))

app.use(expressLayout)
app.use(express.urlencoded({extended: true}))
app.use('/public', express.static(__dirname+ '/public'))
app.use(methodOverride('_method'))

// authentication
passportConfig.init(passport)
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// routes
app.use('/', indexRoute)
app.use('/librarian', librarianAuthRoute)
app.use('/reader', readerAuthRoute)
app.use('/login', loginRoute(passport))

// database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', error=> console.error(error))
db.once('open', ()=> console.log('connected to mongoose'))

// listen
app.listen(process.env.PORT || port)
