<x-filament-panels::page>
    <style>
        .stria-reports {
            display: grid;
            gap: 18px;
        }

        .stria-report-card {
            border: 1px solid rgba(60, 60, 67, .14);
            border-radius: 14px;
            background: #fff;
            box-shadow: 0 1px 2px rgba(0, 0, 0, .03), 0 10px 28px rgba(0, 0, 0, .04);
        }

        .stria-reports-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 22px 24px;
        }

        .stria-reports-title {
            color: #1d1d1f;
            font-size: clamp(1.7rem, 3vw, 2.25rem);
            font-weight: 700;
            letter-spacing: -.035em;
            line-height: 1;
        }

        .stria-reports-period {
            display: flex;
            align-items: center;
            gap: 9px;
        }

        .stria-reports-segment {
            display: inline-grid;
            grid-template-columns: 38px minmax(130px, auto) 38px;
            overflow: hidden;
            border: 1px solid rgba(60, 60, 67, .2);
            border-radius: 8px;
            background: rgba(248, 248, 250, .96);
        }

        .stria-reports-segment button,
        .stria-reports-segment span,
        .stria-reports-current {
            min-height: 34px;
            border: 0;
            color: #3a3a3c;
            font-size: 13px;
            font-weight: 600;
        }

        .stria-reports-segment button {
            border-right: 1px solid rgba(60, 60, 67, .17);
            background: transparent;
            cursor: pointer;
        }

        .stria-reports-segment button:last-child { border-right: 0; border-left: 1px solid rgba(60, 60, 67, .17); }
        .stria-reports-segment button:hover { background: rgba(118, 118, 128, .1); }

        .stria-reports-segment span {
            display: grid;
            padding: 0 13px;
            place-items: center;
            white-space: nowrap;
        }

        .stria-reports-current {
            border: 1px solid rgba(60, 60, 67, .2);
            border-radius: 8px;
            padding: 0 13px;
            background: rgba(248, 248, 250, .96);
            cursor: pointer;
        }

        .stria-reports-current:hover { background: rgba(118, 118, 128, .1); }

        .stria-summary-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
        }

        .stria-summary-card { padding: 20px 22px; }

        .stria-summary-label,
        .stria-section-eyebrow {
            color: #8e8e93;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .06em;
            text-transform: uppercase;
        }

        .stria-summary-value {
            margin-top: 7px;
            color: #1d1d1f;
            font-size: clamp(1.55rem, 3vw, 2rem);
            font-weight: 700;
            letter-spacing: -.035em;
            line-height: 1.1;
        }

        .stria-summary-card.income { border-top: 3px solid #34c759; }
        .stria-summary-card.expense { border-top: 3px solid #ff9500; }
        .stria-summary-card.net-positive { border-top: 3px solid #34c759; }
        .stria-summary-card.net-negative { border-top: 3px solid #ff3b30; }
        .stria-summary-card.net-positive .stria-summary-value { color: #248a3d; }
        .stria-summary-card.net-negative .stria-summary-value { color: #d70015; }

        .stria-pending {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 15px 18px;
        }

        .stria-pending-label { color: #6e6e73; font-size: 13px; font-weight: 600; }
        .stria-pending-value { color: #9a6700; font-size: 15px; font-weight: 700; }

        .stria-breakdown-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
        }

        .stria-breakdown-card { padding: 20px 22px; }
        .stria-section-title { margin-top: 4px; color: #1d1d1f; font-size: 18px; font-weight: 700; letter-spacing: -.02em; }
        .stria-breakdown-list { margin-top: 16px; }

        .stria-breakdown-row {
            display: grid;
            grid-template-columns: minmax(80px, auto) minmax(80px, 1fr) auto;
            align-items: center;
            gap: 12px;
            min-height: 34px;
            border-top: 1px solid rgba(60, 60, 67, .1);
            color: #3a3a3c;
            font-size: 13px;
        }

        .stria-breakdown-row:first-child { border-top: 0; }
        .stria-breakdown-row strong { color: #1d1d1f; font-size: 13px; }

        .stria-breakdown-track {
            height: 5px;
            overflow: hidden;
            border-radius: 999px;
            background: #ededf0;
        }

        .stria-breakdown-fill { height: 100%; border-radius: inherit; background: #007aff; }
        .stria-expenses .stria-breakdown-fill { background: #ff9500; }

        .stria-table-card { overflow: hidden; }
        .stria-table-header { padding: 20px 22px 15px; }
        .stria-table-scroll { overflow-x: auto; }

        .stria-report-table {
            width: 100%;
            min-width: 620px;
            border-collapse: collapse;
            color: #3a3a3c;
            font-size: 13px;
        }

        .stria-report-table th {
            border-top: 1px solid rgba(60, 60, 67, .1);
            border-bottom: 1px solid rgba(60, 60, 67, .12);
            padding: 10px 22px;
            color: #8e8e93;
            background: #fafafa;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .06em;
            text-align: right;
            text-transform: uppercase;
        }

        .stria-report-table th:first-child,
        .stria-report-table td:first-child { text-align: left; }

        .stria-report-table td {
            border-bottom: 1px solid rgba(60, 60, 67, .09);
            padding: 12px 22px;
            text-align: right;
            white-space: nowrap;
        }

        .stria-report-table tbody tr:last-child td { border-bottom: 0; }
        .stria-report-table tbody tr:hover { background: #fafafa; }
        .stria-net-positive { color: #248a3d; font-weight: 700; }
        .stria-net-negative { color: #d70015; font-weight: 700; }

        @media (max-width: 800px) {
            .stria-summary-grid { grid-template-columns: 1fr; }
            .stria-breakdown-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
            .stria-reports-toolbar { align-items: flex-start; flex-direction: column; padding: 18px; }
            .stria-reports-period { align-items: stretch; flex-direction: column; width: 100%; }
            .stria-reports-segment { grid-template-columns: 38px 1fr 38px; }
            .stria-reports-current { width: 100%; }
        }
    </style>

    @php
        $formatMoney = static fn (float|int|string $value): string => number_format((float) $value, 2, ',', '.') . ' ₺';
    @endphp

    <div class="stria-reports">
        <header class="stria-report-card stria-reports-toolbar">
            <h1 class="stria-reports-title">Raporlar</h1>

            <div class="stria-reports-period">
                <nav class="stria-reports-segment" aria-label="Rapor ayı seçimi">
                    <button type="button" wire:click="prevMonth" aria-label="Önceki ay">‹</button>
                    <span>{{ $monthName }} {{ $monthYear }}</span>
                    <button type="button" wire:click="nextMonth" aria-label="Sonraki ay">›</button>
                </nav>
                <button type="button" class="stria-reports-current" wire:click="goCurrentMonth">Bu Ay</button>
            </div>
        </header>

        <section class="stria-summary-grid" aria-label="Aylık özet">
            <article class="stria-report-card stria-summary-card income">
                <div class="stria-summary-label">Gelir</div>
                <div class="stria-summary-value">{{ $formatMoney($summary['income']) }}</div>
            </article>

            <article class="stria-report-card stria-summary-card expense">
                <div class="stria-summary-label">Gider</div>
                <div class="stria-summary-value">{{ $formatMoney($summary['expense']) }}</div>
            </article>

            <article class="stria-report-card stria-summary-card {{ $summary['net'] >= 0 ? 'net-positive' : 'net-negative' }}">
                <div class="stria-summary-label">Net</div>
                <div class="stria-summary-value">{{ $formatMoney($summary['net']) }}</div>
            </article>
        </section>

        <section class="stria-report-card stria-pending" aria-label="Bekleyen tahsilat">
            <span class="stria-pending-label">Bekleyen tahsilat</span>
            <strong class="stria-pending-value">{{ $formatMoney($summary['pending']) }}</strong>
        </section>

        <section class="stria-breakdown-grid">
            <article class="stria-report-card stria-breakdown-card">
                <div class="stria-section-eyebrow">Gelir dağılımı</div>
                <h2 class="stria-section-title">Ödeme yöntemleri</h2>
                <div class="stria-breakdown-list">
                    @foreach ($paymentBreakdown as $label => $amount)
                        <div class="stria-breakdown-row">
                            <span>{{ $label }}</span>
                            <div class="stria-breakdown-track" aria-hidden="true">
                                <div
                                    class="stria-breakdown-fill"
                                    style="width: {{ $summary['income'] > 0 ? min(100, ($amount / $summary['income']) * 100) : 0 }}%"
                                ></div>
                            </div>
                            <strong>{{ $formatMoney($amount) }}</strong>
                        </div>
                    @endforeach
                </div>
            </article>

            <article class="stria-report-card stria-breakdown-card stria-expenses">
                <div class="stria-section-eyebrow">Gider dağılımı</div>
                <h2 class="stria-section-title">Kategoriler</h2>
                <div class="stria-breakdown-list">
                    @foreach ($expenseBreakdown as $label => $amount)
                        <div class="stria-breakdown-row">
                            <span>{{ $label }}</span>
                            <div class="stria-breakdown-track" aria-hidden="true">
                                <div
                                    class="stria-breakdown-fill"
                                    style="width: {{ $summary['expense'] > 0 ? min(100, ($amount / $summary['expense']) * 100) : 0 }}%"
                                ></div>
                            </div>
                            <strong>{{ $formatMoney($amount) }}</strong>
                        </div>
                    @endforeach
                </div>
            </article>
        </section>

        <section class="stria-report-card stria-table-card" aria-label="Son 12 aylık rapor">
            <header class="stria-table-header">
                <div class="stria-section-eyebrow">Finansal görünüm</div>
                <h2 class="stria-section-title">Son 12 ay</h2>
            </header>

            <div class="stria-table-scroll">
                <table class="stria-report-table">
                    <thead>
                        <tr>
                            <th>Ay</th>
                            <th>Gelir</th>
                            <th>Gider</th>
                            <th>Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($monthlyReports as $report)
                            <tr>
                                <td>{{ $report['month'] }}</td>
                                <td>{{ $formatMoney($report['income']) }}</td>
                                <td>{{ $formatMoney($report['expense']) }}</td>
                                <td class="{{ $report['net'] >= 0 ? 'stria-net-positive' : 'stria-net-negative' }}">
                                    {{ $formatMoney($report['net']) }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</x-filament-panels::page>
