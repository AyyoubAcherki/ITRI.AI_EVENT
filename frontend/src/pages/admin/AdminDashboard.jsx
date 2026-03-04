import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStatistics, getReservations, getSpeakers, getPrograms } from '../../utils/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, reservationsRes, speakersRes, programsRes] = await Promise.all([
        getStatistics(),
        getReservations(),
        getSpeakers(),
        getPrograms(),
      ]);

      setStats(statsRes.data);
      setReservations(reservationsRes.data || []);
      setSpeakers(speakersRes.data || []);

      const programData = programsRes.data;
      const allPrograms = [
        ...(programData.day1 || []),
        ...(programData.day2 || []),
        ...(programData.day3 || []),
      ];
      setPrograms(allPrograms);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-primary font-semibold animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const COLORS = ['#006AD7', '#0EA5E9', '#21277B', '#5F83B1'];

  const roleData = [
    { name: 'Students', value: stats?.role_distribution?.students || 0 },
    { name: 'Employees', value: stats?.role_distribution?.employees || 0 },
  ];

  const dayData = [
    { name: 'Day 1', reservations: stats?.reservations_per_day?.day1 || 0 },
    { name: 'Day 2', reservations: stats?.reservations_per_day?.day2 || 0 },
    { name: 'Day 3', reservations: stats?.reservations_per_day?.day3 || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Admin Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 shadow-md transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Reservations', value: stats?.total_reservations || 0, color: 'text-primary' },
            { label: 'Occupancy Rate (Day 1)', value: `${stats?.seat_occupancy?.day1?.percentage || 0}%`, color: 'text-accent' },
            { label: 'Total Speakers', value: speakers.length, color: 'text-primary' },
            { label: 'Total Sessions', value: programs.length, color: 'text-accent' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-gray-500 text-sm font-medium mb-2">{stat.label}</h3>
              <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Reservations by Day
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#F1F5F9' }}
                />
                <Bar dataKey="reservations" fill="#006AD7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-accent rounded-full"></span>
              Students vs Employees
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Management Links */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { to: '/admin/reservations', label: 'Reservations', icon: '📋', color: 'bg-primary' },
            { to: '/admin/speakers', label: 'Speakers', icon: '🎤', color: 'bg-primary' },
            { to: '/admin/programs', label: 'Program', icon: '📅', color: 'bg-primary' },
            { to: '/admin/qr-scanner', label: 'QR Scanner', icon: '🔍', color: 'bg-green-600' },
            { to: '/admin/scan-stats', label: 'Scan Stats', icon: '📊', color: 'bg-blue-600' },
          ].map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className={`${link.color} text-white p-4 rounded-xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center gap-2`}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="font-bold">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Recent Reservations</h3>
            <Link to="/admin/reservations" className="text-primary text-sm font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Day</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Seat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.slice(0, 5).map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      {reservation.first_name} {reservation.last_name}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{reservation.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${reservation.role === 'student'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {reservation.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {reservation.days?.map(d => d === 'day1' ? 'J1' : d === 'day2' ? 'J2' : 'J3').join(', ') || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-primary">
                      {reservation.seat_numbers?.map(s => s.seat).join(', ') || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
