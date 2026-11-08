// Müşteri paneli — çerçevesiz, derleme yok.
(function () {
  'use strict';

  // Mobil kenar çubuğu
  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('scrim');
  function openMenu() { if (sidebar) sidebar.classList.add('open'); if (scrim) scrim.classList.add('show'); }
  function closeMenu() { if (sidebar) sidebar.classList.remove('open'); if (scrim) scrim.classList.remove('show'); }
  document.querySelectorAll('[data-menu-toggle]').forEach(function (b) {
    b.addEventListener('click', openMenu);
  });
  if (scrim) scrim.addEventListener('click', closeMenu);

  // Tablo satırı tıklanınca git
  document.querySelectorAll('tr[data-href]').forEach(function (row) {
    row.addEventListener('click', function (e) {
      if (e.target.closest('a,button,form,input,label')) return;
      window.location = row.getAttribute('data-href');
    });
  });

  // Onay gerektiren formlar (silme vb.)
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  // Hizmet seçimi değişince alt uygulama ve süreyi uyarla
  var serviceSelect = document.getElementById('service_id');
  if (serviceSelect && window.__serviceMeta) {
    var meta = window.__serviceMeta;
    var subBox = document.getElementById('subservices-box');
    var durationInput = document.getElementById('duration_min');
    function renderSubs() {
      if (!subBox) return;
      var svc = meta[serviceSelect.value];
      var subs = svc ? svc.subservices || [] : [];
      if (!subs.length) { subBox.innerHTML = '<p class="muted small">Seçilen hizmetin alt uygulaması yok.</p>'; return; }
      subBox.innerHTML = subs.map(function (name) {
        return '<label><input type="checkbox" name="subservices[]" value="' + name.replace(/"/g, '&quot;') + '">' + name + '</label>';
      }).join('');
    }
    serviceSelect.addEventListener('change', function () {
      renderSubs();
      var svc = meta[serviceSelect.value];
      if (durationInput && svc && svc.duration_min && !durationInput.value) durationInput.value = svc.duration_min;
    });
  }
})();
