process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async () => {
  let result = await db.query(`
        INSERT INTO
        books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
            '123432122',
            'https://amazon.com',
            'Elie',
            'English',
            100,
            'Unknown Publishers',
            'Our first book', 2008)
            RETURNING isbn
    `);
  book_isbn = result.rows[0].isbn;
});

describe("POST /books", async function () {
  test("Creates a new book", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "1324234",
      amazon_url: "https://amazon.com",
      author: "mctest",
      language: "English",
      pages: 1000,
      publisher: "unknown",
      title: "amazing times",
      year: 2000,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toHaveProperty("isbn");
  });
});

describe("PUT /books/:id", async function () {
  test("Updates a single book", async function () {
    const response = await request(app).put(`/books/${book_isbn}`).send({
      isbn: "1324234",
      amazon_url: "https://amazon.com",
      author: "mctest",
      language: "English",
      pages: 1000,
      publisher: "unknown",
      title: "amazing times",
      year: 2000,
    });
    expect(response.body.book).toHaveProperty("isbn");
    expect(response.body.book.title).toBe("UPDATED BOOK");
  });
});

afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
  await db.end();
});
