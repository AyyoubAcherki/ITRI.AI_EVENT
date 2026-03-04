import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getReservations, deleteReservation } from '../../utils/api';

function AdminReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    day: '',
    role: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    loadReservations();
  }, [filters]);

  const loadReservations = async () => {
    try {
      const response = await getReservations(filters);
      setReservations(response.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
      await deleteReservation(id);
      loadReservations();
    } catch (error) {
      alert('Failed to delete reservation');
    }
  };

  const getStatusBadge = (status, isUsed) => {
    if (status === 'canceled') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase tracking-tight">Annulé</span>;
    }
    if (status === 'waiting_list') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-tight">Liste d'attente</span>;
    }
    if (status === 'pending') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-tight">En attente</span>;
    }
    if (status === 'confirmed') {
      if (isUsed) {
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-tight">Présent</span>;
      }
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-tight">Confirmé</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 uppercase tracking-tight">{status}</span>;
  };

  const handleExportToSheets = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Institution', 'Days', 'Seats', 'Ticket Code', 'Status'],
      ...reservations.map((r) => [
        `${r.first_name} ${r.last_name}`,
        r.email,
        r.phone,
        r.role === 'student' ? 'Étudiant' : 'Employé',
        r.institution_name || 'N/A',
        r.days?.map(d => d === 'day1' ? 'Jour 1' : d === 'day2' ? 'Jour 2' : 'Jour 3').join(' + ') || 'N/A',
        r.seat_numbers?.map(s => s.seat).join(', ') || 'N/A',
        r.ticket_code || 'N/A',
        r.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservations.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shadow-lg shadow-secondary/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
                Gestion des Réservations
              </h1>
            </div>
            <Link
              to="/admin/dashboard"
              className="text-muted hover:text-secondary font-bold flex items-center gap-2 transition-all hover:-translate-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tableau de bord
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-2 tracking-wider">Jour</label>
              <select
                value={filters.day}
                onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary focus:bg-white transition-all outline-none text-gray-700"
              >
                <option value="">Tous les jours</option>
                <option value="day1">Jour 1</option>
                <option value="day2">Jour 2</option>
                <option value="day3">Jour 3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-2 tracking-wider">Rôle</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary focus:bg-white transition-all outline-none text-gray-700"
              >
                <option value="">Tous les rôles</option>
                <option value="student">Étudiant</option>
                <option value="employee">Employé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-2 tracking-wider">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary focus:bg-white transition-all outline-none text-gray-700"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="canceled">Annulé</option>
                <option value="waiting_list">Liste d'attente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase mb-2 tracking-wider">Recherche</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Nom ou email..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary focus:bg-white transition-all outline-none text-gray-700"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExportToSheets}
                className="w-full bg-[#10B981] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#059669] shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporter (CSV)
              </button>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-muted tracking-widest">Participant</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-muted tracking-widest">Contact</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-muted tracking-widest">Rôle</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-muted tracking-widest">Pass ITRI</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-muted tracking-widest">Siège</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-muted tracking-widest">Code</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-muted tracking-widest">Statut</th>
                  <th className="text-center py-4 px-6 text-[10px] font-black uppercase text-muted tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto"></div>
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-muted font-medium italic">
                      Aucune réservation trouvée
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-secondary font-bold text-xs shadow-inner">
                            {reservation.first_name[0]}{reservation.last_name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm tracking-tight">{reservation.first_name} {reservation.last_name}</div>
                            <div className="text-[11px] text-muted font-bold uppercase tracking-tighter">{reservation.institution_name || 'Sans institution'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-700">{reservation.email}</div>
                        <div className="text-[11px] text-muted font-bold">{reservation.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${reservation.role === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                          {reservation.role === 'student' ? 'Étudiant' : 'Employé'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-1">
                          {reservation.days?.map(d => (
                            <span key={d} className="w-5 h-5 bg-secondary text-white text-[9px] flex items-center justify-center rounded-sm font-bold shadow-sm">
                              {d === 'day1' ? 'J1' : d === 'day2' ? 'J2' : 'J3'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="grid grid-cols-1 gap-1">
                          {reservation.seat_numbers?.map(s => (
                            <span key={s.seat} className="text-xs font-bold text-primary whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block text-center shadow-sm">
                              {s.seat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <code className="text-xs font-mono text-muted bg-[#F1F5F9] px-2 py-0.5 rounded border border-gray-200">{reservation.ticket_code || 'N/A'}</code>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(reservation.status, reservation.is_used)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                          title="Supprimer la réservation"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReservations;
