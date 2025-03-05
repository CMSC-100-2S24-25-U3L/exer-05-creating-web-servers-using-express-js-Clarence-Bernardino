import express from "express";
import fs from "fs";

const app = express(); // make a server
const PORT = 3000;
const BOOKS_FILE = "books.txt";

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log("Works?");

// check if a file exists using fs.existsSync
const ensureFileExists = (file) => {
    console.log("Entered function");
    if (!fs.existsSync(file)) { // if file does not exist
        fs.writeFileSync(file, "", "utf-8");  // create it
        console.log("Created a file");
    }
}

app.get("/", (req, res) => {
    res.send("Welcome to the site!");
});

app.get("/books", (req, res) => {
    ensureFileExists(BOOKS_FILE);

    fs.readFile(BOOKS_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading books file"}); 
        }

        const books = data.split("\n").filter((line) => line.trim() !== "");
        res.json({ books });
    });
});

// post function to add new books
app.post("/add-book", (req, res) => {
    const { book_name, isbn, author, year_published } = req.body;

    if (!book_name || !isbn || !author || !year_published) {
        return res.status(400).json({ success: false, error: "All fields are required" });
    }

    ensureFileExists(BOOKS_FILE);

    // Read books and check for duplicate ISBN
    fs.readFile(BOOKS_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Error reading books file" });
        }

        const books = data.split("\n").filter((line) => line.trim() !== "");

        for (let book of books) {
            const fields = book.split(",");
            if (fields[1]?.trim() === isbn) {
                return res.json({ success: false, error: "ISBN already exists" });
            }
        }

        // Append new book
        const newBook = `${book_name},${isbn},${author},${year_published}\n`;
        fs.appendFile(BOOKS_FILE, newBook, (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: "Error adding book" });
            }
            res.json({ success: true });
        });
    });
});

// get book by ISBN and author
app.get("/find-by-isbn-author", (req, res) => {
    const { isbn, author } = req.query;

    if (!isbn || !author) {
        return res.status(400).json({ error: "ISBN and Author are required" });
    }

    ensureFileExists(BOOKS_FILE);

    fs.readFile(BOOKS_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading books file" });
        }

        const books = data.split("\n").filter((line) => line.trim() !== "");
        const matchedBooks = books.filter((line) => {
            const fields = line.split(",");
            return fields[1]?.trim() === isbn && fields[2]?.trim() === author;
        });

        res.json({ books: matchedBooks });
    });
});

// get book by author only
app.get("/find-by-author", (req, res) => {
    const { author } = req.query;

    if (!author) {
        return res.status(400).json({ error: "Author is required" });
    }

    ensureFileExists(BOOKS_FILE);

    fs.readFile(BOOKS_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading books file" });
        }

        const books = data.split("\n").filter((line) => line.trim() !== "");
        const matchedBooks = books.filter((line) => {
            const fields = line.split(",");
            return fields[2]?.trim() === author;
        });

        res.json({ books: matchedBooks });
    });
});


// start the server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});

// https://www.geeksforgeeks.org/node-js-fs-existssync-method/
// https://www.geeksforgeeks.org/express-js-res-json-function/
// https://www.w3schools.com/jsref/jsref_filter.asp