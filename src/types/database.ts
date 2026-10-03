export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  contrasena: string;
}

export interface Tipo {
  id: number;
  nombre: string;
  icono?: string;
  idUsuario: number;
}

export interface Tarea {
  id: number;
  idTareaPadre?: number;
  descripcion: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  idTipo?: number;
  fecha?: string;
  completado: boolean; // En BD será 0 o 1, pero aquí lo manejamos como boolean
  idUsuario: number;
}

export interface Horario {
  id: number;
  idTipo: number;
  dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  hora_inicio: string;
  hora_fin: string;
  idUsuario: number;
}

export interface Configuracion {
  id: number;
  idUsuario: number;
  tema: 'claro' | 'oscuro';
  hora_predeterminado: string;
  bloque_minutos: number;
  descanso_minutos: number;
  maximo_minutos: number;
}