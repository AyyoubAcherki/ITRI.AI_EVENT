<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Action Requise : Confirmez votre réservation</title>
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
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

        .button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #006AD7;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #718096;
            font-size: 14px;
        }

        .highlight {
            color: #006AD7;
            font-weight: bold;
        }

        .alert {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>AI ITRI NTIC EVENT</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{ $reservation->first_name }} {{ $reservation->last_name }},</h2>
            <p>Le grand jour approche ! C'est le moment de nous confirmer votre présence à l'événement <span class="highlight">AI ITRI NTIC EVENT</span>.</p>

            <p>Veuillez cliquer sur le bouton ci-dessous pour confirmer définitivement votre place :</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $confirmationUrl }}" class="button" style="background-color: #006AD7; margin-right: 10px;">Je confirme ma participation</a>
                <a href="{{ $cancellationUrl }}" class="button" style="background-color: #e53e3e;">J'annule ma réservation</a>
            </div>

            <div class="alert">
                <strong>Attention :</strong> Si vous ne confirmez pas votre réservation d'ici <strong>48 heures</strong>, votre place sera automatiquement annulée et réattribuée à une personne sur la liste d'attente.
            </div>

            <p>Une fois confirmé, vous pourrez finaliser et télécharger votre billet d'accès.</p>

            <p>Cordialement,<br>L'équipe d'organisation AI ITRI NTIC EVENT</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 AI ITRI NTIC EVENT - Tanger, Morocco</p>
        </div>
    </div>
</body>

</html>