const express = require('express')
const Knjiga = require('./../models/knjiga')
const Kategorija = require('./../models/kategorija')
const Posjeduje = require('./../models/posjeduje')
const Pisac = require('./../models/pisac')
const Napisao = require('./../models/napisao')
const Ocjena = require('./../models/ocjena')
const router = express.Router()

router.get('/prikazi', async (req, res) => {
    const knjige = await Knjiga.find()
    if (req.session.uloga == 2) {
        res.render('knjiga/knjiga', { knjige: knjige })
    } else {
        res.render('homepage/homepage', { knjige: knjige })
    }
})

router.get('/dodajnovu', async (req, res) => {
    const kategorije = await Kategorija.find()
    res.render('knjiga/novaKnjiga', { knjiga: new Knjiga(), kategorije: kategorije, error: '' })
})

router.get('/detalji/:id', async (req, res) => {
    const idKnjige = req.params.id
    const knjiga = await Knjiga.findById(idKnjige)
    const posjeduje = await Posjeduje.find({ idKnjige: idKnjige })
    const napisao = await Napisao.find({ idKnjige: idKnjige })

    let imenaPisaca = []
    for (let i = 0; i < napisao.length; i++) {
        let pisac = await Pisac.findById(napisao[i].idPisca)
        imenaPisaca.push(pisac)
    }

    let imenaKategorija = ''
    for (let i = 0; i < posjeduje.length; i++) {
        let kategorija = await Kategorija.findById(posjeduje[i].idKategorije)
        if (i != posjeduje.length - 1) {
            imenaKategorija += kategorija.naziv + ', '
        } else {
            imenaKategorija += kategorija.naziv
        }
    }
    res.render('knjiga/detalji', { knjiga: knjiga, imenaKategorija: imenaKategorija, pisci: imenaPisaca })
})

router.get('/edit/:id', async (req, res) => {
    const knjiga = await Knjiga.findById(req.params.id)
    const kategorije = await Kategorija.find()
    res.render('knjiga/edit', { knjiga: knjiga, kategorije: kategorije, error: '' })
})

router.post('/', async (req, res, next) => {
    req.knjiga = new Knjiga()
    next()
}, spremiKnjigu('novaKnjiga'))

router.put('/:id', async (req, res, next) => {
    req.knjiga = await Knjiga.findById(req.params.id)
    next()
}, spremiKnjigu('edit'))

function spremiKnjigu(path) {
    return async (req, res) => {
        let knjiga = req.knjiga

        const nazivKnjige = req.body.naziv

        knjiga.naziv = nazivKnjige
        const datum = (req.body.godinaIzdanja).split('T')
        knjiga.godinaIzdanja = datum[0]
        knjiga.jezik = req.body.jezik
        knjiga.stranica = req.body.stranica
        knjiga.publisher = req.body.publisher
        knjiga.dimenzije = req.body.dimenzije
        if (req.body.onlineIzdanje == 'on') {
            knjiga.onlineIzdanje = 'checked'
        } else {
            knjiga.onlineIzdanje = ''
        }
        knjiga.kratikiSadrzaj = req.body.kratikiSadrzaj

        let brojKnjiga = req.body.kategorija

        if (typeof brojKnjiga === 'string') {
            brojKnjiga = [req.body.kategorija]
        }

        try {
            knjiga = await knjiga.save()
            knjiga = await Knjiga.findOne({ naziv: nazivKnjige })
            let posjeduje = await Posjeduje.find({ idKnjige: knjiga.id })

            for (let i = 0; i < posjeduje.length; i++) {
                await Posjeduje.findByIdAndDelete(posjeduje[i].id)
            }

            for (let i = 0; i < brojKnjiga.length; i++) {
                posjeduje = new Posjeduje()
                posjeduje.idKnjige = knjiga.id
                posjeduje.idKategorije = brojKnjiga[i]

                posjeduje = await posjeduje.save()
            }

            const knjige = await Knjiga.find()
            res.render('knjiga/knjiga', { knjige: knjige })
        } catch (e) {
            const kategorije = await Kategorija.find()
            res.render(`knjiga/${path}`, { knjiga: knjiga, kategorije: kategorije, error: ' - knjiga već postoji' })
        }
    }
}

router.delete('/:id', async (req, res) => {
    const idKnjige = req.params.id
    await Knjiga.findByIdAndDelete(idKnjige)

    let posjeduje = await Posjeduje.find({ idKnjige: idKnjige })
    for (let i = 0; i < posjeduje.length; i++) {
        await Posjeduje.findByIdAndDelete(posjeduje[i].id)
    }

    let napisao = await Napisao.find({ idKnjige: idKnjige })
    for (let i = 0; i < napisao.length; i++) {
        await Pisac.findByIdAndDelete(napisao[i].idPisca)
        await Napisao.findByIdAndDelete(napisao[i].id)
    }

    let ocjena = await Ocjena.find({ idKnjige: idKnjige })
    for (let i = 0; i < ocjena.length; i++) {
        await Ocjena.findByIdAndDelete(ocjena[i].id)
    }

    const knjige = await Knjiga.find()
    res.render('knjiga/knjiga', { knjige: knjige })
})

module.exports = router
