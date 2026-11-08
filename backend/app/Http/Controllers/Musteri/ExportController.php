<?php

namespace App\Http\Controllers\Musteri;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Support\BodyRegions;
use App\Support\MusteriPanel;
use Illuminate\Contracts\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function index(): View
    {
        return view('musteri.disa-aktar', [
            'customerCount' => Customer::query()->count(),
            'appointmentCount' => Appointment::query()->count(),
        ]);
    }

    public function customers(): StreamedResponse
    {
        $rows = [['ID', 'Ad', 'Telefon', 'E-posta', 'Instagram', 'Kaynak', 'Notlar', 'Kayıt tarihi']];

        foreach (Customer::query()->orderBy('id')->cursor() as $c) {
            $rows[] = [
                (string) $c->id,
                $c->name,
                $c->phone ?? '',
                $c->email ?? '',
                $c->instagram ?? '',
                Customer::HEARD_FROM[$c->heard_from] ?? ($c->heard_from ?? ''),
                $c->notes ?? '',
                $c->created_at?->format('d.m.Y H:i') ?? '',
            ];
        }

        return $this->csv('musteriler-'.now()->format('Y-m-d').'.csv', $rows);
    }

    public function appointments(): StreamedResponse
    {
        $rows = [['ID', 'Tarih', 'Saat', 'Müşteri', 'Telefon', 'Hizmet', 'Alt uygulamalar', 'Bölgeler', 'Seans', 'Süre (dk)', 'Durum', 'Kaynak', 'Tutar', 'Ödendi', 'Ödeme', 'Not']];

        $appointments = Appointment::query()
            ->with(['customer:id,name,phone', 'service:id,name_tr'])
            ->orderBy('id')
            ->cursor();

        foreach ($appointments as $a) {
            $rows[] = [
                (string) $a->id,
                $a->starts_at->format('d.m.Y'),
                $a->starts_at->format('H:i'),
                $a->customer?->name ?? '',
                $a->customer?->phone ?? '',
                $a->service?->name_tr ?? '',
                implode(', ', $a->subservices ?? []),
                BodyRegions::labels($a->body_regions),
                $a->isSessionPackage() ? "{$a->session_no}/{$a->session_total}" : '',
                (string) $a->duration_min,
                MusteriPanel::statusLabel($a->status),
                MusteriPanel::sourceLabel($a),
                $a->price === null ? '' : number_format((float) $a->price, 2, ',', '.'),
                $a->is_paid ? 'Evet' : 'Hayır',
                MusteriPanel::paymentLabel($a->payment_method),
                $a->note ?? '',
            ];
        }

        return $this->csv('randevular-tum-'.now()->format('Y-m-d').'.csv', $rows);
    }

    /**
     * @param  array<int, array<int, string>>  $rows
     */
    private function csv(string $filename, array $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            foreach ($rows as $row) {
                fputcsv($handle, $row, ';');
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }
}
