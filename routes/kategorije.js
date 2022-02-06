const express = require('express')
const Kategorija = require('./../models/kategorija')
const Knjiga = require('./../models/knjiga')
const router = express.Router()


router.get('/prikazi', async (req, res) => {
    if (req.session.uloga == 2) {
        const kategorije = await Kategorija.find()
        res.render('kategorija/kategorija', { kategorije: kategorije })
    } else {
        const knjige = await Knjiga.find()
        res.render('homepage/homepage', { knjige: knjige })
    }
})

router.get('/dodajnovu', (req, res) => {
    res.render('kategorija/novaKategorija', { kategorija: new Kategorija(), error: '' })
})

router.get('/edit/:id', async (req, res) => {
    const kategorija = await Kategorija.findById(req.params.id)
    res.render('kategorija/edit', { kategorija: kategorija, error: '' })
})

router.post('/', async (req, res, next) => {
    req.kategorija = new Kategorija()
    next()
}, spremiKategoriju())

router.put('/:id', async (req, res, next) => {
    req.kategorija = await Kategorija.findById(req.params.id)
    next()
}, spremiKategoriju())

function spremiKategoriju() {
    return async (req, res) => {
        let kategorija = req.kategorija

        kategorija.naziv = req.body.naziv

        try {
            kategorija = await kategorija.save()
            const kategorije = await Kategorija.find()
            res.render('kategorija/kategorija', { kategorije: kategorije })
        } catch (e) {
            res.render('kategorija/novaKategorija', { kategorija: kategorija, error: ' - kategorija već postoji' })
        }
    }
}

router.delete('/:id', async (req, res) => {
    await Kategorija.findByIdAndDelete(req.params.id)
    const kategorije = await Kategorija.find()
    res.render('kategorija/kategorija', { kategorije: kategorije })
})



module.exports = router
