const express = require('express')
const Pisac = require('./../models/pisac')
const Knjiga = require('./../models/knjiga')
const Napisao = require('./../models/napisao')
const router = express.Router()

router.get('/dodajNovog/:id', async (req, res) => {
    const knjiga = await Knjiga.findById(req.params.id)
    res.render('pisac/noviPisac', { pisac: new Pisac(), knjiga: knjiga, error: '' })
})

router.post('/:id', async (req, res, next) => {
    req.knjiga = await Knjiga.findById(req.params.id)
    req.pisac = new Pisac()
    next()
}, spremiPisca())

function spremiPisca() {
    return async (req, res) => {
        let knjiga = req.knjiga
        let pisac = req.pisac

        pisac.ime = req.body.ime
        pisac.prezime = req.body.prezime
        const datum = (req.body.datumRodenja).split('T')
        pisac.datumRodenja = datum[0]
        pisac.mjestoRodenja = req.body.mjestoRodenja
        pisac.miniBio = req.body.miniBio

        try {
            pisac = await pisac.save()

            const idPisca = await Pisac.findOne({ime: req.body.ime, prezime: req.body.prezime})

            let napisao = new Napisao()

            napisao.idKnjige = knjiga.id
            napisao.idPisca = idPisca.id

            napisao = await napisao.save()

            const knjige = await Knjiga.find()
            res.render('knjiga/knjiga', { knjige: knjige })
        } catch (e) {
            console.log(e)
            res.render(`pisac/noviPisac`, { pisac: pisac, knjiga: knjiga, error: ' - pisac već postoji' })
        }
    }
}

router.delete('/:id', async (req, res) => {
    await Pisac.findByIdAndDelete(req.params.id)
    let napisao = await Napisao.find({ idPisca: req.params.id })

    for (let i = 0; i < napisao.length; i++) {
        await Napisao.findByIdAndDelete(napisao[i].id)
    }

    const knjige = await Knjiga.find()
    res.render('knjiga/knjiga', { knjige: knjige })
})

module.exports = router
