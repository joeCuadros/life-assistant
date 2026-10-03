import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('life_assistant.db');

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS Usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT UNIQUE NOT NULL,
        contrasena TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Tipo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        icono TEXT,
        idUsuario INTEGER NOT NULL,
        FOREIGN KEY (idUsuario) REFERENCES Usuario(id) ON DELETE CASCADE,
        UNIQUE(nombre, idUsuario)
      );

      CREATE TABLE IF NOT EXISTS Tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idTareaPadre INTEGER,
        descripcion TEXT NOT NULL,
        prioridad TEXT CHECK(prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')) DEFAULT 'Media',
        idTipo INTEGER,
        fecha TEXT,
        completado INTEGER DEFAULT 0,
        idUsuario INTEGER NOT NULL,
        FOREIGN KEY (idTareaPadre) REFERENCES Tareas(id) ON DELETE CASCADE,
        FOREIGN KEY (idTipo) REFERENCES Tipo(id) ON DELETE SET NULL,
        FOREIGN KEY (idUsuario) REFERENCES Usuario(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Horario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idTipo INTEGER NOT NULL,
        dia TEXT CHECK(dia IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')) NOT NULL,
        hora_inicio TEXT NOT NULL,
        hora_fin TEXT NOT NULL,
        idUsuario INTEGER NOT NULL,
        FOREIGN KEY (idTipo) REFERENCES Tipo(id) ON DELETE CASCADE,
        FOREIGN KEY (idUsuario) REFERENCES Usuario(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Configuracion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idUsuario INTEGER UNIQUE NOT NULL,
        tema TEXT CHECK(tema IN ('claro', 'oscuro')) DEFAULT 'claro',
        hora_predeterminado TEXT DEFAULT '00:00',
        bloque_minutos INTEGER DEFAULT 30,
        descanso_minutos INTEGER DEFAULT 5,
        maximo_minutos INTEGER DEFAULT 120,
        FOREIGN KEY (idUsuario) REFERENCES Usuario(id) ON DELETE CASCADE
      );
    `);
    console.log('Tablas inicializadas correctamente');
  } catch (error) {
    console.error('Error al inicializar tablas:', error);
  }
};