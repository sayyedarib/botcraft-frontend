// lib/api/endpoints/auth.ts
import { apiClient } from './client'

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<{ access_token: string }>('/auth/login', credentials),

  signup: (userData: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/signup', userData)
}