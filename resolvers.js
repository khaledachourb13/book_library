const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const bookProtoPath = 'book.proto';
const storyProtoPath = 'story.proto';
const bookProtoDefinition = protoLoader.loadSync(bookProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const storyProtoDefinition = protoLoader.loadSync(storyProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookProto = grpc.loadPackageDefinition(bookProtoDefinition).book;
const storyProto = grpc.loadPackageDefinition(storyProtoDefinition).story;
const clientBooks = new bookProto.BookService('localhost:50051', grpc.credentials.createInsecure());
const clientStorys = new storyProto.StoryService('localhost:50056', grpc.credentials.createInsecure());


const db = new sqlite3.Database('./database.db');

db.run(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS storys (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);


const resolvers = {
  Query: {
    story: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM storys WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    storys: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM storys', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    books: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM books', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    book: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
},
Mutation: {
    addStory: (_, { id,title, description }) => {
      return new Promise((resolve, reject) => {
        db.run('INSERT INTO storys (id,title, description) VALUES (?, ?, ?)', [id,title, description], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, title, description });
          }
        });
      });
    },
    addBook: (_, { id,title, description }) => {
      return new Promise((resolve, reject) => {
        db.run('INSERT INTO books (id,title, description) VALUES (?, ?, ?)', [id,title, description], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, title, description });
          }
        });
      });
    }
  },
};
module.exports = resolvers;
