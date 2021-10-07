if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
// includes packages
const express = require('express')
const expressLayout = require('express-ejs-layouts')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
// includes routes
const indexRoute = require('./routes/index.js')

const app = express()
const port = 3000

// setting
app.set('view engine', 'ejs')
app.set('views', __dirname+ '/views')
app.set('layout', 'layouts/layout')

// utilities
app.use(expressLayout)
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use('/public', express.static(__dirname+ '/public'))
app.use(methodOverride('_method'))

// routes
app.use('/', indexRoute)

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
