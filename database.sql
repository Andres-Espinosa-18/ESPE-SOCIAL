CREATE DATABASE IF NOT EXISTS espe_social;
USE espe_social;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Noticias (General)
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    image TEXT,
    date VARCHAR(50),
    author VARCHAR(100),
    summary TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Avisos (Dashboard - Academico, Admin, Eventos)
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('ACADEMICO', 'ADMIN', 'EVENTOS') NOT NULL,
    title VARCHAR(100) NOT NULL,
    date VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de Foros
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    author_name VARCHAR(100),
    content TEXT NOT NULL,
    image LONGTEXT, -- Changed to LONGTEXT to support Base64 images
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de Likes en Foros
CREATE TABLE IF NOT EXISTS forum_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(post_id, user_id)
);

-- Tabla de Clubes
CREATE TABLE IF NOT EXISTS clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    icon_name VARCHAR(50) DEFAULT 'Flag',
    color_class VARCHAR(50) DEFAULT 'bg-blue-100 text-blue-600'
);

-- Tabla de Miembros de Clubes
CREATE TABLE IF NOT EXISTS club_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    UNIQUE(user_id, club_id)
);

-- Tabla de Grupos de Estudio
CREATE TABLE IF NOT EXISTS study_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    topic VARCHAR(100),
    meeting_date VARCHAR(50),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de Miembros de Grupos de Estudio
CREATE TABLE IF NOT EXISTS study_group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'accepted') DEFAULT 'accepted', -- Simplificado a accepted por defecto para el creador
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(group_id, user_id)
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- A quién le llega la notificación
    type ENUM('AVISOS', 'FOROS', 'EVENTOS', 'SISTEMA') NOT NULL,
    title VARCHAR(150) NOT NULL,
    time_ago VARCHAR(50) DEFAULT 'Ahora',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de Eventos Personales (Agenda) y Globales
CREATE TABLE IF NOT EXISTS user_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50),
    location VARCHAR(100),
    type_label VARCHAR(50) DEFAULT 'Evento',
    color VARCHAR(50) DEFAULT 'bg-blue-500',
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- DATOS SEMILLA (SEED DATA) --

-- Insertar Admin
INSERT IGNORE INTO users (id, name, student_id, email, password, role) VALUES (1, 'Administrador', 'ADMIN01', 'admin@espe.edu.ec', 'admin123', 'admin');

-- Insertar Noticias
INSERT INTO news (title, image, date, author, summary, content) VALUES
('Admisiones SII - 2026', 'https://picsum.photos/400/300?random=1', '10/12/2025', 'Admin', 'Proceso abierto.', 'Contenido completo...'),
('Nuevos laboratorios', 'https://picsum.photos/400/300?random=2', '09/12/2025', 'IT Dept', 'Tecnología de punta.', 'Contenido completo...');

-- Insertar Avisos Iniciales
INSERT INTO announcements (type, title, date, content, created_by) VALUES
('ACADEMICO', 'Recordatorio Académico', '22 de Dic.', 'El periodo de inscripción termina este viernes.', 1),
('ADMIN', 'Mantenimiento Banner', '23 de Dic.', 'Mantenimiento de 22:00 a 04:00.', 1),
('EVENTOS', 'Fiesta de Navidad', '24 de Dic.', 'Programa en el coliseo principal.', 1);

-- Insertar Clubes
INSERT INTO clubs (title, description, image, icon_name, color_class) VALUES
('Club de Software', 'Desarrollo web y móvil, hackathons y proyectos open source.', 'https://picsum.photos/400/300?random=10', 'Code', 'bg-blue-100 text-blue-600'),
('Club de Danza', 'Ritmos latinos, modernos y folclore nacional. Presentaciones semestrales.', 'https://picsum.photos/400/300?random=11', 'Music', 'bg-pink-100 text-pink-600'),
('Club de Robótica', 'Automatización, circuitos y competencia de seguidores de línea.', 'https://picsum.photos/400/300?random=12', 'Cpu', 'bg-purple-100 text-purple-600');

-- Insertar Eventos Globales (Por defecto para todos)
INSERT INTO user_events (user_id, title, event_date, event_time, location, type_label, color, is_global) VALUES
(1, 'Inicio Parcial 1', CURDATE() + INTERVAL 2 DAY, '07:00', 'Campus', 'Académico', 'bg-espe-green', TRUE),
(1, 'Feriado Nacional', CURDATE() + INTERVAL 5 DAY, '00:00', 'Nacional', 'Feriado', 'bg-red-500', TRUE),
(1, 'Semana de Exámenes', CURDATE() + INTERVAL 20 DAY, '07:00', 'Aulas', 'Examen', 'bg-orange-500', TRUE);
