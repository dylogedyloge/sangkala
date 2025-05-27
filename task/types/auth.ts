export interface User {
  id: string
  email: string
  name: string
  password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  users: User[]
  login: (email: string, password: string) => boolean
  register: (user: Omit<User, "id">) => boolean
  logout: () => void
}