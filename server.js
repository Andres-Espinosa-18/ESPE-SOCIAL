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

// --- AUTENTICACIÓN & PERFIL ---

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

app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
        if(err) return res.status(500).json(err);
        if(result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({message: 'Usuario no encontrado'});
        }
    });
});

app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const { bio, phone } = req.body;
    const sql = 'UPDATE users SET bio = ?, phone = ? WHERE id = ?';
    db.query(sql, [bio, phone, userId], (err, result) => {
        if(err) return res.status(500).json(err);
        res.json({ success: true });
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
  // Obtenemos posts con conteo real de likes y comentarios
  const sql = `
    SELECT fp.*, u.role,
    (SELECT COUNT(*) FROM forum_likes WHERE post_id = fp.id) as likesCount,
    (SELECT COUNT(*) FROM forum_comments WHERE post_id = fp.id) as commentsCount
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
        commentsCount: post.commentsCount, 
        likesCount: post.likesCount,    
        sharesCount: post.shares_count    
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

app.delete('/api/forums/:id', (req, res) => {
    const postId = req.params.id;
    // Assuming check ownership happens in frontend or simpler logic here
    db.query('DELETE FROM forum_posts WHERE id = ?', [postId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// Likes
app.post('/api/forums/like', (req, res) => {
    const { post_id, user_id } = req.body;
    const checkSql = 'SELECT * FROM forum_likes WHERE post_id = ? AND user_id = ?';
    db.query(checkSql, [post_id, user_id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            db.query('DELETE FROM forum_likes WHERE post_id = ? AND user_id = ?', [post_id, user_id], (err2) => {
                if(err2) return res.status(500).json(err2);
                res.json({ success: true, action: 'removed' });
            });
        } else {
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

// Shares
app.post('/api/forums/share', (req, res) => {
    const { post_id } = req.body;
    db.query('UPDATE forum_posts SET shares_count = shares_count + 1 WHERE id = ?', [post_id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// Comments
app.get('/api/forums/:id/comments', (req, res) => {
    const postId = req.params.id;
    const sql = `
        SELECT fc.*, u.name as author_name 
        FROM forum_comments fc 
        JOIN users u ON fc.user_id = u.id 
        WHERE fc.post_id = ? 
        ORDER BY fc.created_at ASC
    `;
    db.query(sql, [postId], (err, data) => {
        if(err) return res.status(500).json(err);
        res.json(data);
    });
});

app.post('/api/forums/:id/comments', (req, res) => {
    const postId = req.params.id;
    const { user_id, content } = req.body;
    const sql = 'INSERT INTO forum_comments (post_id, user_id, content) VALUES (?, ?, ?)';
    db.query(sql, [postId, user_id, content], (err, result) => {
        if(err) return res.status(500).json(err);
        res.json({ success: true });
    });
});


// --- GRUPOS DE ESTUDIO ---
app.get('/api/study_groups', (req, res) => {
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
    const sql = 'INSERT INTO study_group_members (group_id, user_id, status) VALUES (?, ?, ?)';
    db.query(sql, [group_id, user_id, 'accepted'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: 'Ya eres miembro de este grupo' });
            return res.status(500).json(err);
        }
        res.json({ success: true, message: 'Te has unido al grupo' });
    });
});

app.get('/api/study_groups/:id/members', (req, res) => {
    const groupId = req.params.id;
    const sql = `
        SELECT u.id as user_id, u.name, 
        CASE WHEN sg.created_by = u.id THEN 'Creador' ELSE 'Miembro' END as role
        FROM study_group_members sgm
        JOIN users u ON sgm.user_id = u.id
        JOIN study_groups sg ON sgm.group_id = sg.id
        WHERE sgm.group_id = ?
        ORDER BY role ASC, u.name ASC
    `;
    db.query(sql, [groupId], (err, data) => {
        if(err) return res.status(500).json(err);
        res.json(data);
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

// --- SUGERENCIAS ---
app.post('/api/suggestions', (req, res) => {
    const { user_id, category, subject, message } = req.body;
    const sql = 'INSERT INTO suggestions (user_id, category, subject, message) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, category, subject, message], (err, result) => {
        if(err) return res.status(500).json(err);
        res.json({ success: true });
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