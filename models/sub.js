const mongoose = require('mongoose')

const subSchema = new mongoose.Schema({
    quality: {
        type: Number,
        required: true
    },
    date:{
        type: Date,
        required:true,
        default:Date.now

    }
})

module.exports = mongoose.model('subs', subSchema)