const mongosse = require('mongoose')
const slugify = require('slugify')

const posjedujeSchema = new mongosse.Schema({
    idKnjige: {
        type: String,
        requir: true,
    },
    idKategorije: {
        type: String,
        requir: true,
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    }
})

posjedujeSchema.pre('validate', function (next) {
    if (this.idKnjige && this.idKategorije) {
        this.slug = slugify(this.idKnjige + this.idKategorije, { lower: true, strict: true })
    }

    next()
})

module.exports = mongosse.model('Posjeduje', posjedujeSchema)