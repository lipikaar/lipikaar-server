const mongoose = require('mongoose');

const compositionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, require: true },
    content: { type: String, require: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    compositionImage:{ type: String, required: false}
});

module.exports = mongoose.model('Composition', compositionSchema);