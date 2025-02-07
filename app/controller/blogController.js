const BlogModel = require('../model/blog');
const mongoose = require('mongoose');

class BlogController {

    // Add Blog
    async addBlog(req, res) {
        try {
            // const authorId = req.author._id
            // console.log("Author id...", authorId);
            const blogdata = new BlogModel(req.body);
            const data = await blogdata.save();
            res.status(200).json({ succsss: true, message: "Blog posted successfully", data });
        } catch (error) {
            const statusCode = error.name === 'ValidationError' ? 400 : 500;
            const message = error.name === 'ValidationError'
                ? { message: "Validation error", errors: Object.values(error.errors).map(err => err.message) }
                : { message: "Error updating todo data" };

            console.error(error);
            res.status(statusCode).json(message);
        }
    }

    // Show Blog
    async blogList(req, res) {
        try {
            const blogs = await BlogModel.aggregate([{
                $lookup:
                {
                    from: "authors",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "authorDetails"
                }
            }])
            res.status(200).json({
                message: "Blog list fetched successfully",
                total: blogs.length,
                blogs
            });
        } catch (error) {
            console.log(error);
        }
    }

    // Get author wise blog
    async authorwiseBlog(req, res) {
        const authorId = req.params.authorId; // Extract authorId from the URL
        console.log("Author ID:", authorId);
        try {
            const blogs = await BlogModel.aggregate([
                {
                    $match: { authorId: new mongoose.Types.ObjectId(authorId) }
                },
                {
                    $lookup: {
                        from: "authors",
                        localField: "authorId",
                        foreignField: "_id",
                        as: "authorDetails",
                    },
                },
            ]);
            if (blogs.length > 0) {
                res.status(200).json({
                    message: "Blog list fetched successfully",
                    total: blogs.length,
                    blogs,
                });
            } else {
                res.status(404).json({ message: "No blogs found for this author" });
            }
        } catch (error) {
            console.error("Error fetching blogs by author:", error);
            res.status(500).json({ message: "Error retrieving blog data" });
        }
    }

    // Add comment for blog
    async addComment(req, res) {
        const id = req.params.id;
        try {
            const commentData = req.body
            console.log("Comment data", commentData)
            const blog = await BlogModel.findById(id);
            blog.comments.push(commentData);
            blog.save()
            res.status(201).json({
                success: true,
                message: "Comment added successfully",
                blog
            });
        } catch (error) {
            const statusCode = error.name === 'ValidationError' ? 400 : 500;
            const message = error.name === 'ValidationError'
                ? { message: "Validation error", errors: Object.values(error.errors).map(err => err.message) }
                : { message: "Error updating student data" };

            console.error(error);
            res.status(statusCode).json(message);
        }
    }

    // Show comment 
    async showComment(req, res) {
        const id = req.params.id;
        try {
            const blog = await BlogModel.findById(id)
            res.status(200).json({ sucess: true, message: "Comment fetching successfully", blog })
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching comment", error });
        }
    }

}
module.exports = new BlogController()






