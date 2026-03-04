import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPrograms, getSpeakers, createProgram, updateProgram, deleteProgram } from '../../utils/api';

function AdminPrograms() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    day: 'Day 1',
    time: '',
    speaker_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [programsRes, speakersRes] = await Promise.all([getPrograms(), getSpeakers()]);
      // Programs come grouped by day
      const allPrograms = [
        ...(programsRes.data.day1 || []).map(p => ({ ...p, day: 'Day 1' })),
        ...(programsRes.data.day2 || []).map(p => ({ ...p, day: 'Day 2' })),
        ...(programsRes.data.day3 || []).map(p => ({ ...p, day: 'Day 3' })),
      ];
      setPrograms(allPrograms);
      setSpeakers(speakersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await updateProgram(formData.id, formData);
      } else {
        await createProgram(formData);
      }

      setShowForm(false);
      setFormData({ id: null, title: '', day: 'Day 1', time: '', speaker_id: '' });
      setEditMode(false);
      loadData();
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Failed to save program');
    }
  };

  const handleEdit = (program) => {
    setFormData({
      id: program.id,
      title: program.title,
      day: program.day,
      time: program.time,
      speaker_id: program.speaker_id,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      await deleteProgram(id);
      loadData();
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program');
    }
  };

  const groupedPrograms = {
    'Day 1': programs.filter((p) => p.day === 'Day 1'),
    'Day 2': programs.filter((p) => p.day === 'Day 2'),
    'Day 3': programs.filter((p) => p.day === 'Day 3'),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shadow-lg shadow-secondary/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
                Gestion du Programme
              </h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditMode(false);
                  setFormData({ id: null, title: '', day: 'Day 1', time: '', speaker_id: '' });
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-md ${showForm
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200'
                  }`}
              >
                {showForm ? 'Annuler' : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter Session
                  </>
                )}
              </button>
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
        {/* Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
              {editMode ? 'Modifier la Session' : 'Nouvelle Session'}
              <div className="h-1 w-12 bg-secondary rounded-full"></div>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Titre de la Session *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="ex: Introduction à l'Intelligence Artificielle"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white transition-all outline-none font-medium"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Jour *</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white transition-all outline-none font-medium text-gray-700"
                  >
                    <option value="Day 1">Jour 1</option>
                    <option value="Day 2">Jour 2</option>
                    <option value="Day 3">Jour 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Horaire *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="ex: 09:00 - 10:30"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white transition-all outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Intervenant *</label>
                  <select
                    value={formData.speaker_id}
                    onChange={(e) => setFormData({ ...formData, speaker_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white transition-all outline-none font-medium text-gray-700"
                  >
                    <option value="">Choisir un intervenant</option>
                    {speakers.map((speaker) => (
                      <option key={speaker.id} value={speaker.id}>
                        {speaker.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-secondary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-primary shadow-lg shadow-secondary/20 transition-all active:scale-[0.98]"
                >
                  {editMode ? 'Mettre à jour' : 'Enregistrer la Session'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Programs by Day */}
        {loading ? (
          <div className="col-span-full text-center py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
            <div className="text-muted font-bold animate-pulse">Chargement du programme...</div>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedPrograms).map(([day, dayPrograms]) => (
              <div key={day} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-black text-gray-800 tracking-tight">{day === 'Day 1' ? 'Jour 1' : day === 'Day 2' ? 'Jour 2' : 'Jour 3'}</h2>
                  <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                {dayPrograms.length === 0 ? (
                  <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-muted font-bold uppercase text-xs tracking-widest">Aucune session prévue</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {dayPrograms.map((program) => (
                      <div
                        key={program.id}
                        className="group relative bg-[#F8FAFC] p-6 rounded-2xl border border-transparent hover:border-secondary/20 hover:bg-white hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="bg-secondary text-white px-4 py-2 rounded-xl font-black text-xs tracking-wider shadow-md shadow-secondary/10 whitespace-nowrap">
                              {program.time}
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-gray-800 mb-1 group-hover:text-secondary transition-colors">{program.title}</h3>
                              {program.speaker && (
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                  <p className="text-muted text-sm font-bold">
                                    {program.speaker.name} <span className="font-medium opacity-60">— {program.speaker.job_title}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(program)}
                              className="flex-1 md:flex-none bg-white text-gray-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm border border-gray-100 hover:bg-secondary hover:text-white hover:border-secondary transition-all"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(program.id)}
                              className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPrograms;
