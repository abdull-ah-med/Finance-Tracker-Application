import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { auth } from '../utils/auth';

export function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const token = auth.getToken();
      const response = await api.put('/auth/profile', { name, email }, token);
      if (response.success) {
        setMessage('Profile updated successfully');
      } else {
        setMessage('Failed to update profile');
      }
    } catch {
      setMessage('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and profile</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                    <p className="text-slate-400">Update your personal details</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  {message && (
                    <div className={`px-4 py-3 rounded-lg text-sm border ${
                      message.includes('success') 
                        ? 'bg-green-900/30 border-green-700/30 text-green-300' 
                        : 'bg-red-900/30 border-red-700/30 text-red-300'
                    }`}>
                      {message}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Account Overview */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-white mb-4">Account Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Member since</span>
                    <span className="text-white font-medium">Dec 2024</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Account type</span>
                    <span className="text-white font-medium">Personal</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-700/30">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="btn-secondary w-full justify-center">
                    Change Password
                  </button>
                  <button className="btn-secondary w-full justify-center">
                    Export Data
                  </button>
                  <button className="btn-secondary w-full justify-center">
                    Privacy Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
                <div className="space-y-3">
                  <button className="btn-secondary w-full justify-center">
                    Help Center
                  </button>
                  <button className="btn-secondary w-full justify-center">
                    Contact Support
                  </button>
                  <button className="btn-danger w-full justify-center">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
