import { useState, useEffect } from 'react';
import { getSeats, createReservation, submitWaitlist } from '../utils/api';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

function Reservation() {
  const [leftBlock, setLeftBlock] = useState({});
  const [rightBlock, setRightBlock] = useState({});
  const [selectedDays, setSelectedDays] = useState(['day1']);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Compute if all regular seats are sold out
  const isSoldOut = () => {
    // If we haven't loaded seats yet, don't show sold out
    if (Object.keys(leftBlock).length === 0 && Object.keys(rightBlock).length === 0) return false;

    // Check if there's any available seat that is NOT a VIP seat
    const hasLeftAvailable = Object.values(leftBlock).flat().some(seat => seat.is_available && seat.type !== 'vip');
    const hasRightAvailable = Object.values(rightBlock).flat().some(seat => seat.is_available && seat.type !== 'vip');

    return !hasLeftAvailable && !hasRightAvailable;
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'student',
    institution: '',
  });

  // Load seats when selected days change (use first selected day for display)
  useEffect(() => {
    loadSeats();
  }, [selectedDays]);

  const loadSeats = async () => {
    try {
      setLoading(true);
      // Load seats for the first selected day to show availability
      const dayToLoad = selectedDays[0] || 'day1';
      const response = await getSeats(dayToLoad);
      setLeftBlock(response.data.leftBlock || {});
      setRightBlock(response.data.rightBlock || {});
    } catch (error) {
      console.error('Error loading seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    // VIP seats cannot be selected
    if (seat.type === 'vip') {
      return;
    }

    // Reserved seats cannot be selected
    if (!seat.is_available) {
      return;
    }

    // Toggle seat selection (Single seat only)
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats([]);
    } else {
      setSelectedSeats([seat]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear institution if role is employee
    if (name === 'role' && value === 'employee') {
      setFormData((prev) => ({
        ...prev,
        institution: '',
      }));
    }
  };

  const handleDayToggle = (day) => {
    if (day === 'all') {
      // Toggle all days
      if (selectedDays.length === 3) {
        setSelectedDays(['day1']);
      } else {
        setSelectedDays(['day1', 'day2', 'day3']);
      }
    } else {
      if (selectedDays.includes(day)) {
        // Don't allow deselecting if it's the only day
        if (selectedDays.length > 1) {
          setSelectedDays(selectedDays.filter(d => d !== day));
        }
      } else {
        setSelectedDays([...selectedDays, day]);
      }
    }
    setSelectedSeats([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedSeats.length === 0) {
      alert('Veuillez sélectionner au moins un siège');
      return;
    }

    if (selectedDays.length === 0) {
      alert('Veuillez sélectionner au moins un jour');
      return;
    }

    setSubmitting(true);

    try {
      // Build seats array with seat_id and day for each combination
      const seats = [];
      for (const seat of selectedSeats) {
        for (const day of selectedDays) {
          seats.push({
            seat_id: seat.id,
            day: day,
          });
        }
      }

      const reservationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        institution_name: formData.institution || null,
        days: selectedDays,
        seats: seats,
      };

      console.log('Sending reservation data:', reservationData);
      const response = await createReservation(reservationData);
      console.log('Response from server:', response.data);

      // Check if reservation was created successfully
      if (!response.data || (!response.data.ticket_code && !response.data.reservation?.ticket_code)) {
        console.error('Missing ticket code in response:', response.data);
        throw new Error('Invalid response from server (missing ticket_code)');
      }

      // Generate PDF ticket with QR code
      await generatePDFTicket(response.data);

      setShowSuccess(true);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'student',
        institution: '',
      });
      setSelectedSeats([]);
      loadSeats();

      setTimeout(() => {
        setShowSuccess(false);
      }, 30000);
    } catch (error) {
      console.error('Error creating reservation:', error);
      console.error('Error response:', error.response?.data);
      alert(
        error.response?.data?.message || error.message || 'Échec de la réservation. Veuillez réessayer.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();

    if (selectedDays.length === 0) {
      alert('Veuillez sélectionner au moins un jour');
      return;
    }

    setSubmitting(true);

    try {
      const waitlistData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        institution_name: formData.institution || null,
        days: selectedDays,
      };

      await submitWaitlist(waitlistData);
      setWaitlistSuccess(true);
      setShowWaitlistForm(false);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert(error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription sur la liste d\'attente.');
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDFTicket = async (reservationData) => {
    // Landscape format, 210x90mm ticket size
    const doc = new jsPDF('l', 'mm', [210, 90]);

    // QR Code data - use the ticket_code from server response
    const ticketCode = reservationData.ticket_code || reservationData.reservation?.ticket_code || 'ITRI-UNKNOWN';

    const qrData = JSON.stringify({
      ticket_code: ticketCode,
      email: formData.email,
    });

    console.log('Generating PDF with QR data:', qrData);

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Background: Deep Dark Slate (#0f172a)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 90, 'F');

    // Left Border Accent: ITRI primary blue (#006AD7)
    doc.setFillColor(0, 106, 215);
    doc.rect(0, 0, 4, 90, 'F');

    // --- LEFT SECTION (Main Ticket Details) 0 to 150mm ---

    // Main Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('AI ITRI NTIC EVENT', 15, 22);

    // Event Date & Location
    doc.setFontSize(10);
    doc.setTextColor(234, 179, 8); // Yellow 500
    doc.text('1 - 3 AVRIL 2026 | TANGER, MAROC', 15, 30);

    // "ISTA NTIC" Badge
    doc.setFillColor(220, 38, 38); // Red 600
    doc.roundedRect(15, 34, 30, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('ISTA NTIC', 30, 38.2, { align: 'center' });

    // Green dot
    doc.setFillColor(22, 163, 74); // Green 600
    doc.circle(18, 37, 1, 'F');

    // Attendee Info Box (Slate 800)
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(51, 65, 85);
    doc.roundedRect(15, 45, 125, 35, 2, 2, 'FD');

    // Labels
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('PARTICIPANT', 20, 52);
    doc.text('RÔLE', 95, 52);
    doc.text('ACCÈS', 20, 67);
    doc.text('SIÈGES', 95, 67);

    // Values
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const fullName = `${formData.first_name} ${formData.last_name}`;
    doc.text(fullName.length > 30 ? fullName.substring(0, 27) + '...' : fullName, 20, 58);
    doc.text(formData.role === 'student' ? 'Étudiant' : 'Employé', 95, 58);

    const dayLabels = selectedDays.map(d => d === 'day1' ? 'Jour 1' : d === 'day2' ? 'Jour 2' : 'Jour 3').join(', ');
    doc.text(dayLabels, 20, 73);

    doc.setTextColor(234, 179, 8); // Yellow 500 for seats
    doc.text(selectedSeats.map(s => s.seat_number).join(', '), 95, 73);

    // Watermark Logo
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    doc.setFontSize(40);
    doc.text('ITRI TECH', 75, 40, { align: 'center', angle: -20 });
    doc.setGState(new doc.GState({ opacity: 1.0 }));

    // --- PERFORATION LINE ---
    doc.setDrawColor(71, 85, 105); // Slate 600
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(150, 0, 150, 90);
    doc.setLineDashPattern([], 0); // Reset

    // --- RIGHT SECTION (Stub) 150 to 210mm ---

    // Stub Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ADMISSION', 180, 16, { align: 'center' });

    // QR Code Background (white box)
    const qrSize = 40;
    const qrX = 160;
    const qrY = 22;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, 'F');
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Ticket ID
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFont('helvetica', 'normal');
    doc.text('TICKET NO.', 180, 72, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(ticketCode, 180, 78, { align: 'center' });

    // Scanning Instruction
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.setFont('helvetica', 'normal');
    doc.text('Scannez à l\'entrée. Billet non transférable.', 180, 85, { align: 'center' });

    // Save PDF
    const fileName = `Ticket_ITRI_2026_${formData.last_name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  const getSeatColor = (seat) => {
    // VIP seats - dark blue, not selectable
    if (seat.type === 'vip') {
      return 'bg-[#21277B] text-white cursor-not-allowed';
    }

    // Reserved seats - gray, not selectable
    if (!seat.is_available) {
      return 'bg-gray-400 text-white cursor-not-allowed';
    }

    // Selected seats - bright blue
    if (selectedSeats.find(s => s.id === seat.id)) {
      return 'bg-primary text-white transform scale-110';
    }

    // Available seats - light gray
    return 'bg-slate-700 hover:bg-primary cursor-pointer text-slate-300';
  };

  const renderSeatBlock = (blockData, blockName) => {
    const rows = Object.keys(blockData).sort((a, b) => parseInt(a) - parseInt(b));

    return (
      <div className="flex-1">
        <h4 className="text-center font-bold mb-4 text-slate-300">{blockName}</h4>
        <div className="space-y-2">
          {rows.map((rowNum) => (
            <div key={`${blockName}-${rowNum}`} className="flex gap-1 justify-center">
              {blockData[rowNum]
                .sort((a, b) => a.seat_index - b.seat_index)
                .map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-10 h-10 rounded flex items-center justify-center text-sm font-semibold transition-all ${getSeatColor(seat)}`}
                    title={`Siège ${seat.seat_number} (${seat.type === 'vip' ? 'VIP' : 'Standard'})`}
                    disabled={seat.type === 'vip' || !seat.is_available}
                  >
                    {seat.seat_index}
                  </button>
                ))}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">Stage This Way ↑</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-16 pt-32">
      {/* Header */}
      <div className="container mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Réservez Votre Siège
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto">
          Sélectionnez votre jour et votre siège préféré, puis remplissez le formulaire pour compléter votre réservation.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-blue-900/40 border border-blue-500/50 text-blue-100 px-6 py-8 rounded-lg text-center animate-fadeIn backdrop-blur-sm">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-800/50 mb-4 text-blue-400">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-bold text-2xl mb-2">Presque fini !</p>
            <p className="text-lg mb-4">Votre demande de réservation a été enregistrée. **Veuillez vérifier votre email pour confirmer votre place.**</p>
            <p className="text-sm text-blue-300/80">Si vous ne confirmez pas via l'email envoyé, vous serez placé sur la liste d'attente.</p>
          </div>
        </div>
      )}

      {/* Waitlist Success */}
      {waitlistSuccess && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-green-900/40 border border-green-500/50 text-green-100 px-6 py-8 rounded-lg text-center animate-fadeIn backdrop-blur-sm">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-800/50 mb-4 text-green-400">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-2xl mb-2">Inscription Réussie !</p>
            <p className="text-lg">Vous êtes bien inscrit(e) sur la liste d'attente pour l'événement. Nous vous contacterons par e-mail dès qu'une place se libérera.</p>
          </div>
        </div>
      )}

      {/* Waitlist Success */}
      {waitlistSuccess && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-8 rounded-lg text-center animate-fadeIn">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-200 mb-4 text-green-600">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-2xl mb-2">Inscription Réussie !</p>
            <p className="text-lg">Vous êtes bien inscrit(e) sur la liste d'attente pour l'événement. Nous vous contacterons par e-mail dès qu'une place se libérera.</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Seat Selection */}
          <div>
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-blue-300 mb-6 text-center">1. Choisissez votre siège</h2>

              {/* Day Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-muted">Sélectionnez le(s) jour(s):</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'day1', label: 'Jour 1' },
                    { value: 'day2', label: 'Jour 2' },
                    { value: 'day3', label: 'Jour 3' },
                  ].map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedDays.includes(day.value)
                        ? 'bg-primary text-white border border-primary'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        }`}
                    >
                      {day.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleDayToggle('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedDays.length === 3
                      ? 'bg-slate-900 text-white border border-slate-700'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                      }`}
                  >
                    Les 3 Jours
                  </button>
                </div>
              </div>

              {/* Seat Legend */}
              <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-slate-700 rounded mr-2"></div>
                    <span className="text-sm text-slate-300">Libre</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-primary rounded mr-2"></div>
                    <span className="text-sm text-slate-300">Sélectionné</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-600 rounded mr-2"></div>
                    <span className="text-sm text-slate-300">Réservé</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-[#21277B] rounded mr-2"></div>
                    <span className="text-sm text-slate-300">VIP</span>
                  </div>
                </div>
              </div>

              {/* Seat Map or Waitlist Alert */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006AD7] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement des sièges...</p>
                </div>
              ) : isSoldOut() ? (
                <div className="bg-slate-800 p-8 rounded-xl border border-yellow-500/50 text-center animate-fadeIn">
                  <div className="text-yellow-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tous les billets sont épuisés :(</h3>
                  <p className="text-slate-300 mb-6 text-sm">Il n'y a plus de places libres pour ce(s) jour(s). Les inscriptions classiques sont fermées pour ce jour.</p>
                  <button
                    onClick={() => {
                      setShowWaitlistForm(true);
                      setSelectedSeats([]); // Clear any ghost selections
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg transition-all"
                  >
                    S'inscrire sur la liste d'attente
                  </button>
                </div>
              ) : (
                <div className="flex gap-8 justify-center">
                  {renderSeatBlock(leftBlock, 'Left Block')}
                  {renderSeatBlock(rightBlock, 'Right Block')}
                </div>
              )}

              {/* Selected Seats Info */}
              {selectedSeats.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-bold text-green-700">
                    Sélectionné{selectedSeats.length > 1 ? 's' : ''}: {selectedSeats.map(s => s.seat_number).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reservation Form */}
          <div>
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-blue-300 mb-6 text-center">
                {showWaitlistForm ? "2. Informations pour Liste d'Attente" : "2. Vos Informations"}
              </h2>

              <form onSubmit={showWaitlistForm ? handleWaitlistSubmit : handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">Nom *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Téléphone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Rôle *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="student">Étudiant</option>
                    <option value="employee">Employé</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                      Nom de l'institution *
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-sm text-muted mb-4">
                    <span className="font-semibold text-slate-300">Jour(s) sélectionné(s):</span>{' '}
                    <span className="text-primary font-bold">
                      {selectedDays.length === 3
                        ? 'Les 3 Jours'
                        : selectedDays.map(d => d === 'day1' ? 'Jour 1' : d === 'day2' ? 'Jour 2' : 'Jour 3').join(', ')}
                    </span>
                  </p>
                  {!showWaitlistForm && (
                    <p className="text-sm text-muted mb-4">
                      <span className="font-semibold text-slate-300">Siège(s) sélectionné(s):</span>{' '}
                      <span className="text-primary font-bold">
                        {selectedSeats.length > 0 ? selectedSeats.map(s => s.seat_number).join(', ') : 'Aucun'}
                      </span>
                    </p>
                  )}
                </div>

                {showWaitlistForm ? (
                  <button
                    type="submit"
                    disabled={submitting || selectedDays.length === 0}
                    className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
                  >
                    {submitting ? 'Inscription...' : 'Rejoindre la liste d\'attente'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={selectedSeats.length === 0 || submitting}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-opacity-90 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
                  >
                    {submitting ? 'Traitement...' : 'Compléter la Réservation'}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reservation;
