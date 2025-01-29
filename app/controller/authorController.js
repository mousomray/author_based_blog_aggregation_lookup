const AuthorModel = require('../model/author') // Our user Model
const { comparePassword } = require('../middleware/auth') // Came from middleware folder
const jwt = require('jsonwebtoken'); // For to add token in header
const bcrypt = require('bcryptjs'); // For hashing password

class AuthorController {

    // Handle Register
    async register(req, res) {
        try {
            const existingAuthor = await AuthorModel.findOne({ email: req.body.email });
            if (existingAuthor) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Author already exists with this email"]
                });
            }
            if (!req.body.password) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Password is required"]
                });
            }
            if (req.body.password.length < 8) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Password should be at least 8 characters long"]
                });
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const author = new AuthorModel({
                ...req.body, password: hashedPassword
            });
            const savedAuthor = await author.save();
            res.status(201).json({
                success: true,
                message: "Registration successfully",
                author: savedAuthor
            })
        } catch (error) {
            const statusCode = error.name === 'ValidationError' ? 400 : 500;
            const message = error.name === 'ValidationError'
                ? { message: "Validation error", errors: Object.values(error.errors).map(err => err.message) }
                : { message: "An unexpected error occurred" };
            console.error(error);
            res.status(statusCode).json(message);
        }
    }

    // Handle Login
    async login(req, res) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({
                    message: "All fields are required"
                })
            }
            const author = await AuthorModel.findOne({ email })
            if (!author) {
                return res.status(400).json({
                    message: "Author not found"
                })
            }
            const isMatch = comparePassword(password, author.password)
            if (!isMatch) {
                return res.status(400).json({
                    message: "Invalid credentials"
                })
            }
            const token = jwt.sign({
                _id: author._id,
                name: author.name,
                email: author.email,
            }, process.env.API_KEY,
                { expiresIn: "1d" })
            res.status(200).json({
                success: true,
                message: "Author login successfully",
                data: {
                    _id: author._id,
                    name: author.name,
                    email: author.email,
                },
                token: token
            })
        } catch (error) {
            console.log(error);

        }

    }

    // Fetching Dashboard Data 
    async dashboard(req, res) {
        try {
            const author = req.author;
            if (!author) {
                return res.status(401).json({ message: "Unauthorized access. No author information found." });
            }
            console.log("Author Data:", author);
            res.status(200).json({
                message: "Welcome to the author dashboard",
                author: author
            });
        } catch (error) {
            console.error("Server Error:", error.message);
            res.status(500).json({ message: "Server error" });
        }
    };
}
module.exports = new AuthorController()