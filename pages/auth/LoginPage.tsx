import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useNotification } from '../../context/NotificationContext';

const LoginPage = () => {
  const { role } = useParams<{ role: 'user' | 'garage' | 'admin' }>();
  const [view, setView] = useState<'login' | 'register' | 'forgotPassword'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const roleConfig = {
    user: { title: 'Rider', dashboard: '/dashboard' },
    garage: { title: 'Garage Partner', dashboard: '/garage/dashboard' },
    admin: { title: 'Admin', dashboard: '/admin/dashboard' },
  };

  const currentConfig = roleConfig[role || 'user'];

  useEffect(() => {
    if (!role || !['user', 'garage', 'admin'].includes(role)) {
      navigate('/login/user');
    }
    // Reset form on role change
    setEmail('');
    setPassword('');
    setName('');
    setView('login');
  }, [role, navigate]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      addNotification('Logged in successfully!', 'success');
      navigate(currentConfig.dashboard);
    } catch (error: any) {
      addNotification(error.error_description || error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role: role } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Registration successful, but no user data returned.');

      // Create a corresponding profile in the `profiles` table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, full_name: name, phone: '', role: role }]);
      
      if (profileError) throw profileError;
      
      // If the role is 'garage', create a corresponding garage entry
      if (role === 'garage') {
        const { error: garageError } = await supabase
          .from('garages')
          .insert([{ user_id: data.user.id, name: name, balance: 0, earnings: 0, commission: 0.15, averageRating: 0 }]); // Set default values
        
        if (garageError) throw garageError;
      }


      addNotification('Account created! Check your email for verification.', 'info');
      setView('login');
    } catch (error: any) {
      addNotification(error.error_description || error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      addNotification('Check your email for a password reset link.', 'success');
      setView('login');
    } catch (error: any) {
      addNotification(error.error_description || error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'login') {
      handleLogin();
    } else if (view === 'register') {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-extrabold text-accent">ZippKar</h1>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-dark">
          {view === 'login' && `Sign in as a ${currentConfig.title}`}
          {view === 'register' && `Create ${currentConfig.title} Account`}
          {view === 'forgotPassword' && 'Reset Your Password'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          
          {view === 'forgotPassword' ? (
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              <p className="text-center text-sm text-gray-600">
                Enter the email address for your account and we'll send a link to reset your password.
              </p>
              <div>
                <label htmlFor="email-forgot" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1">
                  <input id="email-forgot" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                </div>
              </div>
              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-bold text-dark bg-primary hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
              <div className="text-center">
                <button type="button" onClick={() => setView('login')} className="text-sm font-medium text-accent hover:text-blue-700">
                  &larr; Back to login
                </button>
              </div>
            </form>
          ) : (
            <>
              {role !== 'admin' && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 p-1">
                    <button onClick={() => setView('login')} className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg ${view === 'login' ? 'bg-white shadow text-accent' : 'text-gray-700 hover:bg-white/50'}`}>Login</button>
                    <button onClick={() => setView('register')} className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg ${view === 'register' ? 'bg-white shadow text-accent' : 'text-gray-700 hover:bg-white/50'}`}>Register</button>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {view === 'register' && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1">
                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1">
                    <input id="password" name="password" type="password" autoComplete={view === 'login' ? 'current-password' : 'new-password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                  </div>
                </div>

                {view === 'login' && (
                  <div className="text-sm text-right">
                    <button type="button" onClick={() => setView('forgotPassword')} className="font-medium text-accent hover:text-blue-700">Forgot your password?</button>
                  </div>
                )}

                <div>
                  <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-bold text-dark bg-primary hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                    {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;