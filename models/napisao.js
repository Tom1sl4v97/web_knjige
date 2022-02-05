const mongosse = require('mongoose')
const slugify = require('slugify')

const napisaoSchema = new mongosse.Schema({
    idKnjige: {
        type: String,
        requir: true,
    },
    idPisca: {
        type: String,
        requir: true,
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    }
})

napisaoSchema.pre('validate', function (next) {
    if (this.idKnjige && this.idPisca) {
        this.slug = slugify(this.idKnjige + this.idPisca, { lower: true, strict: true })
    }

    next()
})

module.exports = mongosse.model('Napisao', napisaoSchema)