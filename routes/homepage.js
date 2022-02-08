const express = require('express')
const Knjiga = require('./../models/knjiga')
const Kategorija = require('./../models/kategorija')
const Posjeduje = require('./../models/posjeduje')
const Pisac = require('./../models/pisac')
const Napisao = require('./../models/napisao')
const Ocjena = require('./../models/ocjena')
const Korisnik = require('./../models/korisnik')
const router = express.Router()

router.get('/prikazi', async (req, res) => {
    const knjige = await Knjiga.find()
    let pristup
    if (req.session.uloga == 2) {
        pristup = true
    } else {
        pristup = false
    }
    res.render('homepage/homepage', { knjige: knjige, pristup: pristup })
})

router.get('/detalji/:id', async (req, res) => {
    const idKnjige = req.params.id

    const ocjene = await Ocjena.find({ idKnjige: idKnjige })
    let usernameKomentara = new Array(ocjene.length)
    for (let i = 0; i < ocjene.length; i++) {
        let korisnik = await Korisnik.findById(ocjene[i].idKorisnika)
        usernameKomentara[i] = korisnik.username
    }

    const napisao = await Napisao.find({ idKnjige: idKnjige })
    let imenaPisaca = []
    for (let i = 0; i < napisao.length; i++) {
        let pisac = await Pisac.findById(napisao[i].idPisca)
        imenaPisaca.push(pisac)
    }

    const posjeduje = await Posjeduje.find({ idKnjige: idKnjige })
    let imenaKategorija = []
    for (let i = 0; i < posjeduje.length; i++) {
        let kategorija = await Kategorija.findById(posjeduje[i].idKategorije)
        imenaKategorija.push(kategorija.naziv)
    }

    let preporuke = []
    for (let i = 0; i < posjeduje.length; i++) {
        let preporukaPosjedovanja = await Posjeduje.find({ idKategorije: posjeduje[i].idKategorije })
        for (let j = 0; j < preporukaPosjedovanja.length; j++) {
            if (preporukaPosjedovanja[j].idKnjige != idKnjige) {
                let podaciOcjenama = await Ocjena.find({ idKnjige: preporukaPosjedovanja[j].idKnjige })
                let ukupnaOcjena = 0
                for (let z = 0; z < podaciOcjenama.length; z++) {
                    ukupnaOcjena += podaciOcjenama[z].ocjena
                }

                let postojiVec = true
                for (let k = 0; k < preporuke.length; k++) {
                    if (preporuke[k].id == preporukaPosjedovanja[j].idKnjige) {
                        postojiVec = false
                    }
                }
                if ((ukupnaOcjena / podaciOcjenama.length) >= 5) {
                    if (postojiVec) {
                        
                        let knjiga = await Knjiga.findById(preporukaPosjedovanja[j].idKnjige)
                        preporuke.push(knjiga)
                    }
                }
            }
        }
    }

    let pristup
    if (req.session.uloga == 2) {
        pristup = true
    } else {
        pristup = false
    }

    const knjiga = await Knjiga.findById(idKnjige)
    res.render('homepage/detalji', {
        knjiga: knjiga,
        imenaKategorija: imenaKategorija,
        pisci: imenaPisaca,
        ocjene: ocjene,
        username: usernameKomentara,
        preporuka: preporuke,
        pristup: pristup,
    })
})


module.exports = router
