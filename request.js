import needle from "needle";

const BASE_URL = "http://localhost:3000";

// test get request to retrieve all books
needle.get(`${BASE_URL}/books`, (err, res) => {
    if (err) return console.error("Error:", err);
    console.log("Books:", res.body);
});

// test post request to add a book in JSON format
const bookData1 = {
    book_name: "Harry Potter and the Philosopher’s Stone",
    isbn: "978-0-7475-3269-9",
    author: "J.K Rowling",
    year_published: "1997"
};

// post the first book
needle.post(`${BASE_URL}/add-book`, bookData1, { json: true }, (err, res) => {
    if (err) return console.error("Error:", err);
    console.log("Response:", res.body);
});

// testing function to get the book by isbn and author
needle.get(`${BASE_URL}/find-by-isbn-author?isbn=978-0-7475-3269-9&author=J.K+Rowling`, (err, res) => {
    if (err) return console.error("Error:", err);
    console.log("Search result:", res.body);
});

// testing function to get book by author alone
needle.get(`${BASE_URL}/find-by-author?author=J.K+Rowling`, (err, res) => {
    if (err) return console.error("Error:", err);
    console.log("Books by author:", res.body);
});

// const bookData2 = {
//     book_name: "Harry Potter and the Chaber of Secrets",
//     isbn: "0-7475-3849-2",
//     author: "J.K Rowling",
//     year_published: "1998"
// };
// const bookData3 = {
//     book_name: "The Little Price",
//     isbn: "978-0156012195",
//     author: "Antoine Saint-Exupery,1943",
//     year_published: "1943"
// };



