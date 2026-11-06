const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/StudentDB")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.log("MongoDB Connection Error:", err));

// Create Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    age: Number,
    gender: String,
    address: String,
    password: String
});

// Create Model
const User = mongoose.model("User", userSchema);

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

// Handle Form Submission
app.post("/server", async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            age: req.body.age,
            gender: req.body.gender,
            address: req.body.address,
            password: req.body.password
        });

        // Save details in MongoDB
        await user.save();

        // Retrieve users from MongoDB
        const users = await User.find();

        // Display submitted details in table format
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Registration Details</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #eaf2f8;
                    padding: 20px;
                }

                h2 {
                    text-align: center;
                    color: #176b87;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                }

                th, td {
                    border: 1px solid #ccc;
                    padding: 12px;
                    text-align: left;
                }

                th {
                    background: #176b87;
                    color: white;
                }

                tr:nth-child(even) {
                    background: #eaf2f8;
                }

                a {
                    display: inline-block;
                    margin-top: 20px;
                    color: #176b87;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <h2>Registered User Details</h2>

            <table>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Address</th>
                </tr>`;

        users.forEach(user => {
            html += `
                <tr>
                    <td>${escapeHTML(user.name)}</td>
                    <td>${escapeHTML(user.email)}</td>
                    <td>${escapeHTML(user.mobile)}</td>
                    <td>${user.age}</td>
                    <td>${escapeHTML(user.gender)}</td>
                    <td>${escapeHTML(user.address)}</td>
                </tr>`;
        });

        html += `
            </table>
            <a href="/">← Back to Registration</a>
        </body>
        </html>`;

        res.send(html);

    } catch (error) {
        console.log(error);
        res.status(500).send("Error saving registration details.");
    }
});

// Escape user input before displaying it as HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

// Start Server
app.listen(6000, () => {
    console.log("Server running at http://localhost:6000");
});