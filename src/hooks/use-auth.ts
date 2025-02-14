// components/features/auth/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '@/lib/api/endpoints/auth'
import { redirect } from 'next/navigation'

export const useAuth = () => {
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.data.access_token)
      redirect('/dashboard')
    }
  })

  const signupMutation = useMutation({
    mutationFn: authAPI.signup,
    onSuccess: () => redirect('/login?signup_success=true')
  })

  return { loginMutation, signupMutation }
}