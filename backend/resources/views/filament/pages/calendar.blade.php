<x-filament-panels::page>
    <style>
        [x-cloak] { display: none !important; }

        .stria-calendar-shell {
            overflow: hidden;
            border: 1px solid rgba(60, 60, 67, .14);
            border-radius: 14px;
            background: #fff;
            box-shadow: 0 1px 2px rgba(0, 0, 0, .03), 0 10px 28px rgba(0, 0, 0, .04);
        }

        .stria-calendar-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 22px 24px 18px;
        }

        .stria-calendar-title {
            color: #1d1d1f;
            font-size: clamp(1.7rem, 3vw, 2.25rem);
            font-weight: 400;
            letter-spacing: -.035em;
            line-height: 1;
        }

        .stria-calendar-title strong { font-weight: 700; }

        .stria-calendar-segment {
            display: inline-grid;
            grid-template-columns: 38px auto 38px;
            overflow: hidden;
            border: 1px solid rgba(60, 60, 67, .2);
            border-radius: 8px;
            background: rgba(248, 248, 250, .96);
        }

        .stria-calendar-segment button {
            min-height: 32px;
            padding: 0 11px;
            border: 0;
            border-right: 1px solid rgba(60, 60, 67, .17);
            color: #3a3a3c;
            background: transparent;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
        }

        .stria-calendar-segment button:last-child { border-right: 0; }
        .stria-calendar-segment button:hover { background: rgba(118, 118, 128, .1); }

        .stria-calendar-scroll { overflow-x: auto; }
        .stria-calendar-inner { min-width: 826px; }

        .stria-weekdays {
            display: grid;
            grid-template-columns: repeat(7, minmax(118px, 1fr));
            padding: 0 0 7px;
        }

        .stria-weekdays div {
            padding-right: 10px;
            color: #8e8e93;
            font-size: 10px;
            font-weight: 650;
            letter-spacing: .075em;
            text-align: right;
            text-transform: uppercase;
        }

        .stria-calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, minmax(118px, 1fr));
            border-top: .5px solid rgba(60, 60, 67, .18);
        }

        .stria-calendar-day {
            position: relative;
            min-height: 126px;
            padding: 31px 7px 7px;
            border-right: .5px solid rgba(60, 60, 67, .18);
            border-bottom: .5px solid rgba(60, 60, 67, .18);
            background: #fff;
            cursor: default;
            transition: background 100ms ease;
        }

        .stria-calendar-day:nth-child(7n) { border-right: 0; }
        .stria-calendar-day:hover { background: #fafafa; }
        .stria-calendar-day.is-outside { background: #fbfbfc; }

        .stria-day-number {
            position: absolute;
            top: 6px;
            right: 8px;
            display: grid;
            width: 23px;
            height: 23px;
            place-items: center;
            border-radius: 999px;
            color: #3a3a3c;
            font-size: 12px;
            font-weight: 500;
        }

        .is-outside .stria-day-number { color: #c7c7cc; }

        .stria-day-number.is-today {
            color: #fff;
            background: #ff3b30;
            font-weight: 700;
        }

        .stria-appointment-pill {
            display: block;
            width: 100%;
            margin-bottom: 3px;
            overflow: hidden;
            border: 0;
            border-radius: 5px;
            padding: 4px 6px;
            color: #155a9c;
            background: #e9f3ff;
            font-size: 11px;
            font-weight: 600;
            line-height: 1.2;
            text-align: left;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
        }

        .stria-appointment-pill:hover { background: #dcecff; }

        .stria-appointment-pill.is-unpaid {
            color: #c81e1e;
            background: #ffe5e5;
        }

        .stria-appointment-pill.is-unpaid:hover { background: #ffd6d6; }

        .stria-appointment-pill.is-requested {
            border: 1px dashed #d97706;
            color: #92400e;
            background: #fef3c7;
        }

        .stria-appointment-pill.is-requested:hover { background: #fde68a; }

        .stria-appointment-pill.is-noshow {
            color: #6b7280;
            background: #e5e7eb;
            text-decoration: line-through;
        }

        .stria-appointment-pill.is-noshow:hover { background: #d1d5db; }

        .stria-more {
            padding: 2px 6px;
            color: #6e6e73;
            font-size: 10px;
            font-weight: 600;
        }

        .stria-context-menu {
            position: fixed;
            z-index: 70;
            width: 178px;
            overflow: hidden;
            border: 1px solid rgba(60, 60, 67, .16);
            border-radius: 9px;
            padding: 5px;
            background: rgba(255, 255, 255, .98);
            box-shadow: 0 14px 40px rgba(0, 0, 0, .18), 0 2px 8px rgba(0, 0, 0, .08);
            backdrop-filter: blur(18px);
        }

        .stria-context-menu button {
            width: 100%;
            border: 0;
            border-radius: 6px;
            padding: 8px 9px;
            color: #1d1d1f;
            background: transparent;
            font-size: 12px;
            font-weight: 500;
            text-align: left;
            cursor: pointer;
        }

        .stria-context-menu button:hover { background: #f2f2f7; }

        .stria-modal-backdrop {
            position: fixed;
            z-index: 60;
            inset: 0;
            display: grid;
            overflow-y: auto;
            place-items: center;
            padding: 24px;
            background: rgba(0, 0, 0, .32);
            backdrop-filter: blur(3px);
        }

        .stria-modal {
            width: min(100%, 560px);
            overflow: visible;
            border: 1px solid rgba(60, 60, 67, .18);
            border-radius: 16px;
            background: #fff;
            box-shadow: 0 24px 80px rgba(0, 0, 0, .25);
        }

        .stria-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 22px 14px;
        }

        .stria-modal-header h2 {
            color: #1d1d1f;
            font-size: 19px;
            font-weight: 700;
            letter-spacing: -.02em;
        }

        .stria-close {
            display: grid;
            width: 28px;
            height: 28px;
            place-items: center;
            border: 0;
            border-radius: 999px;
            color: #6e6e73;
            background: #ededf0;
            font-size: 18px;
            cursor: pointer;
        }

        .stria-modal-body {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 15px;
            padding: 8px 22px 20px;
        }

        .stria-field { position: relative; }
        .stria-field.is-full { grid-column: 1 / -1; }

        .stria-label {
            display: block;
            margin-bottom: 6px;
            color: #3a3a3c;
            font-size: 12px;
            font-weight: 650;
        }

        .stria-input {
            display: block;
            width: 100%;
            min-height: 39px;
            border: 1px solid #d1d1d6;
            border-radius: 8px;
            padding: 8px 10px;
            color: #1d1d1f;
            outline: none;
            background: #fff;
            font-size: 14px;
        }

        textarea.stria-input { min-height: 82px; resize: vertical; }
        .stria-input:focus { border-color: #0a84ff; box-shadow: 0 0 0 3px rgba(10, 132, 255, .13); }

        .stria-checkbox {
            display: flex;
            align-items: center;
            gap: 9px;
            cursor: pointer;
        }

        .stria-checkbox input {
            width: 16px;
            height: 16px;
            accent-color: #007aff;
        }

        .stria-customer-results {
            position: absolute;
            z-index: 80;
            top: calc(100% + 5px);
            right: 0;
            left: 0;
            max-height: 190px;
            overflow-y: auto;
            border: 1px solid rgba(60, 60, 67, .18);
            border-radius: 9px;
            padding: 4px;
            background: #fff;
            box-shadow: 0 12px 30px rgba(0, 0, 0, .16);
        }

        .stria-customer-results button {
            display: block;
            width: 100%;
            border: 0;
            border-radius: 6px;
            padding: 8px;
            color: #1d1d1f;
            background: transparent;
            text-align: left;
            cursor: pointer;
        }

        .stria-customer-results button:hover { background: #f2f2f7; }
        .stria-customer-results small { display: block; color: #8e8e93; }

        .stria-inline-action {
            margin-top: 7px;
            border: 0;
            padding: 0;
            color: #007aff;
            background: transparent;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }

        .stria-photo-heading {
            display: flex;
            align-items: baseline;
            gap: 6px;
            margin-bottom: 8px;
        }

        .stria-photo-heading .stria-label { margin-bottom: 0; }
        .stria-photo-heading small { color: #8e8e93; font-size: 11px; }

        .stria-photo-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
        }

        .stria-photo-thumb {
            position: relative;
            width: 68px;
            height: 68px;
        }

        .stria-photo-thumb img {
            width: 100%;
            height: 100%;
            border: 1px solid rgba(60, 60, 67, .14);
            border-radius: 8px;
            object-fit: cover;
        }

        .stria-photo-remove {
            position: absolute;
            top: -5px;
            right: -5px;
            display: grid;
            width: 19px;
            height: 19px;
            place-items: center;
            border: 2px solid #fff;
            border-radius: 999px;
            padding: 0;
            color: #fff;
            background: #3a3a3c;
            font-size: 12px;
            line-height: 1;
            cursor: pointer;
        }

        .stria-photo-add {
            display: inline-flex;
            align-items: center;
            min-height: 34px;
            border: 1px solid #d1d1d6;
            border-radius: 8px;
            padding: 6px 10px;
            color: #007aff;
            background: #fff;
            font-size: 12px;
            font-weight: 650;
            cursor: pointer;
        }

        .stria-photo-add:hover { background: #f2f2f7; }

        .stria-photo-input {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
        }

        .stria-photo-loading {
            margin-left: 8px;
            color: #8e8e93;
            font-size: 11px;
        }

        .stria-error { margin-top: 4px; color: #d70015; font-size: 11px; }

        .stria-hint {
            padding: 10px 12px;
            border-radius: 10px;
            background: #f2f2f7;
            color: #6e6e73;
            font-size: 12px;
            line-height: 1.45;
            text-align: center;
        }

        .stria-customer-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
        }

        .stria-customer-stats .stria-stat {
            display: inline-flex;
            align-items: center;
            padding: 3px 9px;
            border-radius: 999px;
            background: #f2f2f7;
            color: #6e6e73;
            font-size: 11px;
            font-weight: 500;
        }

        .stria-customer-stats .stria-stat.is-first { color: #92400e; background: #fef3c7; }

        .stria-modal-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            border-top: 1px solid rgba(60, 60, 67, .12);
            padding: 14px 22px 18px;
        }

        .stria-modal-footer-right { display: flex; gap: 8px; margin-left: auto; }

        .stria-button {
            min-height: 36px;
            border: 0;
            border-radius: 8px;
            padding: 7px 14px;
            font-size: 13px;
            font-weight: 650;
            cursor: pointer;
        }

        .stria-button.secondary { color: #3a3a3c; background: #ededf0; }
        .stria-button.primary { color: #fff; background: #007aff; }
        .stria-button.danger { color: #d70015; background: #ffe9e8; }
        .stria-button:disabled { opacity: .55; cursor: wait; }

        .stria-session-intro {
            margin: 6px 0 10px;
            color: #6e6e73;
            font-size: 12px;
            line-height: 1.45;
        }

        .stria-session-split {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 10px;
        }

        .stria-session-heading {
            display: flex;
            align-items: baseline;
            gap: 6px;
            margin-bottom: 8px;
        }

        .stria-session-heading .stria-label { margin-bottom: 0; }
        .stria-session-heading small { color: #8e8e93; font-size: 11px; }

        .stria-session-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 8px;
        }

        .stria-session-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            border: 1px solid rgba(60, 60, 67, .16);
            border-radius: 10px;
            padding: 8px 11px;
            background: #fff;
        }

        .stria-session-row.is-current {
            border-color: rgba(10, 132, 255, .4);
            background: #f2f8ff;
        }

        .stria-session-info {
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            gap: 8px;
            color: #3a3a3c;
            font-size: 12px;
        }

        .stria-session-info strong { font-weight: 650; }
        .stria-session-status { color: #6e6e73; font-size: 11px; }

        .stria-session-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .stria-session-actions .stria-inline-action { margin-top: 0; }
        .stria-session-remove { color: #d70015; }
        .stria-session-current { color: #8e8e93; font-size: 11px; font-weight: 600; }

        .stria-session-payment-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            border: 1px solid rgba(60, 60, 67, .16);
            border-radius: 10px;
            padding: 8px 11px;
            background: #f7f7fa;
            color: #3a3a3c;
            font-size: 13px;
            font-weight: 600;
        }

        .stria-session-locked-note {
            display: block;
            margin-top: 6px;
            color: #8e8e93;
            font-size: 11px;
        }

        @media (max-width: 640px) {
            .stria-calendar-toolbar { align-items: flex-start; flex-direction: column; padding: 18px; }
            .stria-modal-body { grid-template-columns: 1fr; }
            .stria-field.is-full { grid-column: auto; }
            .stria-session-split { grid-template-columns: 1fr; }
            .stria-modal-footer { align-items: stretch; flex-direction: column; }
            .stria-modal-footer-right { width: 100%; margin-left: 0; }
            .stria-modal-footer-right .stria-button { flex: 1; }
        }
    </style>

    <div x-data="{ contextMenu: null }" @click="contextMenu = null">
        <section class="stria-calendar-shell" aria-label="Randevu takvimi">
            <header class="stria-calendar-toolbar">
                <h1 class="stria-calendar-title">
                    <strong>{{ $monthName }}</strong> {{ $monthYear }}
                </h1>

                <nav class="stria-calendar-segment" aria-label="Ay seçimi">
                    <button type="button" wire:click="prevMonth" aria-label="Önceki ay">‹</button>
                    <button type="button" wire:click="goToday">Bugün</button>
                    <button type="button" wire:click="nextMonth" aria-label="Sonraki ay">›</button>
                </nav>
            </header>

            <div class="stria-calendar-scroll">
                <div class="stria-calendar-inner">
                    <div class="stria-weekdays" aria-hidden="true">
                        @foreach (['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] as $weekday)
                            <div>{{ $weekday }}</div>
                        @endforeach
                    </div>

                    <div class="stria-calendar-grid">
                        @foreach ($calendarDays as $day)
                            <div
                                wire:key="calendar-day-{{ $day['date'] }}"
                                class="stria-calendar-day {{ $day['isCurrentMonth'] ? '' : 'is-outside' }}"
                                @click="$wire.openCreateModal('{{ $day['date'] }}'); contextMenu = null"
                                @contextmenu.prevent="contextMenu = { date: '{{ $day['date'] }}', x: $event.clientX, y: $event.clientY }"
                            >
                                <span class="stria-day-number {{ $day['isToday'] ? 'is-today' : '' }}">
                                    {{ $day['day'] }}
                                </span>

                                @foreach (array_slice($day['appointments'], 0, 3) as $appointment)
                                    <button
                                        type="button"
                                        class="stria-appointment-pill {{ $appointment['is_paid'] ? '' : 'is-unpaid' }} {{ $appointment['status'] === 'requested' ? 'is-requested' : '' }} {{ $appointment['status'] === 'no_show' ? 'is-noshow' : '' }}"
                                        title="{{ $appointment['time'] }} {{ $appointment['customer'] }}{{ $appointment['session_label'] ? ' · '.$appointment['session_label'] : '' }}"
                                        @click.stop="$wire.openEditModal({{ $appointment['id'] }})"
                                    >
                                        {{ $appointment['has_app_user'] ? '📱' : '' }} {{ $appointment['time'] }} {{ $appointment['customer'] }}@if ($appointment['session_label']) · {{ $appointment['session_label'] }}@endif
                                    </button>
                                @endforeach

                                @if ($day['overflow'] > 0)
                                    <div class="stria-more">+{{ $day['overflow'] }} daha</div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </section>

        <div
            x-cloak
            x-show="contextMenu"
            class="stria-context-menu"
            :style="contextMenu ? `left: ${Math.min(contextMenu.x, window.innerWidth - 190)}px; top: ${Math.min(contextMenu.y, window.innerHeight - 55)}px` : ''"
            @click.stop
        >
            <button
                type="button"
                @click="$wire.openCreateModal(contextMenu.date); contextMenu = null"
            >
                ➕ Randevu Ekle
            </button>
        </div>

        @if ($showAppointmentModal)
            <div
                class="stria-modal-backdrop"
                wire:key="appointment-modal-{{ $editingAppointmentId ?? 'new' }}"
                wire:click.self="closeAppointmentModal"
                @keydown.escape.window="$wire.closeAppointmentModal()"
            >
                <form
                    class="stria-modal"
                    wire:submit="{{ $editingAppointmentId ? 'updateAppointment' : 'createAppointment' }}"
                    @click.stop
                >
                    <header class="stria-modal-header">
                        <h2>{{ $editingAppointmentId ? ($sessionTotal ? 'Randevuyu Düzenle · '.$sessionNo.'/'.$sessionTotal.'. seans' : 'Randevuyu Düzenle') : 'Randevu Ekle' }}</h2>
                        <button type="button" class="stria-close" wire:click="closeAppointmentModal" aria-label="Kapat">×</button>
                    </header>

                    <div class="stria-modal-body" x-data="{ isPaid: @js($is_paid) }">
                        @if ($appointmentCampaign)
                            <div class="stria-field is-full">
                                <div class="stria-campaign-note">
                                    🏷 {{ $appointmentCampaign['title'] }}
                                    @if (! empty($appointmentCampaign['new_price']))
                                        — kampanya fiyatı ₺{{ $appointmentCampaign['new_price'] }}
                                    @endif
                                </div>
                            </div>
                        @endif

                        @if ($isSessionChild)
                            <div class="stria-field is-full">
                                <label class="stria-label" for="customer-locked">Müşteri</label>
                                <input id="customer-locked" type="text" class="stria-input" value="{{ $selectedCustomerName }}" disabled>
                                <small class="stria-session-locked-note">Paketin 1. seansında yönetilir</small>
                            </div>
                        @elseif (! $creatingCustomer)
                            <div
                                class="stria-field is-full"
                                x-data="{
                                    open: false,
                                    search: @js($selectedCustomerName),
                                    options: @js($customers),
                                    matches() {
                                        const needle = this.search.toLocaleLowerCase('tr-TR')
                                        return this.options.filter((option) =>
                                            option.name.toLocaleLowerCase('tr-TR').includes(needle) ||
                                            (option.phone || '').includes(this.search)
                                        ).slice(0, 12)
                                    }
                                }"
                                @click.outside="open = false"
                            >
                                <label class="stria-label" for="customer-search">Müşteri</label>
                                <input
                                    id="customer-search"
                                    type="search"
                                    class="stria-input"
                                    x-model="search"
                                    @focus="open = true"
                                    @input="open = true; $wire.set('customerId', null)"
                                    placeholder="İsim veya telefon ara…"
                                    autocomplete="off"
                                >

                                <div class="stria-customer-results" x-cloak x-show="open">
                                    <template x-for="option in matches()" :key="option.id">
                                        <button
                                            type="button"
                                            @click="search = option.name; $wire.set('customerId', option.id); open = false"
                                        >
                                            <span x-text="option.name"></span>
                                            <small x-show="option.phone" x-text="option.phone"></small>
                                        </button>
                                    </template>

                                    <button type="button" x-show="matches().length === 0" disabled>
                                        Eşleşen müşteri yok
                                    </button>
                                </div>

                                <button type="button" class="stria-inline-action" wire:click="useNewCustomer">
                                    + Yeni müşteri oluştur
                                </button>
                                @error('customerId') <div class="stria-error">{{ $message }}</div> @enderror
                                @if ($customerId)
                                    <div class="stria-customer-stats">
                                        @if ($customerDoneCount === 0)
                                            <span class="stria-stat is-first">İlk işlemi 🌟</span>
                                        @else
                                            <span class="stria-stat">Toplam {{ $customerDoneCount }} tamamlanmış işlem</span>
                                        @endif
                                        @if ($appointmentSequence)
                                            <span class="stria-stat">Bu randevu {{ $appointmentSequence }}. işlemi</span>
                                        @endif
                                    </div>
                                @endif
                            </div>
                        @else
                            <div class="stria-field">
                                <label class="stria-label" for="new-customer-name">Yeni Müşteri Adı</label>
                                <input id="new-customer-name" type="text" class="stria-input" wire:model="newCustomerName" autofocus>
                                @error('newCustomerName') <div class="stria-error">{{ $message }}</div> @enderror
                            </div>

                            <div class="stria-field">
                                <label class="stria-label" for="new-customer-phone">Telefon</label>
                                <input id="new-customer-phone" type="tel" class="stria-input" wire:model="newCustomerPhone">
                                @error('newCustomerPhone') <div class="stria-error">{{ $message }}</div> @enderror
                            </div>

                            <div class="stria-field is-full">
                                <button type="button" class="stria-inline-action" wire:click="useExistingCustomer">
                                    ← Mevcut müşterilerden seç
                                </button>
                            </div>
                        @endif

                        @if ($isSessionChild)
                            <div class="stria-field is-full">
                                <label class="stria-label" for="appointment-service-locked">Hizmet</label>
                                <select id="appointment-service-locked" class="stria-input" disabled>
                                    <option value="">{{ $services[$serviceId] ?? 'Hizmet seçilmedi' }}</option>
                                </select>
                                <small class="stria-session-locked-note">Paketin 1. seansında yönetilir</small>
                            </div>
                        @else
                            <div class="stria-field is-full">
                                <label class="stria-label" for="appointment-service">Hizmet (Opsiyonel)</label>
                                <select id="appointment-service" class="stria-input" wire:model.live="serviceId">
                                    <option value="">Hizmet seçilmedi</option>
                                    @foreach ($services as $serviceId => $serviceName)
                                        <option value="{{ $serviceId }}">{{ $serviceName }}</option>
                                    @endforeach
                                </select>
                                @error('serviceId') <div class="stria-error">{{ $message }}</div> @enderror
                            </div>
                        @endif

                        <div class="stria-field">
                            <label class="stria-label" for="appointment-date">Tarih</label>
                            <input id="appointment-date" type="date" class="stria-input" wire:model="selectedDate" required>
                            @error('selectedDate') <div class="stria-error">{{ $message }}</div> @enderror
                        </div>

                        <div class="stria-field">
                            <label class="stria-label" for="appointment-time">Saat</label>
                            <input id="appointment-time" type="time" class="stria-input" wire:model="appointmentTime" required>
                            @error('appointmentTime') <div class="stria-error">{{ $message }}</div> @enderror
                        </div>

                        <div class="stria-field">
                            <label class="stria-label" for="appointment-duration">Süre (dk)</label>
                            <input id="appointment-duration" type="number" min="5" max="1440" step="5" class="stria-input" wire:model="durationMin" required>
                            @error('durationMin') <div class="stria-error">{{ $message }}</div> @enderror
                        </div>

                        @if ($isSessionChild)
                            <div class="stria-field is-full stria-session-payment">
                                <span class="stria-label">Ödeme</span>
                                <div class="stria-session-payment-row">
                                    <span>{{ $sessionRootPrice !== null ? number_format((float) $sessionRootPrice, 2, ',', '.').' ₺' : 'fiyat girilmedi' }}</span>
                                    <span>{{ $sessionRootIsPaid ? 'Ödendi' : 'Ödeme bekliyor' }}</span>
                                </div>
                                <small class="stria-session-locked-note">Ödeme paketin 1. seansında yönetiliyor.</small>
                                <button type="button" class="stria-inline-action" wire:click="openSession({{ $sessionRootId }})">
                                    1. seansa git
                                </button>
                            </div>
                        @else
                            <div class="stria-field">
                                <label class="stria-label" for="appointment-price">Fiyat (₺)</label>
                                <input id="appointment-price" type="number" min="0" step="0.01" class="stria-input" wire:model="price">
                                @error('price') <div class="stria-error">{{ $message }}</div> @enderror
                            </div>

                            <div class="stria-field">
                                <span class="stria-label">Ödeme</span>
                                <label class="stria-input stria-checkbox" for="appointment-is-paid">
                                    <input id="appointment-is-paid" type="checkbox" wire:model="is_paid" x-model="isPaid">
                                    <span>Ödeme alındı</span>
                                </label>
                                @error('is_paid') <div class="stria-error">{{ $message }}</div> @enderror
                            </div>

                            <div class="stria-field" x-cloak x-show="isPaid">
                                <label class="stria-label" for="appointment-payment-method">Ödeme yöntemi</label>
                                <select id="appointment-payment-method" class="stria-input" wire:model="payment_method">
                                    <option value="">Yöntem seçilmedi</option>
                                    <option value="nakit">Nakit</option>
                                    <option value="kart">Kart</option>
                                    <option value="havale">Havale</option>
                                </select>
                                @error('payment_method') <div class="stria-error">{{ $message }}</div> @enderror
                            </div>
                        @endif

                        <div class="stria-field is-full">
                            <label class="stria-label" for="appointment-note">Not</label>
                            <textarea id="appointment-note" class="stria-input" wire:model="note"></textarea>
                            @error('note') <div class="stria-error">{{ $message }}</div> @enderror
                        </div>

                        @if ($editingAppointmentId)
                            <div class="stria-field is-full">
                                @if ($sessionTotal)
                                    <div class="stria-session-heading">
                                        <span class="stria-label">Seanslar</span>
                                        <small>{{ $sessionTotal }} seans</small>
                                    </div>
                                    <div class="stria-session-list">
                                        @foreach ($appointmentSessions as $s)
                                            <div class="stria-session-row {{ $s['is_current'] ? 'is-current' : '' }}" wire:key="session-{{ $s['id'] }}">
                                                <div class="stria-session-info">
                                                    <strong>{{ $s['no'] }}. seans</strong>
                                                    <span>{{ $s['date'] }} · {{ $s['time'] }}</span>
                                                    <span class="stria-session-status">{{ $s['status_label'] }}</span>
                                                </div>
                                                <div class="stria-session-actions">
                                                    @if ($s['is_current'])
                                                        <span class="stria-session-current">bu seans</span>
                                                    @else
                                                        <button type="button" class="stria-inline-action" wire:click="openSession({{ $s['id'] }})">Aç</button>
                                                        <button
                                                            type="button"
                                                            class="stria-inline-action stria-session-remove"
                                                            wire:click="removeSession({{ $s['id'] }})"
                                                            wire:confirm="Bu seans silinecek. Emin misiniz?"
                                                        >Çıkar</button>
                                                    @endif
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                    <button type="button" class="stria-inline-action" wire:click="addSession" wire:loading.attr="disabled">
                                        + Seans ekle
                                    </button>
                                @else
                                    <span class="stria-label">Seanslar</span>
                                    <p class="stria-session-intro">Bu randevu birden fazla seansta yapılıyorsa seanslara bölebilirsiniz.</p>
                                    <div class="stria-session-split">
                                        <div class="stria-field">
                                            <label class="stria-label" for="split-total">Seans sayısı</label>
                                            <input id="split-total" type="number" min="2" max="12" class="stria-input" wire:model="splitTotal">
                                            @error('splitTotal') <div class="stria-error">{{ $message }}</div> @enderror
                                        </div>
                                        <div class="stria-field">
                                            <label class="stria-label" for="split-interval">Seans aralığı (gün)</label>
                                            <input id="split-interval" type="number" min="1" max="365" class="stria-input" wire:model="splitIntervalDays">
                                            @error('splitIntervalDays') <div class="stria-error">{{ $message }}</div> @enderror
                                        </div>
                                    </div>
                                    <button type="button" class="stria-button secondary" wire:click="splitIntoSessions" wire:loading.attr="disabled">
                                        Seansa böl
                                    </button>
                                @endif
                            </div>
                        @endif

                        @if ($editingAppointmentId)
                            <div class="stria-field is-full">
                                <div class="stria-photo-heading">
                                    <span class="stria-label">Öncesi / Sonrası Fotoğrafları</span>
                                    <small>sınırsız</small>
                                </div>

                                @if ($appointmentPhotos)
                                    <div class="stria-photo-grid">
                                        @foreach ($appointmentPhotos as $index => $path)
                                            <div class="stria-photo-thumb" wire:key="appointment-photo-{{ $index }}-{{ md5($path) }}">
                                                <img src="{{ asset('storage/'.$path) }}" alt="Randevu fotoğrafı">
                                                <button
                                                    type="button"
                                                    class="stria-photo-remove"
                                                    wire:click="removeAppointmentPhoto({{ $index }})"
                                                    aria-label="Fotoğrafı sil"
                                                >×</button>
                                            </div>
                                        @endforeach
                                    </div>
                                @endif

                                <input
                                    id="appointment-photo-upload"
                                    type="file"
                                    class="stria-photo-input"
                                    multiple
                                    accept="image/*"
                                    wire:model="newPhotos"
                                >
                                <label class="stria-photo-add" for="appointment-photo-upload">＋ Fotoğraf ekle</label>
                                <span class="stria-photo-loading" wire:loading wire:target="newPhotos">Yükleniyor…</span>
                                @error('newPhotos.*') <div class="stria-error">{{ $message }}</div> @enderror
                            </div>
                        @endif

                        @if ($pairingQrSvg)
                            <div class="stria-field is-full">
                                @include('filament.customer-pairing-qr', [
                                    'svg' => $pairingQrSvg,
                                    'customerName' => $pairingQrCustomer,
                                    'ttlMinutes' => \App\Support\CustomerPairing::TTL_MINUTES,
                                    'appointmentCount' => $pairingQrAppointmentCount ?? 0,
                                ])
                                <div style="display: flex; justify-content: center; margin-top: 12px;">
                                    <button type="button" class="stria-button secondary" wire:click="hidePairingQr">
                                        Kodu kapat
                                    </button>
                                </div>
                            </div>
                        @endif

                        @if ($pairingNotice)
                            <div class="stria-field is-full">
                                <div class="stria-hint">{{ $pairingNotice }}</div>
                                <div style="display: flex; justify-content: center; margin-top: 12px;">
                                    <button type="button" class="stria-button secondary" wire:click="hidePairingQr">
                                        Kapat
                                    </button>
                                </div>
                            </div>
                        @endif
                    </div>

                    <footer class="stria-modal-footer">
                        @if ($editingAppointmentId && $appointmentStatus === 'requested')
                            <button
                                type="button"
                                class="stria-button danger"
                                wire:click="rejectRequest"
                                wire:confirm="Bu randevu talebini reddetmek istediğinize emin misiniz?"
                            >
                                Reddet
                            </button>
                            <button type="button" class="stria-button primary" wire:click="approveRequest">
                                Onayla
                            </button>
                        @endif

                        @if ($editingAppointmentId && $appointmentStatus === 'confirmed')
                            <button
                                type="button"
                                class="stria-button danger"
                                wire:click="markNoShow"
                                wire:confirm="Randevu gelmedi olarak işaretlenecek. Emin misin?"
                            >
                                Gelmedi
                            </button>
                        @endif

                        @if ($editingAppointmentId && $appointmentStatus === 'no_show')
                            <button type="button" class="stria-button primary" wire:click="markAttended">
                                Geldi olarak işaretle
                            </button>
                        @endif

                        @if ($editingAppointmentId && ! $pairingQrSvg && ! $pairingNotice)
                            <button type="button" class="stria-button secondary" wire:click="showPairingQr">
                                QR görüntüle
                            </button>
                        @endif

                        @if ($editingAppointmentId)
                            <button
                                type="button"
                                class="stria-button danger"
                                wire:click="deleteAppointment"
                                wire:confirm="Bu randevuyu silmek istediğinize emin misiniz?"
                            >
                                Sil
                            </button>
                        @endif

                        <div class="stria-modal-footer-right">
                            <button type="button" class="stria-button secondary" wire:click="closeAppointmentModal">Vazgeç</button>
                            <button type="submit" class="stria-button primary" wire:loading.attr="disabled">
                                {{ $editingAppointmentId ? 'Güncelle' : 'Kaydet' }}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        @endif
    </div>
</x-filament-panels::page>
