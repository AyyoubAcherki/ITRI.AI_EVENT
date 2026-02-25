import { useState, useEffect } from 'react';
import { getSpeakers } from '../utils/api';

function Speakers() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary font-semibold">Loading speakers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 pt-32">
      {/* Header */}
      <div className="container mx-auto px-6 mb-24 text-center">
        <h1 className="text-5xl font-bold text-center text-dark mb-8">
          Our Speakers
        </h1>
        <p className="text-lg text-center text-muted max-w-4xl mx-auto leading-relaxed">
          Meet the industry experts and thought leaders who will share their knowledge
          and insights at AI ITRI NTIC EVENT.
        </p>
      </div>

      {/* Speakers Grid */}
      <div className="container mx-auto px-6 mt-20">
        {speakers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted">
              Speakers will be announced soon. Stay tuned!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {speakers.map((speaker) => (
              <div
                key={speaker.id}
                className="bg-light border border-slate-700 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:border-primary transform hover:-translate-y-2 transition-all"
              >
                {/* Speaker Photo */}
                <div className="h-64 bg-gradient-to-br from-slate-800 to-primary flex items-center justify-center">
                  {speaker.photo ? (
                    <img
                      src={`http://localhost:8000/storage/${speaker.photo}`}
                      alt={speaker.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-6xl font-bold">
                      {speaker.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Speaker Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-dark mb-2">
                    {speaker.name}
                  </h3>
                  <p className="text-secondary font-semibold mb-4">
                    {speaker.job_title}
                  </p>
                  <p className="text-muted leading-relaxed">
                    {speaker.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Speakers;
