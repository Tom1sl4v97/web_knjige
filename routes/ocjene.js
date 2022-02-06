const express = require('express')
const Korisnik = require('./../models/korisnik')
const Knjiga = require('./../models/knjiga')
const Ocjena = require('./../models/ocjena')
const router = express.Router()

router.get('/ocjeni/:id', async (req, res) => {
    const knjiga = await Knjiga.findById(req.params.id)

    let pristup
    if (req.session.uloga == 2) {
        pristup = true
    } else {
        pristup = false
    }

    res.render('ocjena/ocjena', { knjiga: knjiga, pristup: pristup })
})


router.post('/:id', async (req, res, next) => {
    req.idKnjiga = req.params.id
    next()
}, spremiOcjenu())

function spremiOcjenu() {
    return async (req, res) => {
        let pristup
        if (req.session.uloga == 2) {
            pristup = true
        } else {
            pristup = false
        }

        const idKnjiga = req.idKnjiga
        const logiraniKorisnik = req.session.username
        const korisnik = await Korisnik.findOne({ username: logiraniKorisnik })

        let ocjena = await Ocjena.findOne({ idKnjige: idKnjiga, idKorisnika: korisnik.id })

        if (!ocjena) {
            ocjena = new Ocjena()
        }

        ocjena.ocjena = req.body.ocjena
        ocjena.komentar = req.body.komentar
        ocjena.idKnjige = idKnjiga
        ocjena.idKorisnika = korisnik.id

        try {
            ocjena = await ocjena.save()

            const knjige = await Knjiga.find()
            res.render('homepage/homepage', { knjige: knjige, pristup: pristup })
        } catch (e) {
            console.log(e)
            const knjiga = await Knjiga.findById(idKnjiga)
            res.render('ocjena/ocjena', { knjiga: knjiga, pristup: pristup })
        }
    }
}

module.exports = router
