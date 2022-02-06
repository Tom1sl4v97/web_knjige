const express = require('express')
const Korisnik = require('./../models/korisnik')
const Knjiga = require('./../models/knjiga')
const router = express.Router()

router.get('/registracija', (req, res) => {
    res.render('registration/registration', { korisnik: new Korisnik() })
})

router.get('/odjava', (req, res) => {
    req.session.username = null
    req.session.uloga = null

    res.render('login/login', { error: '' })
})

router.post('/', async (req, res, next) => {
    let korisnik = new Korisnik({
        ime: req.body.ime,
        prezime: req.body.prezime,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    })

    try {
        korisnik = await korisnik.save()

        const knjige = await Knjiga.find()
        req.session.username = req.body.username
        req.session.uloga = 1

        res.render('homepage/homepage', { knjige: knjige, pristup: false })
    } catch (e) {
        console.log(e)
        res.render('registration/registration', { korisnik: korisnik })
    }
})

router.post('/login', async (req, res) => {
    let korisničkoIme = req.body.username
    const korisnik = await Korisnik.findOne({ username: korisničkoIme })
    if (!korisnik) {
        res.render('login/login', { error: `Ne postoji username: ${korisničkoIme}` })
    } else {
        if (korisnik.password != req.body.lozinka) {
            res.render('login/login', { error: 'Netočna lozinka' })
        } else {
            const knjige = await Knjiga.find()
            req.session.username = korisničkoIme
            req.session.uloga = korisnik.uloga

            let pristup
            if (korisnik.uloga == 2) {
                pristup = true
            } else {
                pristup = false
            }

            res.render('homepage/homepage', { knjige: knjige, pristup: pristup })
        }
    }

})

module.exports = router
