import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Church, Lock, Mail, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      // Clean up Firebase error messages for the user
      let errorMsg = err.message || 'An error occurred.';
      if (errorMsg.includes('auth/operation-not-allowed')) {
        errorMsg = 'Error: Email/Password Authentication is not enabled in your Firebase Console.';
      } else if (errorMsg.includes('auth/email-already-in-use')) {
        errorMsg = 'An account with this email already exists.';
      } else if (errorMsg.includes('auth/weak-password')) {
        errorMsg = 'Password should be at least 6 characters.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      let errorMsg = err.message || 'An error occurred.';
      if (errorMsg.includes('auth/operation-not-allowed')) {
        errorMsg = 'Error: Google Sign-In is not enabled in your Firebase Console.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-royal-blue via-blue-900 to-royal-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-royal-gold rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/20 z-10">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-tr from-royal-gold to-yellow-200 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Church className="h-10 w-10 text-royal-dark" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Royal Apostolic Church
          </h2>
          <p className="mt-2 text-sm text-blue-200 font-medium tracking-wide uppercase">
            {isRegistering ? 'Create New Admin Account' : 'Management System Portal'}
          </p>
        </div>
        
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-xl backdrop-blur-md">
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-royal-gold text-blue-300">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full pl-12 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl shadow-inner text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent focus:bg-white/10 transition-all sm:text-sm"
                  placeholder="admin@royalapostolic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-royal-gold text-blue-300">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none block w-full pl-12 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl shadow-inner text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-royal-gold focus:border-transparent focus:bg-white/10 transition-all sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-royal-dark bg-gradient-to-r from-royal-gold to-yellow-400 hover:from-yellow-400 hover:to-royal-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-royal-dark focus:ring-royal-gold transition-all duration-300 ease-in-out disabled:opacity-70 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transform hover:-translate-y-0.5"
            >
              {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
              {!loading && <ChevronRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-white/50 text-xs uppercase tracking-wider font-semibold">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-white/20 text-sm font-bold rounded-xl text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-royal-dark focus:ring-white transition-all duration-300 ease-in-out disabled:opacity-70"
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Sign in with Google
            </button>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
