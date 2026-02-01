import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for Base64 images

// CONFIGURACIÓN DE LA CONEXIÓN A LA BASE DE DATOS
const db = mysql.createPool({
  host: 'localhost',
  user: 'admin',      
  password: 'admin',      
  database: 'espe_social',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Prueba de conexión inicial
db.getConnection((err, connection) => {
  if (err) {
    console.error('ERROR CRÍTICO: No se pudo conectar a la Base de Datos.');
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
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      return res.json({ success: true, user: result[0] });
    } else {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});

app.post('/api/register', (req, res) => {
  const { name, student_id, email, password } = req.body;
  const sql = 'INSERT INTO users (name, student_id, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, student_id, email, password], (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'El correo o ID ya existe.' });
        return res.status(500).json(err);
    }
    return res.json({ success: true, message: 'Registrado correctamente' });
  });
});

// --- NOTICIAS ---
app.get('/api/news', (req, res) => {
  db.query('SELECT * FROM news ORDER BY date DESC', (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// --- AVISOS ---
app.get('/api/announcements', (req, res) => {
  const type = req.query.type;
  let sql = 'SELECT * FROM announcements';
  let params = [];
  if (type) {
    sql += ' WHERE type = ?';
    params.push(type);
  }
  sql += ' ORDER BY id DESC LIMIT 1';
  db.query(sql, params, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

app.post('/api/announcements', (req, res) => {
  const { type, title, date, content, user_id } = req.body;
  db.query('SELECT role FROM users WHERE id = ?', [user_id], (err, users) => {
    if (err) return res.status(500).json(err);
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado.' });
    }
    const sql = 'INSERT INTO announcements (type, title, date, content, created_by) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [type, title, date, content, user_id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
  });
});

// --- FOROS ---
app.get('/api/forums', (req, res) => {
  // Obtenemos posts con conteo real de likes
  const sql = `
    SELECT fp.*, u.role,
    (SELECT COUNT(*) FROM forum_likes WHERE post_id = fp.id) as likesCount
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
        image: post.image, // Base64 or URL
        commentsCount: 0, 
        likesCount: post.likesCount,    
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

app.post('/api/forums/like', (req, res) => {
    const { post_id, user_id } = req.body;
    // Toggle like: Insert or Delete
    const checkSql = 'SELECT * FROM forum_likes WHERE post_id = ? AND user_id = ?';
    db.query(checkSql, [post_id, user_id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            // Ya existe, borrar
            db.query('DELETE FROM forum_likes WHERE post_id = ? AND user_id = ?', [post_id, user_id], (err2) => {
                if(err2) return res.status(500).json(err2);
                res.json({ success: true, action: 'removed' });
            });
        } else {
            // No existe, crear
            db.query('INSERT INTO forum_likes (post_id, user_id) VALUES (?, ?)', [post_id, user_id], (err2) => {
                if(err2) return res.status(500).json(err2);
                res.json({ success: true, action: 'added' });
            });
        }
    });
});

app.get('/api/forums/mylikes', (req, res) => {
    const user_id = req.query.user_id;
    db.query('SELECT post_id FROM forum_likes WHERE user_id = ?', [user_id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data.map(r => r.post_id.toString()));
    });
});

// --- GRUPOS DE ESTUDIO ---
app.get('/api/study_groups', (req, res) => {
    // Retorna grupos con conteo de miembros
    const sql = `
        SELECT sg.*, u.name as createdBy_name,
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as membersCount
        FROM study_groups sg
        JOIN users u ON sg.created_by = u.id
        ORDER BY sg.created_at DESC
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        
        const formatted = data.map(g => ({
            id: g.id.toString(),
            title: g.title,
            description: g.description,
            date: g.meeting_date || 'Por definir',
            createdBy: g.createdBy_name,
            members: g.membersCount,
            topic: g.topic
        }));
        res.json(formatted);
    });
});

app.get('/api/study_groups/my', (req, res) => {
    const user_id = req.query.user_id;
    // Grupos donde soy miembro o creador
    const sql = `
        SELECT sg.*, u.name as createdBy_name,
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as membersCount
        FROM study_groups sg
        JOIN study_group_members sgm ON sg.id = sgm.group_id
        JOIN users u ON sg.created_by = u.id
        WHERE sgm.user_id = ?
        ORDER BY sg.created_at DESC
    `;
    db.query(sql, [user_id], (err, data) => {
        if (err) return res.status(500).json(err);
        
        const formatted = data.map(g => ({
            id: g.id.toString(),
            title: g.title,
            description: g.description,
            date: g.meeting_date || 'Por definir',
            createdBy: g.createdBy_name,
            members: g.membersCount,
            topic: g.topic
        }));
        res.json(formatted);
    });
});

app.post('/api/study_groups', (req, res) => {
    const { title, description, topic, meeting_date, user_id } = req.body;
    const sql = 'INSERT INTO study_groups (title, description, topic, meeting_date, created_by) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [title, description, topic, meeting_date, user_id], (err, result) => {
        if (err) return res.status(500).json(err);
        const newGroupId = result.insertId;
        
        // Unir al creador automáticamente como miembro aceptado
        db.query('INSERT INTO study_group_members (group_id, user_id, status) VALUES (?, ?, ?)', 
            [newGroupId, user_id, 'accepted'], 
            (err2) => {
                if (err2) return res.status(500).json(err2);
                res.json({ success: true });
        });
    });
});

app.post('/api/study_groups/join', (req, res) => {
    const { group_id, user_id } = req.body;
    // Por defecto 'accepted' para simplificar, en un sistema real sería 'pending' si el grupo es privado
    const sql = 'INSERT INTO study_group_members (group_id, user_id, status) VALUES (?, ?, ?)';
    db.query(sql, [group_id, user_id, 'accepted'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: 'Ya eres miembro de este grupo' });
            return res.status(500).json(err);
        }
        res.json({ success: true, message: 'Te has unido al grupo' });
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

// --- CALENDARIO ---
app.get('/api/calendar', (req, res) => {
    const user_id = req.query.user_id;
    if (!user_id) return res.json([]);
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