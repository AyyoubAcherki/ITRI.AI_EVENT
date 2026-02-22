<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmation finale de présence</title>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #002D61;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
        }
        h2 {
            color: #002D61;
            font-size: 20px;
            margin-top: 0;
        }
        p {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #718096;
            font-size: 14px;
        }
        .ticket-info {
            background-color: #ebf4ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #006AD7;
        }
        .highlight {
            color: #006AD7;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI ITRI NTIC EVENT</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{ $reservation->first_name }},</h2>
            <p>Nous approchons à grands pas de l'événement <span class="highlight">AI ITRI NTIC EVENT</span> !</p>
            <p>Ceci est une confirmation finale pour votre participation prévue. Nous sommes impatients de vous accueillir à Tanger.</p>
            
            <div class="ticket-info">
                <p style="margin: 0;"><strong>Référence de ticket :</strong> {{ $reservation->ticket_code }}</p>
                <p style="margin: 0;"><strong>Date de l'événement :</strong> Mai 2026</p>
                <p style="margin: 0;"><strong>Lieu :</strong> Tanger, Morocco</p>
            </div>

            <p>N'oubliez pas de télécharger votre ticket avec le code QR pour faciliter votre entrée.</p>
            
            <p>Si vous avez un empêchement de dernière minute, merci de nous en informer pour libérer votre place à une personne sur la liste d'attente.</p>
            
            <p>À bientôt !<br>L'équipe d'organisation AI ITRI NTIC EVENT</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 AI ITRI NTIC EVENT - Tanger, Morocco</p>
        </div>
    </div>
</body>
</html>
