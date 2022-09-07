const mysql=require('mysql');
const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, required: true },
    userImage:{ type: String, required: false}
});

module.exports = mongoose.model('User', userSchema);