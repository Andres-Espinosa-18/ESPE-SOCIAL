CREATE DATABASE IF NOT EXISTS espe_social;
USE espe_social;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Noticias
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

-- Datos de prueba para Noticias
INSERT INTO news (title, image, date, author, summary, content) VALUES
('Admisiones para periodo SII - 2026', 'https://picsum.photos/400/300?random=1', '10/12/2025', 'Admin', 'Proceso de admisión abierto.', 'El proceso de admisión para el nuevo periodo académico ha comenzado. Revisa los requisitos en la web oficial.'),
('Nuevos laboratorios inaugurados', 'https://picsum.photos/400/300?random=2', '09/12/2025', 'Departamento IT', 'Tecnología de punta para estudiantes.', 'Se han inaugurado 3 nuevos laboratorios de computación con equipos de última generación para las carreras de TI.'),
('Conferencia de Inteligencia Artificial', 'https://picsum.photos/400/300?random=3', '08/12/2025', 'Rectorado', 'Charla magistral este viernes.', 'Invitamos a todos los estudiantes a la charla sobre el impacto de la IA en la educación superior.');
