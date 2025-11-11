
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('productapp.db');

export function initDB() {
  db.transaction(tx => {
    // users
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );`
    );
    // products
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        image TEXT
      );`
    );
    // cart
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER,
        quantity INTEGER
      );`
    );
    // orders
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total REAL,
        createdAt TEXT
      );`
    );
  }, (e) => {
    console.log('DB error', e);
  }, () => {
    console.log('DB initialized');
  });
}

export function addUser(fullname, email, password, success, fail) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
      [fullname, email, password],
      (_, result) => success && success(result),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}

export function findUserByEmail(email, success, fail) {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (_, { rows }) => success && success(rows._array),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}

export function addProduct(product, success, fail) {
  const {name, description, price, image} = product;
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)',
      [name, description, price, image],
      (_, result) => success && success(result),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}
export function updateProduct(product, success, fail) {
  const {id, name, description, price, image} = product;
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE products SET name=?, description=?, price=?, image=? WHERE id=?',
      [name, description, price, image, id],
      (_, result) => success && success(result),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}
export function deleteProduct(id, success, fail) {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM products WHERE id=?',
      [id],
      (_, result) => success && success(result),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}
export function getProducts(success, fail) {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM products',
      [],
      (_, { rows }) => success && success(rows._array),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}

// Cart operations
export function addToCart(productId, quantity, success, fail) {
  db.transaction(tx => {
    // check existing
    tx.executeSql(
      'SELECT * FROM cart WHERE productId=?',
      [productId],
      (_, { rows }) => {
        if (rows._array.length > 0) {
          const existing = rows._array[0];
          tx.executeSql(
            'UPDATE cart SET quantity = ? WHERE id = ?',
            [existing.quantity + quantity, existing.id]
          );
        } else {
          tx.executeSql(
            'INSERT INTO cart (productId, quantity) VALUES (?, ?)',
            [productId, quantity]
          );
        }
      }
    );
  }, (e) => { fail && fail(e); }, () => success && success());
}

export function getCart(success, fail) {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT cart.id as id, cart.productId as productId, cart.quantity as quantity, products.* 
       FROM cart LEFT JOIN products ON cart.productId = products.id`,
      [],
      (_, { rows }) => success && success(rows._array),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}

export function updateCartItem(id, quantity, success, fail) {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE cart SET quantity=? WHERE id=?',
      [quantity, id],
      (_, result) => success && success(result),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}
export function removeCartItem(id, success, fail) {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM cart WHERE id=?',
      [id],
      (_, result) => success && success(result),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}
export function clearCart(success, fail) {
  db.transaction(tx => {
    tx.executeSql('DELETE FROM cart', [], (_, r) => success && success(r));
  });
}

export function createOrder(total, success, fail) {
  const now = new Date().toISOString();
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO orders (total, createdAt) VALUES (?, ?)',
      [total, now],
      (_, result) => success && success(result),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}
export function getOrders(success, fail) {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM orders',
      [],
      (_, { rows }) => success && success(rows._array),
      (_, err) => { fail && fail(err); return false; }
    );
  });
}
