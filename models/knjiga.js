const mongosse = require('mongoose')
const slugify = require('slugify')

const knjigaSchema = new mongosse.Schema({
    naziv: {
        type: String,
        required: true,
    },
    godinaIzdanja: {
        type: String,
        required: true,
    },
    jezik: {
        type: String,
        required: true,
    },
    stranica: {
        type: Number,
        required: true,
    },
    publisher: {
        type: String,
        required: true,
    },
    dimenzije:{
        type: String
    },
    onlineIzdanje:{
        type: String,
        default: '',
    },
    kratikiSadrzaj:{
        type: String,
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    }
})

knjigaSchema.pre('validate', function (next) {
    if (this.naziv) {
        this.slug = slugify(this.naziv, { lower: true, strict: true })
    }

    next()
})

module.exports = mongosse.model('Knjiga', knjigaSchema)