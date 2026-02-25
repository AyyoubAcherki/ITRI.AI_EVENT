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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">QR Code Scanner</h1>
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
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Scan Ticket QR Code</h2>

            {/* Camera Selection */}
            {cameras.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Camera:
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  {cameras.map((camera, index) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {!scanResult ? (
              <div>
                <div id="qr-reader" className="w-full"></div>
                {scanning && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 mb-2">Point the camera at a QR code to scan</p>
                    <button
                      onClick={() => stopScanner()}
                      className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600"
                    >
                      Stop Scanning
                    </button>
                  </div>
                )}
                {!scanning && !error && (
                  <div className="text-center mt-4">
                    <button
                      onClick={handleRestartScan}
                      className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-accent"
                    >
                      Start Camera
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">QR Code scanned successfully!</p>
                </div>
                <button
                  onClick={handleRestartScan}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-accent"
                >
                  Scan Again
                </button>
              </div>
            )}

            {/* Manual Entry */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-gray-700 mb-3">Or Enter Ticket Code Manually</h3>
              <form onSubmit={handleManualValidation} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Enter ticket code (e.g., ABC12345)"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary text-gray-900 font-semibold"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600"
                >
                  Validate
                </button>
              </form>
            </div>
          </div>

          {/* Validation Result */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Validation Result</h2>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Validating ticket...</p>
              </div>
            )}

            {!loading && !validationResult && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p>Scan a QR code or enter a ticket code to validate</p>
              </div>
            )}

            {!loading && validationResult && (
              <div className={`p-6 rounded-lg ${validationResult.valid
                ? 'bg-green-100 border-2 border-green-500'
                : 'bg-red-100 border-2 border-red-500'
                }`}>
                {/* Status Icon */}
                <div className="text-center mb-4">
                  {validationResult.valid ? (
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Status Message */}
                <h3 className={`text-2xl font-bold text-center mb-4 ${validationResult.valid ? 'text-green-700' : 'text-red-700'
                  }`}>
                  {validationResult.valid ? 'VALID TICKET' : 'INVALID TICKET'}
                </h3>

                <p className={`text-center mb-4 ${validationResult.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {validationResult.message}
                </p>

                {/* Reservation Details (if available) */}
                {validationResult.reservation && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <h4 className="font-bold text-gray-700 mb-2">Attendee Details:</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Name:</span> {validationResult.reservation.first_name} {validationResult.reservation.last_name}</p>
                      <p><span className="font-semibold">Email:</span> {validationResult.reservation.email}</p>
                      <p><span className="font-semibold">Phone:</span> {validationResult.reservation.phone}</p>
                      <p><span className="font-semibold">Role:</span> {validationResult.reservation.role}</p>
                      <p><span className="font-semibold">Days:</span> {validationResult.reservation.days?.join(', ')}</p>
                      <p><span className="font-semibold">Ticket Code:</span> {validationResult.reservation.ticket_code}</p>
                      {validationResult.max_scans && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800 font-semibold">
                          ⚠️ Scans Type: {validationResult.scan_count} / {validationResult.max_scans} utilisés
                        </div>
                      )}
                    </div>

                    {/* Mark as Used button for tickets that still have scans allowed */}
                    {validationResult.valid && !validationResult.is_used && (
                      <div className="mt-4">
                        <button
                          onClick={() => markTicketAsUsed(validationResult.reservation.ticket_code)}
                          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                        >
                          Mark as Used (Check In)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Point the camera at the QR code on the attendee's ticket</li>
            <li>The system will automatically detect and validate the QR code</li>
            <li>Green result = Valid ticket (attendee can enter)</li>
            <li>Red result = Invalid or fully used ticket (all allowed scans depleted)</li>
            <li>The ticket allows 1 scan per booked day (e.g., 3 days = 3 scans permitted)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminQRScanner;
