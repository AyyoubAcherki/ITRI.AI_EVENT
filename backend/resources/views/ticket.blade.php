<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AI ITRI NTIC EVENT - Ticket</title>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            margin: 0;
            padding: 40px;
            background: #fff;
        }
        .ticket {
            border: 3px solid #006AD7;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #9AD9EA;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #21277B;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #5F83B1;
            margin: 5px 0 0;
            font-size: 14px;
        }
        .info {
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #9AD9EA;
        }
        .info-label {
            color: #5F83B1;
            font-weight: 600;
        }
        .info-value {
            color: #21277B;
            font-weight: 500;
        }
        .qr-section {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px dashed #006AD7;
        }
        .qr-section img {
            width: 150px;
            height: 150px;
        }
        .ticket-code {
            margin-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #006AD7;
            letter-spacing: 2px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #5F83B1;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <h1>AI ITRI NTIC EVENT</h1>
            <p>Tanger, Morocco</p>
        </div>
        
        <div class="info">
            <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">{{ $reservation->first_name }} {{ $reservation->last_name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ $reservation->email }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ $reservation->phone }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Role</span>
                <span class="info-value">{{ ucfirst($reservation->role) }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Days</span>
                <span class="info-value">
                    @foreach($reservation->days as $day)
                        {{ str_replace('day', 'Day ', $day) }}@if(!$loop->last), @endif
                    @endforeach
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Seats</span>
                <span class="info-value">
                    @foreach($reservation->seat_numbers as $seat)
                        {{ str_replace('day', 'Day ', $seat['day']) }}: {{ $seat['seat'] }}@if(!$loop->last), @endif
                    @endforeach
                </span>
            </div>
        </div>
        
        <div class="qr-section">
            <img src="data:image/png;base64,{{ $qrCode }}" alt="QR Code">
            <div class="ticket-code">{{ $reservation->ticket_code }}</div>
        </div>
        
        <div class="footer">
            <p>Please present this ticket at the entrance</p>
            <p>© 2026 AI ITRI NTIC EVENT - All Rights Reserved</p>
        </div>
    </div>
</body>
</html>
