const mongosse = require('mongoose')
const slugify = require('slugify')

const korisnikSchema = new mongosse.Schema({
    ime: {
        type: String,
    },
    prezime: {
        type: String,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    uloga: {
        type: Number,
        default: 1
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        require: true,
        unique: true,
    }
})

korisnikSchema.pre('validate', function (next) {
    if (this.username) {
        this.slug = slugify(this.username, { lower: true, strict: true })
    }

    next()
})

module.exports = mongosse.model('Korisnik', korisnikSchema)