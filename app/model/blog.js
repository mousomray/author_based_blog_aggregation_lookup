const mongoose = require('mongoose');
const CommentSchema = require('./comment');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'author',
        required: "Author Id is Required"
    },
    comments: [CommentSchema] // Import comment schema for to show comment
}, { timestamps: true });

const BlogModel = mongoose.model('blog', BlogSchema);

module.exports = BlogModel;