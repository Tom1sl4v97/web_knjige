const mongosse = require('mongoose')
const slugify = require('slugify')

const ocjenaSchema = new mongosse.Schema({
    ocjena: {
        type: Number,
        required: true,
    },
    komentar: {
        type: String,
    },
    idKnjige: {
        type: String,
        required: true,
    },
    idKorisnika: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    }
})

ocjenaSchema.pre('validate', function (next) {
    if (this.idKnjige && this.idKorisnika) {
        this.slug = slugify(this.idKnjige + this.idKorisnika, { lower: true, strict: true })
    }

    next()
})

module.exports = mongosse.model('Ocjena', ocjenaSchema)