import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../utils/api';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminLogin(formData);

      // Store token and admin data
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));

      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border border-gray-100 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-secondary/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary mb-2">
            Portail Admin
          </h1>
          <p className="text-muted font-bold text-sm uppercase tracking-widest">AI ITRI NTIC EVENT 2026</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-shake">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">
              Adresse Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white transition-all outline-none text-gray-800 font-medium"
              placeholder="admin@event.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white transition-all outline-none text-gray-800 font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:bg-primary transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion...
              </div>
            ) : 'Se connecter'}
          </button>
        </form>

        {/* Helper Text */}
        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-[11px] text-muted font-bold uppercase tracking-wider mb-2">Identifiants par défaut</p>
          <div className="inline-block bg-gray-50 px-4 py-2 rounded-full text-xs font-mono text-secondary">
            itriainticevent@gmail.com / NTIC-@-26ITRIAI
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
