<?php

namespace App\Http\Controllers;

use App\Models\HackathonRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class HackathonController extends Controller
{
    /**
     * Store a newly created hackathon registration.
     */
    public function register(Request $request)
    {
        // Validation logic
        $validator = Validator::make($request->all(), [
            'cni' => 'required|string|unique:hackathon_registrations,cni',
            'email' => 'required|email|unique:hackathon_registrations,email',
            'phone' => 'required|string|unique:hackathon_registrations,phone',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'fonctionnalite' => 'required|in:etudiant,employer',
            'etablissement' => 'required_if:fonctionnalite,etudiant|max:255',
            'entreprise' => 'required_if:fonctionnalite,employer|max:255',
        ], [
            'cni.unique' => 'Cette CNI est déjà inscrite.',
            'email.unique' => 'Cet email est déjà inscrit.',
            'phone.unique' => 'Ce numéro de téléphone est déjà inscrit.',
            'etablissement.required_if' => 'L\'établissement est obligatoire pour un étudiant.',
            'entreprise.required_if' => 'L\'entreprise est obligatoire pour un employé.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Nullify unused fields
            $data = $validator->validated();
            if ($data['fonctionnalite'] === 'etudiant') {
                $data['entreprise'] = null;
            } else {
                $data['etablissement'] = null;
            }

            // Generate unique ticket code
            $data['ticket_code'] = 'HACK-' . strtoupper(substr(uniqid(), -6));

            $registration = HackathonRegistration::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Inscription au hackathon réussie',
                'data' => $registration
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the hackathon registrations (For Admin).
     */
    public function index()
    {
        // Basic ordered list of registrations
        try {
            $registrations = HackathonRegistration::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $registrations
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données',
            ], 500);
        }
    }

    /**
     * Update the status of a hackathon registration.
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $registration = HackathonRegistration::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,confirmed,canceled',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Statut invalide',
                    'errors' => $validator->errors()
                ], 422);
            }

            $registration->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'data' => $registration
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a hackathon registration.
     */
    public function destroy($id)
    {
        try {
            $registration = HackathonRegistration::findOrFail($id);
            $registration->delete();

            return response()->json([
                'success' => true,
                'message' => 'Inscription supprimée avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate a QR code (Admin only) for Hackathon
     */
    public function validateQR(Request $request)
    {
        $request->validate([
            'qr_data' => 'required|string',
        ]);

        try {
            $data = json_decode($request->qr_data, true);

            if (!isset($data['ticket_code'])) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Format QR invalide',
                ], 400);
            }

            $registration = HackathonRegistration::where('ticket_code', $data['ticket_code'])->first();

            if (!$registration) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Billet Hackathon introuvable',
                ]);
            }

            // Map HackathonRegistration fields to Reservation equivalent for frontend compatibility
            $mappedReservation = [
                'id' => $registration->id,
                'first_name' => $registration->prenom,
                'last_name' => $registration->nom,
                'institution_name' => $registration->fonctionnalite === 'etudiant' ? $registration->etablissement : $registration->entreprise,
                'role' => $registration->fonctionnalite === 'etudiant' ? 'student' : 'employee',
                'email' => $registration->email,
                'phone' => $registration->phone,
                'days' => ['day1', 'day2', 'day3'], // Hackathon access
                'ticket_code' => $registration->ticket_code,
                'status' => $registration->status,
            ];

            if ($registration->status !== 'confirmed') {
                return response()->json([
                    'valid' => false,
                    'message' => 'Inscription non confirmée (Statut: ' . $registration->status . ')',
                    'reservation' => $mappedReservation
                ]);
            }

            if ($registration->is_scanned) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Billet DÈJÀ SCANNÉ !',
                    'reservation' => $mappedReservation,
                    'scan_count' => 1,
                    'max_scans' => 1,
                ]);
            }

            $markAsUsed = $request->input('mark_as_used', false);

            if ($markAsUsed) {
                $registration->update([
                    'is_scanned' => true,
                    'scanned_at' => now(),
                ]);
                $message = "Billet Hackathon validé avec succès !";
            } else {
                $message = "Billet Hackathon valide (Prêt à être scanné)";
            }

            return response()->json([
                'valid' => true,
                'message' => $message,
                'reservation' => $mappedReservation,
                'is_used' => $registration->is_scanned,
                'scan_count' => $registration->is_scanned ? 1 : 0,
                'max_scans' => 1,
                'scanned_at' => $registration->scanned_at,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Erreur lors de la lecture du QR',
            ], 400);
        }
    }
}
