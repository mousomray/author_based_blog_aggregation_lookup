const express = require('express')
const BlogController = require('../controller/blogController')
// const { Auth } = require('../middleware/auth')
const router = express.Router()

router.post('/postblog', BlogController.addBlog) // Add blog
router.get('/blog', BlogController.blogList) // Blog List
router.get('/blog/:authorId', BlogController.authorwiseBlog) // Authorwise blog

module.exports = router