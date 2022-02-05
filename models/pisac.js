const mongosse = require('mongoose')
const slugify = require('slugify')

const pisacSchema = new mongosse.Schema({
    ime: {
        type: String,
        required: true,
    },
    prezime: {
        type: String,
        required: true,
    },
    datumRodenja: {
        type: Date,
        required: true,
    },
    mjestoRodenja: {
        type: String,
        required: true,
    },
    miniBio: {
        type: String,
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    }
})

pisacSchema.pre('validate', function (next) {
    if (this.ime && this.prezime) {
        this.slug = slugify(this.ime + this.prezime, { lower: true, strict: true })
    }

    next()
})

module.exports = mongosse.model('Pisac', pisacSchema)