<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmation de réservation</title>
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI ITRI NTIC EVENT</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{ $reservation->first_name }},</h2>
            <p>Merci pour votre intérêt pour l'événement <span class="highlight">AI ITRI NTIC EVENT</span>. Nous avons bien reçu votre demande de réservation.</p>
            <p>Pour confirmer votre place et finaliser votre inscription, veuillez cliquer sur le bouton ci-dessous :</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $confirmationUrl }}" class="button" style="background-color: #006AD7; margin-right: 10px;">Confirmer ma présence</a>
                <a href="{{ $cancellationUrl }}" class="button" style="background-color: #e53e3e;">Annuler ma réservation</a>
            </div>

            <p>Si vous ne souhaitez plus participer, veuillez cliquer sur **Annuler** pour libérer votre place pour une personne sur la liste d'attente.</p>
            
            <p>Une fois confirmé, vous recevrez vos informations de participation. Nous vous recontacterons également <span class="highlight">10 jours avant l'événement</span> pour une dernière confirmation.</p>
            
            <p>Cordialement,<br>L'équipe d'organisation AI ITRI NTIC EVENT</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 AI ITRI NTIC EVENT - Tanger, Morocco</p>
            <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
        </div>
    </div>
</body>
</html>
