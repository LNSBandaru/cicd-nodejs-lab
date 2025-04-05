const request = require('supertest');
const app = require('../src/index'); // Assuming your main app file is index.js in the src directory

describe('Book Library API', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, () => {
      console.log(`Test server listening on port ${server.address().port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  // Test GET /books
  it('should get all books', async () => {
    const res = await request(server).get('/books');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });

  // Test GET /books/:id
  it('should get a specific book by ID', async () => {
    const res = await request(server).get('/books/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(1);
  });

  it('should return 404 if book not found', async () => {
    const res = await request(server).get('/books/999');
    expect(res.statusCode).toEqual(404);
  });

  // Test POST /books
  it('should create a new book', async () => {
    const newBook = { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams' };
    const res = await request(server)
      .post('/books')
      .send(newBook);
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual(newBook.title);
    expect(res.body.author).toEqual(newBook.author);
  });

  it('should return 400 if title or author is missing', async () => {
    const res = await request(server)
      .post('/books')
      .send({});
    expect(res.statusCode).toEqual(400);
  });

  // Test PUT /books/:id
  it('should update an existing book', async () => {
    const updatedBook = { title: 'The Lord of the Rings Updated', author: 'J.R.R. Tolkien' };
    const res = await request(server)
      .put('/books/1')
      .send(updatedBook);
    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual(updatedBook.title);
    expect(res.body.author).toEqual(updatedBook.author);
  });

  it('should return 404 if updating a non-existent book', async () => {
    const res = await request(server)
      .put('/books/999')
      .send({ title: 'Non-existent', author: 'Unknown' });
    expect(res.statusCode).toEqual(404);
  });

  // Test DELETE /books/:id
  it('should delete a book', async () => {
    const res = await request(server).delete('/books/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Book deleted');
  });

  it('should return 404 if deleting a non-existent book', async () => {
    const res = await request(server).delete('/books/999');
    expect(res.statusCode).toEqual(404);
  });
});
