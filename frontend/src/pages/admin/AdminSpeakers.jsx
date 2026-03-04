import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } from '../../utils/api';

function AdminSpeakers() {
  const navigate = useNavigate();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    job_title: '',
    bio: '',
    photo: null,
  });

  useEffect(() => {
    loadSpeakers();
  }, []);

  const loadSpeakers = async () => {
    try {
      const response = await getSpeakers();
      setSpeakers(response.data || []);
    } catch (error) {
      console.error('Error loading speakers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await updateSpeaker(formData.id, formData);
      } else {
        await createSpeaker(formData);
      }

      setShowForm(false);
      setFormData({ id: null, name: '', job_title: '', bio: '', photo: null });
      setEditMode(false);
      loadSpeakers();
    } catch (error) {
      console.error('Error saving speaker:', error);
      alert('Failed to save speaker');
    }
  };

  const handleEdit = (speaker) => {
    setFormData({
      id: speaker.id,
      name: speaker.name,
      job_title: speaker.job_title,
      bio: speaker.bio,
      photo: null,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this speaker?')) return;

    try {
      await deleteSpeaker(id);
      loadSpeakers();
    } catch (error) {
      console.error('Error deleting speaker:', error);
      alert('Failed to delete speaker');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Gestion des Intervenants
              </h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditMode(false);
                  setFormData({ id: null, name: '', job_title: '', bio: '', photo: null });
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
                    Ajouter
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
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
              {editMode ? 'Modifier Intervenant' : 'Nouvel Intervenant'}
              <div className="h-1 w-12 bg-primary rounded-full"></div>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Nom Complet *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="ex: Dr. Ahmed Alami"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Titre / Profession *</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    required
                    placeholder="ex: Expert en IA"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Biographie *</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  rows="4"
                  placeholder="Décrivez brièvement le parcours de l'intervenant..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Photo de Profil</label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-bold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20 transition-all cursor-pointer"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-secondary shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {editMode ? 'Mettre à jour' : 'Enregistrer Intervenant'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Speakers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-20 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="text-muted font-bold animate-pulse">Chargement des intervenants...</div>
            </div>
          ) : speakers.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-4xl mb-4">🎤</div>
              <p className="text-gray-500 font-bold uppercase tracking-widest">Aucun intervenant pour le moment</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Ajouter le premier intervenant
              </button>
            </div>
          ) : (
            speakers.map((speaker) => (
              <div key={speaker.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
                <div className="h-56 relative overflow-hidden">
                  {speaker.photo ? (
                    <img
                      src={`http://localhost:8000/storage/${speaker.photo}`}
                      alt={speaker.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <div className="text-white text-6xl font-black drop-shadow-lg">
                        {speaker.name.charAt(0)}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-gray-800 mb-1 tracking-tight group-hover:text-primary transition-colors">{speaker.name}</h3>
                  <p className="text-secondary font-bold text-sm mb-4 leading-tight">{speaker.job_title}</p>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed italic">"{speaker.bio}"</p>

                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => handleEdit(speaker)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(speaker.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSpeakers;
