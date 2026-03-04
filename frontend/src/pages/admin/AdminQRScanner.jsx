import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * AdminQRScanner Component
 * Allows admin to scan QR codes from tickets and validate them
 */
function AdminQRScanner() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const html5QrCode = useRef(null);
  const scanTimeoutRef = useRef(null);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Get available cameras and start scanning
    getCameras();

    return () => {
      stopScanner();
      // Clear timeout on unmount
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [navigate]);

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
        startScanner(devices[0].id);
      } else {
        setError('No cameras found');
      }
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('Error accessing camera: ' + err.message);
    }
  };

  const startScanner = async (cameraId) => {
    try {
      if (html5QrCode.current) {
        await stopScanner();
      }

      html5QrCode.current = new Html5Qrcode("qr-reader");

      const config = {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0
      };

      await html5QrCode.current.start(
        cameraId,
        config,
        onScanSuccess,
        onScanError
      );

      setScanning(true);
      setError(null);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Error starting camera: ' + err.message);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCode.current && html5QrCode.current.isScanning) {
        await html5QrCode.current.stop();
        await html5QrCode.current.clear();
      }
      html5QrCode.current = null;
      setScanning(false);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    // Prevent multiple scans - check if we're already processing or if this is the same code
    if (isProcessing || decodedText === lastScannedCode) {
      return;
    }

    // Immediately stop scanning and set processing state
    setIsProcessing(true);
    setLastScannedCode(decodedText);

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Stop scanner immediately
    await stopScanner();

    setScanResult(decodedText);
    validateQRCode(decodedText);

    // Reset processing after 3 seconds to allow for new scans
    scanTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
      setLastScannedCode(null);
    }, 3000);
  };

  const onScanError = (error) => {
    // Ignore scan errors (they happen frequently while searching)
    console.debug('QR Scan error:', error);
  };

  const validateQRCode = async (qrData) => {
    // Prevent multiple simultaneous validations
    if (loading) {
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8000/api/reservations/validate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_data: qrData, mark_as_used: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      console.error('Error validating QR code:', error);
      setValidationResult({
        valid: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsUsed = async (ticketCode) => {
    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const qrData = JSON.stringify({ ticket_code: ticketCode });
      const response = await fetch('http://localhost:8000/api/reservations/validate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_data: qrData, mark_as_used: true }), // Actually mark as used
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      setValidationResult({
        valid: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualValidation = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      // First, find the reservation by ticket code to get the email
      fetch('http://localhost:8000/api/reservations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
        .then(response => response.json())
        .then(reservations => {
          const reservation = reservations.find(r => r.ticket_code === manualCode.trim());
          if (reservation) {
            // Create QR data with both ticket_code and email (like real QR codes)
            const qrData = JSON.stringify({
              ticket_code: manualCode.trim(),
              email: reservation.email
            });
            setScanResult(qrData);
            validateQRCode(qrData);
          } else {
            // If ticket not found, still validate with just ticket code
            const qrData = JSON.stringify({ ticket_code: manualCode.trim() });
            setScanResult(qrData);
            validateQRCode(qrData);
          }
        })
        .catch(() => {
          // If API call fails, validate with just ticket code
          const qrData = JSON.stringify({ ticket_code: manualCode.trim() });
          setScanResult(qrData);
          validateQRCode(qrData);
        });
    }
  };

  const handleRestartScan = async () => {
    // Clear timeout if exists
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    setScanResult(null);
    setValidationResult(null);
    setError(null);
    setIsProcessing(false);
    setLastScannedCode(null);

    if (selectedCamera) {
      await startScanner(selectedCamera);
    }
  };

  const handleCameraChange = async (cameraId) => {
    // Clear timeout if exists
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    setSelectedCamera(cameraId);
    setIsProcessing(false);
    setLastScannedCode(null);
    await stopScanner();
    await startScanner(cameraId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shadow-lg shadow-secondary/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1l7 7m2 2l-2 2m-2 2l-7 7m-1-7l-7 7m-2-2l2-2m2-2l7-7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary uppercase tracking-tighter">
                Scanner QR Code
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
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* QR Scanner Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm italic">01</span>
              Numériser le billet
            </h2>

            {/* Camera Selection */}
            {cameras.length > 1 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <label className="block text-xs font-black text-muted uppercase mb-3 tracking-widest">
                  Choisir la Caméra
                </label>
                <div className="relative">
                  <select
                    value={selectedCamera}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none appearance-none"
                  >
                    {cameras.map((camera, index) => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label || `Caméra ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-shake">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* QR Viewer Area */}
            <div className="relative group">
              {!scanResult ? (
                <div className="rounded-3xl overflow-hidden border-4 border-gray-100 bg-gray-50 relative aspect-square md:aspect-video flex items-center justify-center">
                  <div id="qr-reader" className="w-full h-full"></div>

                  {scanning && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                        <div className="absolute inset-0 border-2 border-secondary rounded-3xl animate-pulse"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-secondary rounded-full"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-secondary rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-secondary rounded-full"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-secondary rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {!scanning && !error && (
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-gray-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      </div>
                      <button
                        onClick={handleRestartScan}
                        className="bg-secondary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:bg-primary transition-all active:scale-95"
                      >
                        Activer Caméra
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border-4 border-green-100 bg-green-50 aspect-square md:aspect-video flex flex-col items-center justify-center text-center p-10 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200 mb-6 animate-bounce">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-green-700 mb-2">Billet Détecté !</h3>
                  <p className="text-green-600 font-bold mb-8 text-sm uppercase tracking-wider">Analyse des données en cours...</p>
                  <button
                    onClick={handleRestartScan}
                    className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all active:scale-95"
                  >
                    Nouveau Scan
                  </button>
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="pt-8 border-t border-gray-50">
              <h3 className="text-xs font-black text-muted uppercase mb-4 tracking-widest">Saisie manuelle du code</h3>
              <form onSubmit={handleManualValidation} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="ex: ABC123456"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-gray-800 placeholder:font-medium placeholder:text-gray-300 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-black text-[10px] uppercase">Ticket ID</div>
                </div>
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-secondary transition-all active:scale-[0.98]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full min-h-[500px] flex flex-col">
            <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-sm italic">02</span>
              Résultat de Validation
            </h2>

            <div className="flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-pulse">
                  <div className="w-20 h-20 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-gray-800 font-black uppercase tracking-widest mb-1">Vérification...</p>
                    <p className="text-muted text-sm">Consultation de la base de données ITRI</p>
                  </div>
                </div>
              ) : !validationResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-40">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8 border-4 border-dashed border-gray-200">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="font-black text-gray-400 uppercase tracking-widest text-sm">En attente d'un scan ou d'une saisie</p>
                </div>
              ) : (
                <div className={`p-8 rounded-3xl flex flex-col ${validationResult.valid
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
                  } animate-in fade-in zoom-in-95 duration-500`}>

                  {/* Big Status Banner */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${validationResult.valid ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'
                      }`}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {validationResult.valid
                          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        }
                      </svg>
                    </div>
                    <div>
                      <h3 className={`text-3xl font-black uppercase tracking-tighter ${validationResult.valid ? 'text-green-700' : 'text-red-700'
                        }`}>
                        {validationResult.valid ? 'BILLET VALIDE' : 'BILLET INVALIDE'}
                      </h3>
                      <p className={`font-bold mt-1 ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                        {validationResult.message}
                      </p>
                    </div>
                  </div>

                  {/* Reservation Details Card */}
                  {validationResult.reservation && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col gap-6">
                      <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <div>
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Détenteur du billet</p>
                          <h4 className="text-xl font-black text-gray-800 tracking-tight">
                            {validationResult.reservation.first_name} {validationResult.reservation.last_name}
                          </h4>
                        </div>
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                          {validationResult.reservation.role === 'student' ? 'Étudiant' : 'Employé'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Email</p>
                          <p className="text-sm font-bold text-gray-700 break-all">{validationResult.reservation.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Téléphone</p>
                          <p className="text-sm font-bold text-gray-700">{validationResult.reservation.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Jours Réservés</p>
                          <div className="flex gap-1 mt-1">
                            {validationResult.reservation.days?.map(d => (
                              <span key={d} className="w-5 h-5 bg-secondary text-white text-[9px] flex items-center justify-center rounded-sm font-bold shadow-sm">
                                {d === 'day1' ? 'J1' : d === 'day2' ? 'J2' : 'J3'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Ticket ID</p>
                          <code className="text-xs font-black text-secondary bg-blue-50 px-2 py-0.5 rounded">{validationResult.reservation.ticket_code}</code>
                        </div>
                      </div>

                      {/* Usage Alert */}
                      {validationResult.max_scans && (
                        <div className={`mt-2 p-4 rounded-xl flex items-center justify-between ${validationResult.scan_count >= validationResult.max_scans
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{validationResult.scan_count >= validationResult.max_scans ? '⛔' : '⚠️'}</span>
                            <div className="text-sm">
                              <p className="font-black uppercase tracking-tighter">Statut d'utilisation</p>
                              <p className="font-medium opacity-80">{validationResult.scan_count} / {validationResult.max_scans} entrées utilisées</p>
                            </div>
                          </div>
                          <div className="font-black text-xl">
                            {Math.round((validationResult.scan_count / validationResult.max_scans) * 100)}%
                          </div>
                        </div>
                      )}

                      {/* Check-in Button */}
                      {validationResult.valid && !validationResult.is_used && (
                        <div className="mt-2">
                          <button
                            onClick={() => markTicketAsUsed(validationResult.reservation.ticket_code)}
                            className="w-full bg-secondary text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                            Confirmer Entrée (Check-in)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Table */}
        <div className="mt-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Protocole de Validation
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-secondary border border-gray-100 shrink-0">1</div>
              <div>
                <h4 className="font-black text-gray-800 text-sm mb-1">Cadrage</h4>
                <p className="text-muted text-xs font-medium leading-relaxed">Positionnez le QR code de l'attendee dans le cadre de détection au centre de l'écran.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-secondary border border-gray-100 shrink-0">2</div>
              <div>
                <h4 className="font-black text-gray-800 text-sm mb-1">Vérification</h4>
                <p className="text-muted text-xs font-medium leading-relaxed">Contrôlez la couleur du bandeau (Vert: OK, Rouge: Erreur) et les détails de l'identité.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-secondary border border-gray-100 shrink-0">3</div>
              <div>
                <h4 className="font-black text-gray-800 text-sm mb-1">Check-in</h4>
                <p className="text-muted text-xs font-medium leading-relaxed">Cliquez sur "Confirmer Entrée" pour décompter une utilisation du pass ITRI de l'utilisateur.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminQRScanner;
