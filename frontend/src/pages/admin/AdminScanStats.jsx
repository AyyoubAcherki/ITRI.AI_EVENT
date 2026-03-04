import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * AdminScanStats Component
 * Displays scanning statistics and analytics for the admin
 */
function AdminScanStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchScanStats();
  }, [navigate]);

  const fetchScanStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/scan-statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching scan stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading scan statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-primary">Scan Statistics</h1>
              <Link
                to="/admin/dashboard"
                className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-accent"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-6 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shadow-lg shadow-secondary/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary uppercase tracking-tighter">
                Statistiques de Scan
              </h1>
            </div>
            <div className="flex gap-4">
              <Link
                to="/admin/qr-scanner"
                className="bg-green-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2 shadow-md shadow-green-200 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                </svg>
                Scanner QR
              </Link>
              <Link
                to="/admin/dashboard"
                className="bg-white text-gray-700 border border-gray-200 px-5 py-2 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
            </div>
            <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">Total Réservations</p>
            <div className="text-3xl font-black text-gray-800">{stats.summary.total_reservations}</div>
            <div className="mt-4 h-1 w-12 bg-primary rounded-full"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            </div>
            <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">Participants Scannées</p>
            <div className="text-3xl font-black text-green-600">{stats.summary.total_scanned}</div>
            <div className="mt-4 h-1 w-12 bg-green-500 rounded-full"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-16 h-16 text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M18 10V8c0-1.1-.9-2-2-2s-2 .9-2 2v2h-2V8c0-1.1-.9-2-2-2s-2 .9-2 2v2H6v10h12V10h-2z" /></svg>
            </div>
            <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">Total Entrées (Scans)</p>
            <div className="text-3xl font-black text-secondary">{stats.summary.total_scans}</div>
            <div className="mt-4 h-1 w-12 bg-secondary rounded-full"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
            </div>
            <p className="text-xs font-black text-muted uppercase tracking-widest mb-1">Taux de Présence</p>
            <div className="text-3xl font-black text-primary">{stats.summary.scan_rate}%</div>
            <div className="mt-4 h-1 w-12 bg-primary rounded-full"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* Scans Per Day Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full"></span>
              Flux de Scan (7 derniers jours)
            </h2>
            <div className="space-y-6">
              {stats.scans_per_day.map((day, index) => (
                <div key={index} className="flex items-center group">
                  <div className="w-24 text-xs font-black text-muted uppercase tracking-widest shrink-0">{formatDate(day.date)}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-50 rounded-full h-3 border border-gray-100 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-700 shadow-lg shadow-primary/20"
                        style={{
                          width: `${Math.max((day.count / Math.max(...stats.scans_per_day.map(d => d.count))) * 100, 5)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm font-black text-gray-800 group-hover:text-primary transition-colors">{day.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-black text-gray-800 mb-8 w-full text-left flex items-center gap-3">
              <span className="w-2 h-8 bg-green-500 rounded-full"></span>
              Statut Global de Présence
            </h2>

            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.summary.scan_rate}, 100`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#006AD7" />
                    <stop offset="100%" stopColor="#21277B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-800 tracking-tighter">{stats.summary.scan_rate}%</span>
                <span className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Objectif</span>
              </div>
            </div>

            <p className="text-muted font-bold text-sm max-w-xs leading-relaxed">
              <span className="text-green-600 font-black">{stats.summary.total_scanned}</span> participants sur un total de <span className="text-gray-800 font-black">{stats.summary.total_reservations}</span> ont été validés à l'entrée.
            </p>
          </div>
        </div>

        {/* Scanned Reservations Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Derniers Passages Validés</h2>
            <p className="text-muted font-bold text-[10px] uppercase tracking-widest mt-1">Historique en temps réel</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-6 text-[10px] font-black uppercase text-muted tracking-widest">Code Billet</th>
                  <th className="text-left p-6 text-[10px] font-black uppercase text-muted tracking-widest">Participant</th>
                  <th className="text-left p-6 text-[10px] font-black uppercase text-muted tracking-widest">Usage</th>
                  <th className="text-left p-6 text-[10px] font-black uppercase text-muted tracking-widest">Date & Heure</th>
                  <th className="text-left p-6 text-[10px] font-black uppercase text-muted tracking-widest">Pass ITRI</th>
                  <th className="text-left p-6 text-[10px] font-black uppercase text-muted tracking-widest">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.scanned_reservations.length > 0 ? (
                  stats.scanned_reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-6">
                        <span className="font-mono text-xs font-black text-secondary bg-blue-50 px-2 py-1 rounded border border-blue-100">
                          {reservation.ticket_code}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-gray-800 text-sm">{reservation.full_name}</div>
                        <div className="text-[11px] text-muted font-medium">{reservation.email}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-secondary rounded-full" style={{ width: `${(reservation.scan_count / (reservation.days.length)) * 100}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-secondary">
                            {reservation.scan_count}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-sm font-bold text-gray-600">
                        {formatDateTime(reservation.scanned_at)}
                      </td>
                      <td className="p-6">
                        <div className="flex gap-1">
                          {reservation.days.map((day) => (
                            <span key={day} className="w-5 h-5 bg-gray-100 text-muted text-[8px] flex items-center justify-center rounded-sm font-black shadow-inner group-hover:bg-secondary group-hover:text-white transition-colors">
                              {day === 'day1' ? 'J1' : day === 'day2' ? 'J2' : 'J3'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${reservation.is_used
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                          {reservation.is_used ? 'Épuisé' : 'Actif'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center flex flex-col items-center justify-center opacity-40">
                      <div className="text-4xl mb-4">📉</div>
                      <p className="text-muted font-black uppercase text-xs tracking-widest">Aucune donnée de scan pour le moment</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminScanStats;