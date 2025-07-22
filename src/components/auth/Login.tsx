import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ShoppingCart, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/auth';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, loading, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return null; // Will be handled by ProtectedRoute
  }

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    
    const result = await login(data);
    
    if (!result.success) {
      setLoginError(result.error || 'Erro desconhecido');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <ShoppingCart className="h-16 w-16 text-red-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">
                O BARATEIRO
              </h1>
              <p className="text-lg text-gray-300 tracking-wide mt-1">
                Atacado e varejo
              </p>
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <div 
          className="backdrop-blur-xl rounded-3xl border border-white/20 p-10 shadow-2xl ring-1 ring-white/10"
          style={{
            background: 'rgba(0, 0, 0, 0.4)'
          }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-10 tracking-wide">
            Login
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {loginError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-300 text-sm">{loginError}</p>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-3">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  {...register('username', { 
                    required: 'Nome de usuário é obrigatório',
                    minLength: {
                      value: 3,
                      message: 'Nome de usuário deve ter pelo menos 3 caracteres'
                    }
                  })}
                  type="text"
                  id="username"
                  className={`w-full pl-14 pr-5 py-5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 ${
                    errors.username ? 'border-red-400 focus:ring-red-400' : ''
                  }`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)'
                  }}
                  placeholder="Username"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm ml-3 animate-pulse">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  {...register('password', { 
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full pl-14 pr-14 py-5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm transition-all duration-300 ${
                    errors.password ? 'border-red-400 focus:ring-red-400' : ''
                  }`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)'
                  }}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm ml-3 animate-pulse">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full text-white py-5 px-6 rounded-2xl font-semibold text-lg focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #00007F 0%, #0C009F 50%, #1800BF 100%)'
              }}
            >
              {(isSubmitting || loading) ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Log in'
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm underline underline-offset-4 hover:underline-offset-2"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;