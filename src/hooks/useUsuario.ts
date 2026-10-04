import { useState } from 'react';
import { db } from '../db/database';
import { Usuario } from '../types/database';

export function useUsuario() {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(false);

  const login = async (correo: string, contrasena: string) => {
    setCargando(true);
    try {
      const user = await db.getFirstAsync<Usuario>(
        'SELECT * FROM Usuario WHERE correo = ? AND contrasena = ?',
        [correo, contrasena]
      );
      if (user) {
        setUsuarioActual(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    } finally {
      setCargando(false);
    }
  };

  const logout = () => {
    setUsuarioActual(null);
  };

 const crearUsuario = async (nombre: string, correo: string, contrasena: string) => {
    setCargando(true);
    try {
      const result = await db.runAsync(
        'INSERT INTO Usuario (nombre, correo, contrasena) VALUES (?, ?, ?)',
        [nombre, correo, contrasena]
      );
      const newUser = { id: result.lastInsertRowId, nombre, correo, contrasena };
      setUsuarioActual(newUser);
      return newUser;
    } catch (error) {
      console.error('Error creando usuario:', error);
      return null;
    } finally {
      setCargando(false);
    }
  };

  const actualizarUsuario = async (id: number, nombre: string, correo: string, contrasena: string) => {
    try {
      await db.runAsync(
        'UPDATE Usuario SET nombre = ?, correo = ?, contrasena = ? WHERE id = ?',
        [nombre, correo, contrasena, id]
      );
      if (usuarioActual?.id === id) {
        setUsuarioActual({ id, nombre, correo, contrasena });
      }
      return true;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return false;
    }
  };

  return { usuarioActual, cargando, login, logout, crearUsuario, actualizarUsuario };
}