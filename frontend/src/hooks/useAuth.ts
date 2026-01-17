import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import type { LoginCredentials, SignupCredentials } from '../types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getMe,
    retry: false,
    enabled: !!localStorage.getItem('token'),
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/');
    },
  });

  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => authApi.signup(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/');
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    navigate('/login');
  };

  const isAuthenticated = !!user && !!localStorage.getItem('token');

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutate,
    signupError: signupMutation.error,
    isSigningUp: signupMutation.isPending,
    logout,
  };
}
