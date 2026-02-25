<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>AI ITRI NTIC EVENT - Une place s'est libérée !</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px;">
        <h2 style="color: #0f172a; margin-top: 0;">Excellente nouvelle {{ $waitlist->first_name }},</h2>

        <p>Une place vient de se libérer pour l'événement <strong>AI ITRI NTIC EVENT (ISTA NTIC)</strong> !</p>

        <p>Comme vous étiez sur notre liste d'attente, nous vous offrons la possibilité de vous inscrire dès maintenant. Attention, les places partent très vite, premier arrivé, premier servi.</p>

        <div style="margin: 30px 0; text-align: center;">
            <a href="{{ $reservationUrl }}" style="background-color: #006AD7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Réserver ma place maintenant
            </a>
        </div>

        <p>Si vous n'êtes plus intéressé(e), veuillez simplement ignorer cet e-mail.</p>

        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 30px 0;">

        <p style="color: #64748b; font-size: 14px; text-align: center;">
            Ceci est un e-mail automatique généré par le système de billetterie d'ITRI TECH.<br>
            Merci de ne pas y répondre directement.
        </p>
    </div>
</body>

</html>