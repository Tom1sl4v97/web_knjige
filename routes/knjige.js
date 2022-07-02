const express = require('express')
const Knjiga = require('./../models/knjiga')
const Korisnik = require('./../models/korisnik')
const Kategorija = require('./../models/kategorija')
const Posjeduje = require('./../models/posjeduje')
const Pisac = require('./../models/pisac')
const Napisao = require('./../models/napisao')
const Ocjena = require('./../models/ocjena')
const posjeduje = require('./../models/posjeduje')
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

        let brojKategorijaKnjiga = req.body.kategorija

        if (typeof brojKategorijaKnjiga === 'string') {
            brojKategorijaKnjiga = [req.body.kategorija]
        }

        try {
            knjiga = await knjiga.save()
            knjiga = await Knjiga.findOne({ naziv: nazivKnjige })
            let posjeduje = await Posjeduje.find({ idKnjige: knjiga.id })

            for (let i = 0; i < posjeduje.length; i++) {
                await Posjeduje.findByIdAndDelete(posjeduje[i].id)
            }

            for (let i = 0; i < brojKategorijaKnjiga.length; i++) {
                posjeduje = new Posjeduje()
                posjeduje.idKnjige = knjiga.id
                posjeduje.idKategorije = brojKategorijaKnjiga[i]

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

router.get('/preporuke', async (req, res) => {
    if (req.session.username) {
        preporucaneKnjige = await algoritamPreporuke(req)
        res.render('homepage/osobnePreporuke', { preporucaneKnjige: Array.from(preporucaneKnjige) })
    } else {
        res.render('login/login', { error: '' })
    }
})

async function algoritamPreporuke(req) {
    /*  Prvo je potrebno pronaći korisnika, preko korisničkog imena od sesije, zatim se
        pronalaze svi komentari korinika. */
    const logiraniKorisnik = req.session.username
    const korisnik = await Korisnik.findOne({ username: logiraniKorisnik })
    const popisOcjenaKorisnika = await Ocjena.find({ idKorisnika: korisnik.id })

    /*  Kreira se nova lista koja sadrži id kateogrije i dodijeljenu ocjenu kategorije,
        gdje može doći do duplih zapisa kategorije, koje će se kasnije filtrirati i
        zbrojiti ocjene */
    var listaOcjeneKategorija = []
    for (var i in popisOcjenaKorisnika) {
        var kategorijeKnjige = await Posjeduje.find({ idKnjige: popisOcjenaKorisnika[i].idKnjige })
        for (j in kategorijeKnjige) {
            var elementKnjige = {}
            elementKnjige.idKategorije = kategorijeKnjige[j].idKategorije
            elementKnjige.ocjena = popisOcjenaKorisnika[i].ocjena
            listaOcjeneKategorija.push(elementKnjige)
        }
    }

    /*  Prvo dohvaćam popis svih kategorija, gdje svakoj kategoriji dodajem i zbrajam,
        iz prethodne liste, ocjene i računam faktor maksimalne ocjene za svaku ocjenjenu
        kategoriju. */
    const popisKategorija = await Kategorija.find()
    var popisKategorijeOcjena = []
    for (var i in popisKategorija) {
        idTrenutneKategorije = popisKategorija[i].id

        var ocjeneKaterogije = listaOcjeneKategorija.filter(i => i.idKategorije == idTrenutneKategorije).length
        var ukupnaOcjena = listaOcjeneKategorija.filter(i => i.idKategorije == idTrenutneKategorije).reduce((a, b) => a + b.ocjena, 0)
        var konacnaOcjena = ((ukupnaOcjena / 10).toFixed(2) * ukupnaOcjena).toFixed(2)

        var noviElement = popisKategorija[i].toObject()
        noviElement.idKategorije = idTrenutneKategorije
        noviElement.konacnaOcjena = konacnaOcjena
        noviElement.maksimalnaOcjena = ocjeneKaterogije * 10 * ocjeneKaterogije
        popisKategorijeOcjena.push(noviElement)
    }

    /*  Tražimo sve nekomentirane / ne ocijenjene knjige od korisnika, koji zadovoljavaju
        prethodno ocjenjene kategorije ostalih knjiga, koje je korisnik već ocijenio. */
    var popisKnjigaPreporuke = []
    const popisSvihKnjiga = await Knjiga.find()
    for (var i in popisSvihKnjiga) {
        var idKnjige = popisSvihKnjiga[i].id
        var ocjenioKnjigu = popisOcjenaKorisnika.filter(i => i.idKnjige == idKnjige)
        /* Gledaju se samo ne ocjenjene knjige. */
        if (ocjenioKnjigu.length === 0) {
            var kategorijeKnjige = await Posjeduje.find({ idKnjige: popisSvihKnjiga[i].id })
            var faktorOcjeneKnjige = 0
            var maksimalniFaktorOcjene = 0
            /* Zbrajanje svih kateogije u jednu kategoriju sa ukupnim faktorom ocjene. */
            for (var j in kategorijeKnjige) {
                var kategorijaKnjige = popisKategorijeOcjena.find(i => i.idKategorije == kategorijeKnjige[j].idKategorije)
                faktorOcjeneKnjige += parseFloat(kategorijaKnjige.konacnaOcjena)
                maksimalniFaktorOcjene += parseFloat(kategorijaKnjige.maksimalnaOcjena)
            }
            /* Provjeravamo ako je korisnik ocijenio određenu kateogirju. Ako je faktor ocjene nula, 
                to znači da korisnik nije ocjenio određenu kateoriju knjige, ako je veća od nule,
                onda se dodaje u listu preporuke. */
            if (parseFloat(faktorOcjeneKnjige) > 0) {
                var elementKnjige = popisSvihKnjiga[i].toObject()
                elementKnjige.konacnaOcjena = faktorOcjeneKnjige
                elementKnjige.maksimalnaOcjena = maksimalniFaktorOcjene
                elementKnjige.postotak = (faktorOcjeneKnjige / maksimalniFaktorOcjene * 100).toFixed(2)
                popisKnjigaPreporuke.push(elementKnjige)
            }
        }

    }
    popisKnjigaPreporuke.sort(sortiranjeListe)

    for (var i in popisKnjigaPreporuke) {
        var popisKategorijaPreporuke = await Posjeduje.find({ idKnjige: popisKnjigaPreporuke[i]._id })
        var stringKategorije = ""
        for (var j in popisKategorijaPreporuke) {
            var podaciKateogirje = await Kategorija.findById(popisKategorijaPreporuke[j].idKategorije)
            if (j == (popisKategorijaPreporuke.length - 1)){
                stringKategorije += podaciKateogirje.naziv
            } else {
                stringKategorije += podaciKateogirje.naziv + ", "
            }
        }
        popisKnjigaPreporuke[i].nazivKategorije = stringKategorije
    }

    return popisKnjigaPreporuke
}

function sortiranjeListe(a, b) {
    if (a.postotak > b.postotak) {
        return -1
    }
    if (a.postotak < b.postotak) {
        return 1;
    }
    return 0;
}

module.exports = router
