const mongosse = require('mongoose')
const slugify = require('slugify')

const kategorijaSchema = new mongosse.Schema({
    naziv: {
        type: String,
        requir: true,
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    }
})

kategorijaSchema.pre('validate', function (next) {
    if (this.naziv) {
        this.slug = slugify(this.naziv, { lower: true, strict: true })
    }

    next()
})

module.exports = mongosse.model('Kategorija', kategorijaSchema)