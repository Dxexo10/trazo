import type { User } from '../models/index.js'
import { stableId } from './random.js'

const USERS: readonly Omit<User, 'id'>[] = [
  { name: 'Sofía Herrera', email: 'sofia.herrera@trazo.demo', role: 'manager' },
  { name: 'Diego Salazar', email: 'diego.salazar@trazo.demo', role: 'manager' },
  { name: 'Camila Rojas', email: 'camila.rojas@trazo.demo', role: 'analyst' },
  {
    name: 'Andrés Paredes',
    email: 'andres.paredes@trazo.demo',
    role: 'manager',
  },
  {
    name: 'Valeria Chávez',
    email: 'valeria.chavez@trazo.demo',
    role: 'analyst',
  },
  { name: 'Martín Quispe', email: 'martin.quispe@trazo.demo', role: 'manager' },
  {
    name: 'Lucía Fernández',
    email: 'lucia.fernandez@trazo.demo',
    role: 'analyst',
  },
  { name: 'Jorge Mendoza', email: 'jorge.mendoza@trazo.demo', role: 'manager' },
  { name: 'Renata Aliaga', email: 'renata.aliaga@trazo.demo', role: 'analyst' },
  {
    name: 'Bruno Cárdenas',
    email: 'bruno.cardenas@trazo.demo',
    role: 'manager',
  },
]

export const DEMO_USERS: readonly User[] = USERS.map((user, index) => ({
  id: stableId(1, index + 1),
  ...user,
}))

export const DEMO_CURRENT_USER = DEMO_USERS[0] as User
