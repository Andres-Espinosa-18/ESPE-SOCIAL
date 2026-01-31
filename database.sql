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
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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

-- Tabla de Eventos Personales (Agenda)
CREATE TABLE IF NOT EXISTS user_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50),
    location VARCHAR(100),
    type_label VARCHAR(50) DEFAULT 'Evento',
    color VARCHAR(50) DEFAULT 'bg-blue-500',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- DATOS SEMILLA (SEED DATA) --

-- Insertar Admin
INSERT INTO users (name, student_id, email, password, role) VALUES ('Administrador', 'ADMIN01', 'admin@espe.edu.ec', 'admin123', 'admin');

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
('Club de Software', 'Desarrollo web y móvil.', 'https://picsum.photos/400/300?random=10', 'Code', 'bg-blue-100 text-blue-600'),
('Club de Danza', 'Ritmos latinos y modernos.', 'https://picsum.photos/400/300?random=11', 'Music', 'bg-pink-100 text-pink-600'),
('Club de Robótica', 'Automatización y circuitos.', 'https://picsum.photos/400/300?random=12', 'Cpu', 'bg-purple-100 text-purple-600');
