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
const notificationConfig = require('./config/notification-config.js')
const path = require('path')
const cors = require('cors')
global.appRoot = path.resolve(__dirname, "..");
// includes routes
const librarianRoute = require('./api/routes/librarian.js')
const librarianRoute=require('./api/routes/librarian')
const readerRoute = require('./api/routes/reader.js')
const userRoute = require('./api/routes/user.js')

const app = express()

var server = require('http').createServer(app);
const io = require('socket.io')(server)
const port = 3000

// setting
app.set('view engine', 'ejs')
app.set('views', __dirname+ '/api/views')
app.set('layout', 'layouts/layout')
app.set('socket-io', io);


// utilities
app.use('/css', express.static(path.join(appRoot, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(appRoot, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(appRoot, 'node_modules/jquery/dist')))

app.use(expressLayout)
app.use(express.urlencoded({ limit: '15mb', extended: false }))
app.use('/public', express.static(__dirname+ '/public'))
app.use(methodOverride('_method'))
app.use(express.json())

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
app.use(cors())

//routes
app.use('/librarian', librarianRoute)
app.use('/reader', readerRoute)
app.use('/', userRoute(passport))

// database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', error=> console.error(error))
db.once('open', ()=> console.log('connected to mongoose'))

// socket

notificationConfig.init(io)
// listen
server.listen(process.env.PORT || port)