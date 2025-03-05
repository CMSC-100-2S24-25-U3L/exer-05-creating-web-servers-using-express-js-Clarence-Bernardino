import express from "express";  // import express for express web servers
import fs from "fs";            // import fs for file handling functions

const app = express();          // make a server
const PORT = 3000;              // port that will be used
const BOOKS_FILE = "books.txt"; // store filename 

// parser
app.use(express.json());    // makes express understand JSON data
app.use(express.urlencoded({ extended: false }));   // parses data from url
console.log("Works?");      // checkpoint prin

// check if a file exists using fs.existsSync
const ensureFileExists = (file) => {
    console.log("Entered ensureFileExists");
    if (!fs.existsSync(file)) { // if file does not exist
        fs.writeFileSync(file, "", "utf-8");  // create it
        console.log("Created a file");
    }
}

// route handler for home page
app.get("/", (req, res) => {
    res.send("Welcome to the site!");
});

// handles GET requests
app.get("/books", (req, res) => {
    ensureFileExists(BOOKS_FILE);   // check if the books.txt file exists

    // read contents of readfile
    fs.readFile(BOOKS_FILE, "utf8", (err, data) => {
        if (err) {  // if reading produces an error, return error response 500 (like the 404 not found thing)
            return res.status(500).json({ error: "Error reading books file"}); 
        }

        console.log("Raw books.txt content:", data) 
        
        const books = data
            .split("\n")    // convert to array of lines
            .filter((line) => line.trim() !== "")   // removes while spaces
            .map((line) => {    // converts each line of text into an object with the attributes below
                const [book_name, isbn, author, year_published] = line.split(",");
                return { book_name, isbn, author, year_published };
            });
            // display
        console.log("Parsed books array:", books);
            // send the books data as a response when called
        res.json({ books });
    });
});

// post function to add new books
app.post("/add-book", (req, res) => {
    const { book_name, isbn, author, year_published } = req.body;

    if (!book_name || !isbn || !author || !year_published) {
        return res.status(400).json({ success: false, error: "All fields are required" });
    }

    ensureFileExists(BOOKS_FILE);   // check if file exists

    // read books and check for duplicate ISBN
    fs.readFile(BOOKS_FILE, "utf8", (err, data) => {
        if (err) {  // if reading produces an error, return error response 500 (interna server errr)
            return res.status(500).json({ success: false, error: "Error reading books file" });
        }

        // splits the file data into individual book entries and filters the books
        const books = data.split("\n").filter((line) => line.trim() !== "");

        // split each book entry and check if they have the same isbn
        for (let book of books) {
            const fields = book.split(","); // the ? is to protect the server 
            if (fields[1]?.trim() === isbn) { // form accessing null values
                return res.json({ success: false, error: "ISBN already exists" });
            }
        }

        // append new book
        const newBook = `${book_name},${isbn},${author},${year_published}\n`;
        fs.appendFile(BOOKS_FILE, newBook, (err) => {
            if (err) { // return internal server error status code (500) if there is an issue when appending
                return res.status(500).json({ success: false, error: "Error adding book" });
            }
            // make the response return true
            res.json({ success: true });
        });
    });
});

// get book by ISBN and author
app.get("/find-by-isbn-author", (req, res) => {
    const { isbn, author } = req.query; // extract isbn and author form request query

    if (!isbn || !author) { // if both values are not provided, return a https 400 (bad request)
        return res.status(400).json({ error: "ISBN and Author are required" });
    }

    ensureFileExists(BOOKS_FILE);   // check if file exists

    fs.readFile(BOOKS_FILE, "utf8", (err, data) => {
        if (err) {  // return status code 500 if may error sa read
            return res.status(500).json({ error: "Error reading books file" });
        }
        // split and trim the entries  
        const books = data.split("\n").filter((line) => line.trim() !== "");
        // filters the books that match both ISBN and author.
        const matchedBooks = books.filter((line) => {
            const fields = line.split(",");
            return fields[1]?.trim() === isbn && fields[2]?.trim() === author;
        });
        // returns the found books as a JSON response
        res.json({ books: matchedBooks });
    });
});

// get book by author only (same as the top function but only the author)
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


