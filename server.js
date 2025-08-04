const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
dotenv.config();
console.log("JWT_SECRET Loaded:", process.env.JWT_SECRET);


app.use(express.static(path.join(__dirname,)));

dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

const db = mysql.createConnection({
  host: 'localhost',       
  user: 'root',            
  password: 'password1', 
  database: 'tranzy_db',
  multipleStatements: true   
});


db.connect(err => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database');
});




// Tables
const createTables = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2)
);
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  quantity INT
);
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  discount INT
);`;

db.query(createTables, err => {
  if (err) console.log(err);
});

// 🔐 Token middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/home",(req,res)=>{
  res.sendFile(__dirname+"/index.html")
})

app.get("/cart",(req,res)=>{
  res.sendFile(__dirname+"/cart.html")
})

app.get("/cantact",(req,res)=>{
  res.sendFile(__dirname+"/contact.html")
})

app.get("/loginnn",(req,res)=>{
  res.sendFile(__dirname+"/login.html")
})
app.get("/register",(req,res)=>{
  res.sendFile(__dirname+"/register.html")
})

app.get("/shop",(req,res)=>{
  res.sendFile(__dirname+"/shop.html")
})

app.get("/sproduct",(req,res)=>{
  res.sendFile(__dirname+"/sproduct.html")
})

app.get("/sproduct2",(req,res)=>{
  res.sendFile(__dirname+"/sproduct2.html")
})

app.get("/sproduct3",(req,res)=>{
  res.sendFile(__dirname+"/sproduct3.html")
})

app.get("/sproduct4",(req,res)=>{
  res.sendFile(__dirname+"/sproduct4.html")
})

app.get("/about",(req,res)=>{
  res.sendFile(__dirname+"/about.html")
})

app.get("/blog",(req,res)=>{
  res.sendFile(__dirname+"/blog.html")
})


// 📝 Register
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed], err => {
    if (err) return res.status(400).json({ msg: 'User already exists' });
    res.json({ msg: 'Registered successfully' });
  });
});

// 🔐 Login
app.post('/login', (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ msg: 'Invalid credentials' });
    const user = results[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token });
  });
});

// 🛒 Add to Cart
app.post('/cart', auth, (req, res) => {
  const { product_id, quantity } = req.body;
  db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, quantity], err => {
    if (err) return res.status(500).json({ msg: 'Error adding to cart' });
    res.json({ msg: 'Product added to cart' });
  });
});

// 💳 Apply Coupon
app.post('/apply-coupon', auth, (req, res) => {
  const { code } = req.body;
  db.query('SELECT discount FROM coupons WHERE code = ?', [code], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ msg: 'Invalid coupon' });
    const discount = results[0].discount;
    res.json({ discount });
  });
});

// 💰 Checkout
app.post('/checkout', auth, (req, res) => {
  const { coupon_code } = req.body;
  db.query(`
    SELECT p.price, c.quantity
    FROM cart c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?`, [req.user.id], (err, results) => {
      if (err || results.length === 0) return res.status(400).json({ msg: 'Cart is empty' });
      let total = results.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (coupon_code) {
        db.query('SELECT discount FROM coupons WHERE code = ?', [coupon_code], (err, couponRes) => {
          if (couponRes.length > 0) {
            total = total - (total * couponRes[0].discount / 100);
          }
          res.json({ total: total.toFixed(2) });
        });
      } else {
        res.json({ total: total.toFixed(2) });
      }
  });
});

// 🛍️ Get Products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ msg: 'Error loading products' });
    res.json(results);
  });
});

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



