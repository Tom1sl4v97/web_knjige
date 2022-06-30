const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const korisniciRouter = require('./routes/korisnici')
const kategorijeRouter = require('./routes/kategorije')
const knjigeRouter = require('./routes/knjige')
const pisciRouter = require('./routes/pisci')
const homepageRouter = require('./routes/homepage')
const ocjeneRouter = require('./routes/ocjene')

const methodOverride = require('method-override')
const app = express()

mongoose.connect('mongodb+srv://ttomiek:TomislavTBP@cluster0.fpgq8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', 
{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,    
}))

app.get('/', async (req, res) => {
    res.render('login/login', { error: ''})
})

app.use('/korisnici', korisniciRouter)
app.use('/kategorije', kategorijeRouter)
app.use('/knjige', knjigeRouter)
app.use('/pisci', pisciRouter)
app.use('/homepage', homepageRouter)
app.use('/ocjene', ocjeneRouter)


app.listen(5000)