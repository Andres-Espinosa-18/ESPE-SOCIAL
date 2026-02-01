import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE LA CONEXIÓN A LA BASE DE DATOS
// Usamos createPool en lugar de createConnection para manejar mejor 
// las desconexiones y reintentos.
const db = mysql.createPool({
  host: 'localhost',
  user: 'admin',      
  password: 'admin',      
  database: 'espe_social',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Prueba de conexión inicial (Opcional, solo para loguear en consola)
db.getConnection((err, connection) => {
  if (err) {
    console.error('ERROR CRÍTICO: No se pudo conectar a la Base de Datos.');
    console.error('Código de error:', err.code);
    console.error('Mensaje:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('>>> VERIFICA TU USUARIO Y CONTRASEÑA EN server.js <<<');
    }
  } else {
    console.log('Conexión exitosa al pool de MySQL con usuario: admin');
    connection.release();
  }
});

// --- AUTENTICACIÓN ---

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  
  db.query(sql, [email, password], (err, result) => {
    if (err) {
        console.error('Error en Login:', err);
        return res.status(500).json({ 
            success: false, 
            message: `Error de Base de Datos: ${err.code || err.message}` 
        });
    }
    if (result.length > 0) {
      return res.json({ success: true, user: result[0] });
    } else {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }
  });
});

app.post('/api/register', (req, res) => {
  const { name, student_id, email, password } = req.body;
  const sql = 'INSERT INTO users (name, student_id, email, password) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [name, student_id, email, password], (err, result) => {
    if (err) {
        console.error('Error en Registro:', err);
        // Manejar duplicados
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'El correo o ID de estudiante ya existe.' });
        }
        return res.status(500).json({ 
            success: false, 
            message: `Error de Base de Datos: ${err.code}` 
        });
    }
    return res.json({ success: true, message: 'Usuario registrado correctamente' });
  });
});

// --- NOTICIAS ---
app.get('/api/news', (req, res) => {
  db.query('SELECT * FROM news ORDER BY date DESC', (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// --- AVISOS (ANNOUNCEMENTS) ---
app.get('/api/announcements', (req, res) => {
  const type = req.query.type;
  let sql = 'SELECT * FROM announcements';
  let params = [];
  if (type) {
    sql += ' WHERE type = ?';
    params.push(type);
  }
  sql += ' ORDER BY id DESC LIMIT 1'; // Traer el más reciente por tipo
  
  db.query(sql, params, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

app.post('/api/announcements', (req, res) => {
  const { type, title, date, content, user_id } = req.body;
  
  // Verificar Rol de Admin
  db.query('SELECT role FROM users WHERE id = ?', [user_id], (err, users) => {
    if (err) return res.status(500).json(err);
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Solo administradores pueden publicar avisos.' });
    }

    const sql = 'INSERT INTO announcements (type, title, date, content, created_by) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [type, title, date, content, user_id], (err, result) => {
        if (err) return res.status(500).json(err);
        
        // Crear notificación para todos los estudiantes (Simplificado)
        const notifTitle = `Nuevo Aviso ${type}: ${title}`;
        res.json({ success: true });
    });
  });
});

// --- FOROS ---
app.get('/api/forums', (req, res) => {
  const sql = `
    SELECT fp.*, u.role 
    FROM forum_posts fp 
    JOIN users u ON fp.user_id = u.id 
    ORDER BY fp.created_at DESC
  `;
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    
    const formatted = data.map(post => ({
        id: post.id.toString(),
        user_id: post.user_id,
        author: post.author_name,
        role: post.role,
        timeAgo: new Date(post.created_at).toLocaleDateString(), 
        avatar: `https://ui-avatars.com/api/?name=${post.author_name}&background=random`,
        content: post.content,
        image: post.image,
        commentsCount: 0, 
        likesCount: 0,    
        sharesCount: 0    
    }));
    res.json(formatted);
  });
});

app.post('/api/forums', (req, res) => {
  const { user_id, author_name, content, image } = req.body;
  const sql = 'INSERT INTO forum_posts (user_id, author_name, content, image) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, author_name, content, image], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// --- CLUBES ---
app.get('/api/clubs', (req, res) => {
  const user_id = req.query.user_id;
  const sql = `
    SELECT c.*, 
    CASE WHEN cm.user_id IS NOT NULL THEN 1 ELSE 0 END as is_joined
    FROM clubs c
    LEFT JOIN club_members cm ON c.id = cm.club_id AND cm.user_id = ?
  `;
  db.query(sql, [user_id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

app.post('/api/clubs/join', (req, res) => {
    const { user_id, club_id } = req.body;
    const sql = 'INSERT INTO club_members (user_id, club_id) VALUES (?, ?)';
    db.query(sql, [user_id, club_id], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.json({ success: true, message: 'Ya eres miembro' });
            return res.status(500).json(err);
        }
        res.json({ success: true });
    });
});

// --- NOTIFICACIONES ---
app.get('/api/notifications', (req, res) => {
    const user_id = req.query.user_id;
    if (!user_id) return res.json([]);

    const sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
    db.query(sql, [user_id], (err, data) => {
        if (err) return res.status(500).json(err);
        
        const formatted = data.map(n => ({
            ...n,
            color: n.type === 'AVISOS' ? 'bg-red-100 text-red-600' : 
                   n.type === 'EVENTOS' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
        }));
        res.json(formatted);
    });
});

app.post('/api/notifications', (req, res) => {
    const { user_id, type, title } = req.body;
    const sql = 'INSERT INTO notifications (user_id, type, title) VALUES (?, ?, ?)';
    db.query(sql, [user_id, type, title], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// --- CALENDARIO (AGENDA PERSONAL Y GLOBAL) ---
app.get('/api/calendar', (req, res) => {
    const user_id = req.query.user_id;
    if (!user_id) return res.json([]);

    // Modificado para traer eventos del usuario O eventos globales
    const sql = 'SELECT * FROM user_events WHERE user_id = ? OR is_global = 1 ORDER BY event_date ASC, event_time ASC';
    db.query(sql, [user_id], (err, data) => {
        if (err) return res.status(500).json(err);
        
        const formatted = data.map(ev => ({
            ...ev,
            event_date: new Date(ev.event_date).toISOString().split('T')[0],
            is_global: !!ev.is_global
        }));
        res.json(formatted);
    });
});

app.post('/api/calendar', (req, res) => {
    const { user_id, title, event_date, event_time, location, type_label, color } = req.body;
    
    // Por defecto is_global es FALSE (0)
    const sql = `INSERT INTO user_events (user_id, title, event_date, event_time, location, type_label, color, is_global) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
    
    db.query(sql, [user_id, title, event_date, event_time, location, type_label, color], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en puerto ${PORT}`);
});