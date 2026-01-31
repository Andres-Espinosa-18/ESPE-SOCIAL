import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE LA CONEXIÓN A LA BASE DE DATOS
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Usuario por defecto de XAMPP/WAMP
  password: '',      // Contraseña por defecto (vacía) en XAMPP
  database: 'espe_social'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// --- RUTAS DE AUTENTICACIÓN ---

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      return res.json({ success: true, user: result[0] });
    } else {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});

// Registro
app.post('/api/register', (req, res) => {
  const { name, student_id, email, password } = req.body;
  const sql = 'INSERT INTO users (name, student_id, email, password) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [name, student_id, email, password], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.json({ success: true, message: 'Usuario registrado correctamente' });
  });
});

// --- RUTAS DE DATOS ---

// Obtener Noticias
app.get('/api/news', (req, res) => {
  const sql = 'SELECT * FROM news ORDER BY date DESC';
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en puerto ${PORT}`);
});