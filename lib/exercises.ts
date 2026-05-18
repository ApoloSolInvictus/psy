export type Exercise = {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  instructions: string;
  active: boolean;
};

export const EXERCISES: Exercise[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Respiración 4-6",
    category: "respiración",
    duration_minutes: 3,
    instructions:
      "Inhala por 4 segundos, exhala por 6 segundos. Repite durante 3 minutos y observa cómo cambia tu cuerpo.",
    active: true
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    title: "Journaling de descarga",
    category: "journaling",
    duration_minutes: 8,
    instructions:
      "Escribe sin editar: qué siento, qué necesito, qué paso pequeño puedo dar hoy.",
    active: true
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    title: "Tres gratitudes reales",
    category: "gratitud",
    duration_minutes: 5,
    instructions:
      "Anota tres cosas concretas que agradeces hoy, aunque sean pequeñas o imperfectas.",
    active: true
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    title: "Caminar sin pantalla",
    category: "movimiento",
    duration_minutes: 10,
    instructions:
      "Da una caminata breve sin revisar el teléfono. Mira colores, sonidos y temperatura.",
    active: true
  },
  {
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    title: "Ordenar un metro",
    category: "entorno",
    duration_minutes: 7,
    instructions:
      "Elige una superficie pequeña y ordénala. No busques perfección, solo un poco más de claridad.",
    active: true
  },
  {
    id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    title: "Llamar a alguien",
    category: "conexión",
    duration_minutes: 10,
    instructions:
      "Contacta a una persona segura. Puedes decir: 'No necesito soluciones, solo compañía un momento'.",
    active: true
  },
  {
    id: "12121212-1212-4212-8212-121212121212",
    title: "Meditación breve",
    category: "calma",
    duration_minutes: 5,
    instructions:
      "Siéntate cómodo, nota tu respiración y vuelve con amabilidad cada vez que la mente se vaya.",
    active: true
  }
];
