(function () {
  const STORAGE_KEY = 'demo_storage_value';

  function getTheme() {
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  document.getElementById('themeToggle').addEventListener('click', function () {
    const current = getTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  setTheme(getTheme());

  document.querySelectorAll('.scroll-to').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = document.querySelector(this.getAttribute('data-target'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const counterCards = document.querySelectorAll('.counter-card');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    counterCards.forEach(function (card) {
      const target = parseInt(card.getAttribute('data-target'), 10);
      const el = card.querySelector('.counter-value');
      let current = 0;
      const step = target / 50;
      const duration = 1500;
      const interval = duration / 50;
      const timer = setInterval(function () {
        current += step;
        if (current >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current);
        }
      }, interval);
    });
    countersAnimated = true;
  }

  const observerOptions = { threshold: 0.3, rootMargin: '0px' };
  const counterSection = document.getElementById('counters');
  if (counterSection) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) animateCounters();
      });
    }, observerOptions);
    obs.observe(counterSection);
  }

  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tabId = this.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');
      const panel = document.querySelector('.tab-panel[data-panel="' + tabId + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = this.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.querySelector('.carousel-dots');
  let currentSlide = 0;

  function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;
    slides.forEach(function (s, i) { s.classList.toggle('active', i === currentSlide); });
    document.querySelectorAll('.carousel-dot').forEach(function (d, i) { d.classList.toggle('active', i === currentSlide); });
  }

  slides.forEach(function (_, i) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
    dot.addEventListener('click', function () { showSlide(i); });
    dotsContainer.appendChild(dot);
  });

  document.querySelector('.carousel-prev').addEventListener('click', function () { showSlide(currentSlide - 1); });
  document.querySelector('.carousel-next').addEventListener('click', function () { showSlide(currentSlide + 1); });

  let carouselInterval = setInterval(function () { showSlide(currentSlide + 1); }, 4000);
  document.querySelector('.carousel').addEventListener('mouseenter', function () { clearInterval(carouselInterval); });
  document.querySelector('.carousel').addEventListener('mouseleave', function () {
    carouselInterval = setInterval(function () { showSlide(currentSlide + 1); }, 4000);
  });

  const overlay = document.getElementById('modalOverlay');
  document.querySelector('.open-modal').addEventListener('click', function () { overlay.classList.add('open'); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
  overlay.querySelector('.modal-close').addEventListener('click', function () { overlay.classList.remove('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') overlay.classList.remove('open'); });

  const form = document.getElementById('demoForm');
  function showFieldError(input, message) {
    const group = input.closest('.form-group');
    const err = group.querySelector('.form-error');
    input.classList.add('error');
    err.textContent = message;
  }
  function clearFieldError(input) {
    const group = input.closest('.form-group');
    const err = group.querySelector('.form-error');
    input.classList.remove('error');
    err.textContent = '';
  }
  form.querySelectorAll('input, textarea').forEach(function (field) {
    field.addEventListener('input', function () { clearFieldError(this); });
    field.addEventListener('blur', function () {
      if (this.value.length > 0) {
        if (this.hasAttribute('minlength') && this.value.length < parseInt(this.getAttribute('minlength'), 10)) {
          showFieldError(this, 'Минимум ' + this.getAttribute('minlength') + ' символов');
        } else if (this.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
          showFieldError(this, 'Некорректный email');
        } else {
          clearFieldError(this);
        }
      } else {
        clearFieldError(this);
      }
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('input[required], textarea[required]').forEach(function (field) {
      if (!field.value.trim()) {
        showFieldError(field, 'Обязательное поле');
        valid = false;
      } else if (field.hasAttribute('minlength') && field.value.length < parseInt(field.getAttribute('minlength'), 10)) {
        showFieldError(field, 'Минимум ' + field.getAttribute('minlength') + ' символов');
        valid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        showFieldError(field, 'Некорректный email');
        valid = false;
      }
    });
    if (valid) {
      showToast('Форма успешно отправлена!', 'success');
      form.reset();
      form.querySelectorAll('.form-error').forEach(function (el) { el.textContent = ''; });
      form.querySelectorAll('.error').forEach(function (el) { el.classList.remove('error'); });
    }
  });

  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  document.querySelectorAll('.show-toast').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const type = this.getAttribute('data-type');
      const messages = { success: 'Успешное действие', error: 'Произошла ошибка', info: 'Информационное сообщение' };
      showToast(messages[type] || 'Сообщение', type);
    });
  });

  const dragZone = document.getElementById('dragZone');
  let draggedItem = null;
  document.querySelectorAll('.drag-item').forEach(function (item) {
    item.addEventListener('dragstart', function (e) {
      draggedItem = this;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.outerHTML);
    });
    item.addEventListener('dragend', function () {
      this.classList.remove('dragging');
      draggedItem = null;
    });
    item.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (draggedItem && draggedItem !== this) {
        const rect = this.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        if (e.clientX < mid) {
          dragZone.insertBefore(draggedItem, this);
        } else {
          dragZone.insertBefore(draggedItem, this.nextSibling);
        }
      }
    });
  });
  dragZone.addEventListener('dragover', function (e) { e.preventDefault(); });

  function updateStorageDisplay() {
    document.getElementById('storageDisplay').textContent = localStorage.getItem(STORAGE_KEY) || '—';
  }
  document.getElementById('storageSave').addEventListener('click', function () {
    const val = document.getElementById('storageInput').value.trim();
    localStorage.setItem(STORAGE_KEY, val || '');
    updateStorageDisplay();
    showToast('Сохранено', 'success');
  });
  document.getElementById('storageClear').addEventListener('click', function () {
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('storageInput').value = '';
    updateStorageDisplay();
    showToast('Очищено', 'info');
  });
  updateStorageDisplay();

  const searchInput = document.getElementById('searchInput');
  const searchItems = document.querySelectorAll('#searchList li');
  searchInput.addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    searchItems.forEach(function (li) {
      const text = (li.getAttribute('data-text') || li.textContent).toLowerCase();
      li.classList.toggle('hidden', q && text.indexOf(q) === -1);
    });
  });

  const canvas = document.getElementById('demoCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let phase = 0;
    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#16161d';
      ctx.fillRect(0, 0, w, h);
      phase += 0.02;
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00d4aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 + Math.sin(x * 0.02 + phase) * 40 + Math.sin(x * 0.05 + phase * 2) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      requestAnimationFrame(draw);
    }
    draw();
  }

  document.getElementById('fetchBtn').addEventListener('click', function () {
    const result = document.getElementById('apiResult');
    result.innerHTML = 'Загрузка...';
    fetch('https://randomuser.me/api/')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const u = data.results[0];
        result.innerHTML = '<strong>' + u.name.first + ' ' + u.name.last + '</strong><br>Email: ' + u.email + '<br>Город: ' + (u.location.city || '—');
      })
      .catch(function () {
        result.innerHTML = 'Ошибка загрузки. Проверьте сеть или CORS.';
      });
  });

  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
    const progress = document.getElementById('scrollProgress');
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const tooltipEl = document.getElementById('tooltip');
  document.querySelectorAll('[data-tooltip]').forEach(function (el) {
    el.addEventListener('mouseenter', function (e) {
      const text = this.getAttribute('data-tooltip');
      if (!text) return;
      tooltipEl.textContent = text;
      tooltipEl.classList.add('visible');
      updateTooltipPosition(e);
    });
    el.addEventListener('mousemove', updateTooltipPosition);
    el.addEventListener('mouseleave', function () {
      tooltipEl.classList.remove('visible');
    });
    function updateTooltipPosition(e) {
      const x = e.clientX;
      const y = e.clientY;
      const gap = 12;
      let left = x + gap;
      let top = y + gap;
      if (left + tooltipEl.offsetWidth > window.innerWidth) left = x - tooltipEl.offsetWidth - gap;
      if (top + tooltipEl.offsetHeight > window.innerHeight) top = y - tooltipEl.offsetHeight - gap;
      if (top < 0) top = gap;
      if (left < 0) left = gap;
      tooltipEl.style.left = left + 'px';
      tooltipEl.style.top = top + 'px';
    }
  });

  const passLen = document.getElementById('passLen');
  const passLenOut = document.getElementById('passLenOut');
  if (passLen) passLen.addEventListener('input', function () { passLenOut.textContent = this.value; });
  function generatePassword() {
    const len = parseInt(document.getElementById('passLen').value, 10);
    let chars = '';
    if (document.getElementById('passDigits').checked) chars += '0123456789';
    if (document.getElementById('passUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (document.getElementById('passLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (document.getElementById('passSymbols').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < len; i++) result += chars[Math.floor(Math.random() * chars.length)];
    document.getElementById('passOutput').value = result;
  }
  document.getElementById('passGenerate').addEventListener('click', generatePassword);
  document.getElementById('passCopy').addEventListener('click', function () {
    const el = document.getElementById('passOutput');
    if (!el.value) generatePassword();
    navigator.clipboard.writeText(document.getElementById('passOutput').value).then(function () {
      showToast('Скопировано', 'success');
    }).catch(function () { showToast('Не удалось скопировать', 'error'); });
  });
  generatePassword();

  const sortableTable = document.getElementById('sortableTable');
  if (sortableTable) {
    const tbody = sortableTable.querySelector('tbody');
    const headers = sortableTable.querySelectorAll('th');
    headers.forEach(function (th) {
      th.addEventListener('click', function () {
        const key = this.getAttribute('data-sort');
        const order = this.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';
        headers.forEach(function (h) { h.removeAttribute('data-order'); });
        this.setAttribute('data-order', order);
        const colIndex = Array.from(headers).indexOf(this);
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort(function (a, b) {
          const aVal = a.cells[colIndex].textContent.trim();
          const bVal = b.cells[colIndex].textContent.trim();
          const numA = parseFloat(aVal);
          const numB = parseFloat(bVal);
          if (!isNaN(numA) && !isNaN(numB)) return order === 'asc' ? numA - numB : numB - numA;
          return order === 'asc' ? (aVal < bVal ? -1 : 1) : (bVal < aVal ? -1 : 1);
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
      });
    });
  }

  let stopwatchTimer = null;
  let stopwatchElapsed = 0;
  const stopwatchDisplay = document.getElementById('stopwatchDisplay');
  function stopwatchTick() {
    stopwatchElapsed += 100;
    const ms = stopwatchElapsed % 1000;
    const sec = Math.floor(stopwatchElapsed / 1000) % 60;
    const min = Math.floor(stopwatchElapsed / 60000);
    stopwatchDisplay.textContent = min + ':' + (sec < 10 ? '0' : '') + sec + '.' + (ms / 100 | 0);
  }
  document.getElementById('stopwatchStart').addEventListener('click', function () {
    if (stopwatchTimer) return;
    stopwatchTimer = setInterval(stopwatchTick, 100);
  });
  document.getElementById('stopwatchStop').addEventListener('click', function () {
    clearInterval(stopwatchTimer);
    stopwatchTimer = null;
  });
  document.getElementById('stopwatchReset').addEventListener('click', function () {
    clearInterval(stopwatchTimer);
    stopwatchTimer = null;
    stopwatchElapsed = 0;
    stopwatchDisplay.textContent = '0:00:00.0';
  });

  const colorPicker = document.getElementById('colorPicker');
  function updateColorOutput() {
    const hex = colorPicker.value;
    document.getElementById('colorHex').textContent = hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.getElementById('colorRgb').textContent = r + ', ' + g + ', ' + b;
  }
  colorPicker.addEventListener('input', updateColorOutput);
  document.getElementById('colorCopy').addEventListener('click', function () {
    navigator.clipboard.writeText(colorPicker.value).then(function () { showToast('HEX скопирован', 'success'); }).catch(function () {});
  });

  const chartCanvas = document.getElementById('chartCanvas');
  if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    const data = [30, 65, 45, 80, 55, 90, 70];
    const w = chartCanvas.width;
    const h = chartCanvas.height;
    const padding = 40;
    const max = Math.max.apply(null, data);
    const barW = (w - padding * 2) / data.length - 8;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#16161d';
    ctx.fillRect(0, 0, w, h);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00d4aa';
    data.forEach(function (val, i) {
      const x = padding + i * ((w - padding * 2) / data.length) + 4;
      const barH = (val / max) * (h - padding * 2);
      const y = h - padding - barH;
      ctx.fillStyle = accent;
      ctx.fillRect(x, y, barW, barH);
    });
  }

  const speechText = document.getElementById('speechText');
  const synth = window.speechSynthesis;
  let speechUtterance = null;
  document.getElementById('speechBtn').addEventListener('click', function () {
    if (speechUtterance) synth.cancel();
    const text = speechText.value.trim();
    if (!text) return;
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = 'ru-RU';
    synth.speak(speechUtterance);
    showToast('Озвучивание запущено', 'info');
  });
  document.getElementById('speechStop').addEventListener('click', function () {
    synth.cancel();
    showToast('Остановлено', 'info');
  });

  document.getElementById('geoBtn').addEventListener('click', function () {
    const result = document.getElementById('geoResult');
    result.textContent = 'Запрос разрешения...';
    if (!navigator.geolocation) {
      result.textContent = 'Геолокация не поддерживается';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        result.innerHTML = 'Широта: ' + pos.coords.latitude.toFixed(6) + '<br>Долгота: ' + pos.coords.longitude.toFixed(6) + (pos.coords.accuracy ? '<br>Точность: ±' + Math.round(pos.coords.accuracy) + ' м' : '');
      },
      function (err) {
        result.textContent = 'Ошибка: ' + (err.message || 'доступ запрещён');
      }
    );
  });

  document.getElementById('copyBtn').addEventListener('click', function () {
    const input = document.getElementById('copyInput');
    navigator.clipboard.writeText(input.value).then(function () {
      showToast('Скопировано в буфер', 'success');
    }).catch(function () { showToast('Не удалось скопировать', 'error'); });
  });

  document.getElementById('fullscreenBtn').addEventListener('click', function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(function () {
        document.getElementById('fullscreenBtn').textContent = 'Выйти из полноэкранного режима';
        showToast('Полный экран', 'info');
      }).catch(function () { showToast('Не поддерживается', 'error'); });
    } else {
      document.exitFullscreen().then(function () {
        document.getElementById('fullscreenBtn').textContent = 'Перейти в полноэкранный режим';
      });
    }
  });
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) document.getElementById('fullscreenBtn').textContent = 'Перейти в полноэкранный режим';
  });

  document.getElementById('vibrateBtn').addEventListener('click', function () {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
      showToast('Вибрация', 'info');
    } else {
      showToast('Вибрация не поддерживается', 'info');
    }
  });

  var exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', function () {
      var table = document.getElementById('sortableTable');
      if (!table) return;
      var rows = table.querySelectorAll('tr');
      var csv = [];
      for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].querySelectorAll('th, td');
        var row = [];
        for (var j = 0; j < cells.length; j++) {
          var text = cells[j].textContent.trim().replace(/"/g, '""');
          row.push('"' + text + '"');
        }
        csv.push(row.join(';'));
      }
      var blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'table.csv';
      a.click();
      URL.revokeObjectURL(a.href);
      showToast('CSV сохранён', 'success');
    });
  }

  var notifyStatus = document.getElementById('notifyStatus');
  function updateNotifyStatus() {
    if (!notifyStatus) return;
    if (!('Notification' in window)) {
      notifyStatus.textContent = 'Не поддерживается';
      return;
    }
    if (Notification.permission === 'granted') notifyStatus.textContent = 'Разрешено';
    else if (Notification.permission === 'denied') notifyStatus.textContent = 'Запрещено';
    else notifyStatus.textContent = 'Не запрошено';
  }
  document.getElementById('notifyRequest').addEventListener('click', function () {
    if (!('Notification' in window)) { showToast('Уведомления не поддерживаются', 'error'); return; }
    Notification.requestPermission().then(function (p) {
      updateNotifyStatus();
      showToast(p === 'granted' ? 'Разрешение получено' : 'Разрешение отклонено', p === 'granted' ? 'success' : 'info');
    });
  });
  document.getElementById('notifyShow').addEventListener('click', function () {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      showToast('Сначала разрешите уведомления', 'error');
      return;
    }
    new Notification('Тестовое уведомление', { body: 'Это уведомление из браузера.', icon: null });
    showToast('Уведомление отправлено', 'success');
  });
  updateNotifyStatus();

  function updateNetworkInfo() {
    var onlineEl = document.getElementById('onlineStatus');
    var viewportEl = document.getElementById('viewportSize');
    var ratioEl = document.getElementById('pixelRatio');
    if (onlineEl) onlineEl.textContent = navigator.onLine ? 'Онлайн' : 'Офлайн';
    if (viewportEl) viewportEl.textContent = window.innerWidth + ' × ' + window.innerHeight;
    if (ratioEl) ratioEl.textContent = window.devicePixelRatio || 1;
  }
  updateNetworkInfo();
  window.addEventListener('online', updateNetworkInfo);
  window.addEventListener('offline', updateNetworkInfo);
  document.getElementById('networkRefresh').addEventListener('click', updateNetworkInfo);

  document.getElementById('shareBtn').addEventListener('click', function () {
    var statusEl = document.getElementById('shareStatus');
    if (!navigator.share) {
      statusEl.textContent = 'Web Share не поддерживается';
      return;
    }
    navigator.share({
      title: document.title || 'Возможности',
      url: window.location.href,
      text: 'Страница с демо возможностей'
    }).then(function () {
      statusEl.textContent = 'Успешно';
      showToast('Поделились', 'success');
    }).catch(function (e) {
      statusEl.textContent = e.name === 'AbortError' ? 'Отменено' : 'Ошибка';
    });
  });

  document.querySelectorAll('.utils-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var panelId = this.getAttribute('data-util');
      document.querySelectorAll('.utils-tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.utils-panel').forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');
      var panel = document.querySelector('.utils-panel[data-panel="' + panelId + '"]');
      if (panel) panel.classList.add('active');
      if (panelId === 'datetime') updateDateTimeDisplay();
      if (panelId === 'textstats') updateTextStats();
    });
  });

  var jsonInput = document.getElementById('jsonInput');
  var jsonOutput = document.getElementById('jsonOutput');
  var jsonError = document.getElementById('jsonError');
  document.getElementById('jsonFormat').addEventListener('click', function () {
    jsonError.textContent = '';
    try {
      var obj = JSON.parse(jsonInput.value.trim() || '{}');
      jsonOutput.textContent = JSON.stringify(obj, null, 2);
    } catch (e) {
      jsonError.textContent = 'Ошибка: ' + e.message;
    }
  });
  document.getElementById('jsonMinify').addEventListener('click', function () {
    jsonError.textContent = '';
    try {
      var obj = JSON.parse(jsonInput.value.trim() || '{}');
      jsonOutput.textContent = JSON.stringify(obj);
    } catch (e) {
      jsonError.textContent = 'Ошибка: ' + e.message;
    }
  });

  var urlInput = document.getElementById('urlInput');
  var urlOutput = document.getElementById('urlOutput');
  document.getElementById('urlEncode').addEventListener('click', function () {
    try {
      urlOutput.textContent = encodeURIComponent(urlInput.value);
    } catch (e) {
      urlOutput.textContent = '';
    }
  });
  document.getElementById('urlDecode').addEventListener('click', function () {
    try {
      urlOutput.textContent = decodeURIComponent(urlInput.value.replace(/\+/g, ' '));
    } catch (e) {
      urlOutput.textContent = 'Ошибка декодирования';
    }
  });

  var textStatsInput = document.getElementById('textStatsInput');
  var textStatsOutput = document.getElementById('textStatsOutput');
  function updateTextStats() {
    if (!textStatsInput || !textStatsOutput) return;
    var s = textStatsInput.value;
    var chars = s.length;
    var words = s.trim() ? s.trim().split(/\s+/).length : 0;
    var lines = s ? s.split(/\n/).length : 0;
    var readingMin = words > 0 ? (words / 200).toFixed(1) : '0';
    textStatsOutput.innerHTML = '<p>Символов: <strong>' + chars + '</strong></p><p>Слов: <strong>' + words + '</strong></p><p>Строк: <strong>' + lines + '</strong></p><p>Время чтения ~<strong>' + readingMin + '</strong> мин</p>';
  }
  if (textStatsInput) textStatsInput.addEventListener('input', updateTextStats);

  var datetimeDisplay = document.getElementById('datetimeDisplay');
  var timezoneDisplay = document.getElementById('timezoneDisplay');
  function updateDateTimeDisplay() {
    if (!datetimeDisplay) return;
    var d = new Date();
    datetimeDisplay.textContent = d.toLocaleString('ru-RU', { dateStyle: 'full', timeStyle: 'medium' });
    if (timezoneDisplay) {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '—';
      timezoneDisplay.textContent = tz;
    }
  }
  setInterval(updateDateTimeDisplay, 1000);
  updateDateTimeDisplay();

  document.getElementById('copyUrlBtn').addEventListener('click', function () {
    navigator.clipboard.writeText(window.location.href).then(function () {
      showToast('URL скопирован', 'success');
    }).catch(function () { showToast('Не удалось', 'error'); });
  });

  (function terminalTyping() {
    var out = document.getElementById('terminalOutput');
    if (!out) return;
    var lines = ['checking modules...', 'load particles.js', 'load crypto API', 'init complete.', '> ready'];
    var lineIndex = 0;
    var charIndex = 0;
    var accumulated = '';
    function type() {
      if (lineIndex >= lines.length) return;
      var line = lines[lineIndex];
      if (charIndex <= line.length) {
        out.textContent = accumulated + line.slice(0, charIndex);
        charIndex++;
        setTimeout(type, 70 + Math.random() * 50);
      } else {
        accumulated += line + '\n';
        lineIndex++;
        charIndex = 0;
        out.textContent = accumulated;
        setTimeout(type, 350);
      }
    }
    setTimeout(type, 500);
  })();

  document.querySelectorAll('.crypto-tabs .utils-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var id = this.getAttribute('data-crypto');
      document.querySelectorAll('.crypto-tabs .utils-tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.crypto-panel').forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');
      var panel = document.querySelector('.crypto-panel[data-crypto="' + id + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  function sha256Hex(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
  }
  document.getElementById('shaHash').addEventListener('click', function () {
    var input = document.getElementById('shaInput').value;
    var out = document.getElementById('shaOutput');
    out.textContent = '...';
    sha256Hex(input).then(function (hex) { out.textContent = hex; }).catch(function () { out.textContent = 'Ошибка (только HTTPS или localhost)'; });
  });

  document.getElementById('b64Encode').addEventListener('click', function () {
    var s = document.getElementById('b64Input').value;
    try { document.getElementById('b64Output').textContent = btoa(unescape(encodeURIComponent(s))); } catch (e) { document.getElementById('b64Output').textContent = 'Ошибка'; }
  });
  document.getElementById('b64Decode').addEventListener('click', function () {
    var s = document.getElementById('b64Input').value;
    try { document.getElementById('b64Output').textContent = decodeURIComponent(escape(atob(s))); } catch (e) { document.getElementById('b64Output').textContent = 'Ошибка декодирования'; }
  });

  function caesarShiftStr(str, shift, encrypt) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c >= 65 && c <= 90) {
        c = ((c - 65 + (encrypt ? shift : -shift)) % 26 + 26) % 26 + 65;
      } else if (c >= 97 && c <= 122) {
        c = ((c - 97 + (encrypt ? shift : -shift)) % 26 + 26) % 26 + 97;
      } else if (c >= 1040 && c <= 1103) {
        var base = c >= 1072 ? 1072 : 1040;
        c = ((c - base + (encrypt ? shift : -shift)) % 32 + 32) % 32 + base;
      }
      result += String.fromCharCode(c);
    }
    return result;
  }
  document.getElementById('caesarEncrypt').addEventListener('click', function () {
    var shift = parseInt(document.getElementById('caesarShift').value, 10) || 3;
    var input = document.getElementById('caesarInput').value;
    document.getElementById('caesarOutput').textContent = caesarShiftStr(input, shift, true);
  });
  document.getElementById('caesarDecrypt').addEventListener('click', function () {
    var shift = parseInt(document.getElementById('caesarShift').value, 10) || 3;
    var input = document.getElementById('caesarInput').value;
    document.getElementById('caesarOutput').textContent = caesarShiftStr(input, shift, false);
  });

  document.getElementById('pingBtn').addEventListener('click', function () {
    var host = document.getElementById('pingHost').value.trim() || '127.0.0.1';
    var out = document.getElementById('pingOutput');
    out.textContent = 'Pinging ' + host + '...\n';
    var start = Date.now();
    setTimeout(function () {
      var elapsed = Date.now() - start;
      out.textContent += 'Reply from ' + host + ': time=' + (Math.round(elapsed / 2) + Math.floor(Math.random() * 5)) + 'ms\n';
      out.textContent += 'Packets: Sent=1, Received=1, Lost=0';
    }, 300 + Math.random() * 400);
  });

  function refreshCookies() {
    var out = document.getElementById('cookiesOutput');
    out.textContent = document.cookie || '(пусто)';
  }
  refreshCookies();
  document.getElementById('cookiesRefresh').addEventListener('click', refreshCookies);

  document.getElementById('baseConvert').addEventListener('click', function () {
    var input = document.getElementById('baseInput').value.trim();
    var from = parseInt(document.getElementById('baseFrom').value, 10);
    var to = parseInt(document.getElementById('baseTo').value, 10);
    var out = document.getElementById('baseOutput');
    try {
      var num = parseInt(input, from);
      if (isNaN(num)) throw new Error('Не число');
      out.textContent = to === 10 ? num : num.toString(to).toUpperCase();
    } catch (e) { out.textContent = 'Ошибка'; }
  });

  document.querySelectorAll('.case-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var s = document.getElementById('caseInput').value;
      var mode = this.getAttribute('data-case');
      var result = '';
      if (mode === 'upper') result = s.toUpperCase();
      else if (mode === 'lower') result = s.toLowerCase();
      else if (mode === 'title') result = s.toLowerCase().replace(/(^|\s)\S/g, function (m) { return m.toUpperCase(); });
      else if (mode === 'camel') {
        result = s.toLowerCase().replace(/(\s|^)(\w)/g, function (_, __, c) { return c.toUpperCase(); }).replace(/\s/g, '');
        if (result.length) result = result[0].toLowerCase() + result.slice(1);
      }
      document.getElementById('caseInput').value = result;
      document.getElementById('caseOutput').textContent = result;
    });
  });

  document.getElementById('tsToDate').addEventListener('click', function () {
    var v = document.getElementById('tsInput').value.trim();
    var out = document.getElementById('tsOutput');
    var num = parseInt(v, 10);
    if (!isNaN(num)) {
      var d = new Date(num * 1000);
      out.textContent = d.toLocaleString('ru-RU');
    } else out.textContent = new Date(v).toLocaleString('ru-RU') || '—';
  });
  document.getElementById('tsToStamp').addEventListener('click', function () {
    document.getElementById('tsInput').value = '';
    document.getElementById('tsOutput').textContent = Math.floor(Date.now() / 1000);
  });

  var loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');
  document.getElementById('loremGen').addEventListener('click', function () {
    var n = parseInt(document.getElementById('loremCount').value, 10) || 5;
    var unit = document.getElementById('loremUnit').value;
    var out = document.getElementById('loremOutput');
    if (unit === 'words') {
      var arr = [];
      for (var i = 0; i < n; i++) arr.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      out.textContent = arr.join(' ');
    } else {
      var s = [];
      for (var j = 0; j < n; j++) {
        var len = 5 + Math.floor(Math.random() * 8);
        var w = [];
        for (var k = 0; k < len; k++) w.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
        w[0] = w[0].charAt(0).toUpperCase() + w[0].slice(1);
        s.push(w.join(' ') + '.');
      }
      out.textContent = s.join(' ');
    }
  });

  document.getElementById('reverseBtn').addEventListener('click', function () {
    var s = document.getElementById('reverseInput').value;
    document.getElementById('reverseOutput').textContent = s.split('').reverse().join('');
  });

  function rot13(s) {
    return s.replace(/[a-zA-Z]/g, function (c) {
      var base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  }
  document.getElementById('rot13Btn').addEventListener('click', function () {
    var s = document.getElementById('rot13Input').value;
    document.getElementById('rot13Output').textContent = rot13(s);
  });

  var escapeDiv = document.createElement('div');
  document.getElementById('htmlEscapeBtn').addEventListener('click', function () {
    var s = document.getElementById('htmlEscapeInput').value;
    escapeDiv.textContent = s;
    document.getElementById('htmlEscapeOutput').textContent = escapeDiv.innerHTML;
  });
  document.getElementById('htmlUnescapeBtn').addEventListener('click', function () {
    var s = document.getElementById('htmlEscapeInput').value;
    escapeDiv.innerHTML = s;
    document.getElementById('htmlEscapeOutput').textContent = escapeDiv.textContent;
  });

  var lastKeyEl = document.getElementById('lastKeyOutput');
  document.addEventListener('keydown', function (e) {
    if (!lastKeyEl) return;
    lastKeyEl.textContent = 'key: "' + e.key + '"  code: ' + e.code + '  keyCode: ' + e.keyCode;
  });

  var countdownTimer = null;
  document.getElementById('countdownStart').addEventListener('click', function () {
    var min = parseInt(document.getElementById('countdownMin').value, 10) || 1;
    var total = min * 60;
    var out = document.getElementById('countdownOutput');
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(function () {
      total--;
      var m = Math.floor(total / 60);
      var s = total % 60;
      out.textContent = m + ':' + (s < 10 ? '0' : '') + s;
      if (total <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        if (navigator.vibrate) navigator.vibrate(200);
        showToast('Время вышло!', 'info');
      }
    }, 1000);
  });
  document.getElementById('countdownStop').addEventListener('click', function () {
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = null;
    document.getElementById('countdownOutput').textContent = '0:00';
  });

  document.getElementById('myIpBtn').addEventListener('click', function () {
    var out = document.getElementById('myIpOutput');
    out.textContent = '...';
    fetch('https://api.ipify.org?format=json').then(function (r) { return r.json(); }).then(function (d) {
      out.textContent = d.ip || '—';
    }).catch(function () { out.textContent = 'Ошибка'; });
  });

  (function orderSection() {
    var typeSelect = document.getElementById('orderType');
    var totalEl = document.getElementById('orderTotal');
    var orderWhat = document.getElementById('orderWhat');
    var typeToWhat = { '1500': 'Лендинг', '3500': 'Каталог', '8000': 'Интернет-магазин', '12000': 'Корпоративный сайт', '20000': 'Под ключ' };

    function updateOrderTotal() {
      var base = parseInt(typeSelect.value, 10) || 0;
      if (document.getElementById('orderSeo').checked) base += 500;
      if (document.getElementById('orderIntegr').checked) base += 1500;
      if (document.getElementById('orderDesign').checked) base += 2000;
      totalEl.textContent = base.toLocaleString('ru-RU') + ' ₽';
    }

    function syncCalcToForm() {
      if (orderWhat && typeSelect) {
        var val = typeToWhat[typeSelect.value];
        if (val) {
          orderWhat.value = val;
        }
      }
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', function () {
        updateOrderTotal();
        syncCalcToForm();
      });
    }
    ['orderSeo', 'orderIntegr', 'orderDesign'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', updateOrderTotal);
    });
    updateOrderTotal();
    syncCalcToForm();

    var form = document.getElementById('orderForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('orderName').value.trim();
        var contact = document.getElementById('orderContact').value.trim();
        var what = orderWhat ? orderWhat.value : '';
        var comment = document.getElementById('orderComment').value.trim();
        if (!name || !contact) {
          showToast('Укажите имя и контакт', 'error');
          return;
        }
        var typeText = typeSelect && typeSelect.selectedOptions && typeSelect.selectedOptions[0] ? typeSelect.selectedOptions[0].text : '';
        var totalText = totalEl ? totalEl.textContent : '';
        var extras = [];
        if (document.getElementById('orderAdapt').checked) extras.push('адаптив');
        if (document.getElementById('orderSeo').checked) extras.push('SEO');
        if (document.getElementById('orderIntegr').checked) extras.push('интеграции');
        if (document.getElementById('orderDesign').checked) extras.push('дизайн с нуля');

        var msg = 'Заявка с сайта\n';
        msg += 'Имя: ' + name + '\n';
        msg += 'Контакт: ' + contact + '\n';
        msg += 'Что нужно: ' + (what || typeText || '—') + '\n';
        msg += 'По калькулятору: ' + (typeText || '—') + '\n';
        msg += 'Доп: ' + (extras.length ? extras.join(', ') : 'только база') + '\n';
        msg += 'Итого от: ' + (totalText || '—') + '\n';
        if (comment) msg += 'Комментарий: ' + comment;
        var url = 'https://t.me/verf1CT?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
        showToast('Откроется Telegram — отправьте сообщение', 'success');
      });
    }
  })();

  var particlesPresets = {
    default: {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#00ff41' },
        size: { value: 3 },
        line_linked: { enable: true, distance: 120, color: '#00ff41', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
        modes: { grab: { distance: 140, line_linked: { opacity: 0.8 } }, push: { particles_nb: 4 } }
      }
    },
    dense: {
      particles: {
        number: { value: 200, density: { enable: true, value_area: 600 } },
        color: { value: '#00ffff' },
        size: { value: 2 },
        line_linked: { enable: true, distance: 80, color: '#00ffff', opacity: 0.6, width: 1 },
        move: { enable: true, speed: 1.5 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
        modes: { grab: { distance: 100, line_linked: { opacity: 1 } }, push: { particles_nb: 6 } }
      }
    },
    sparse: {
      particles: {
        number: { value: 30, density: { enable: true, value_area: 1200 } },
        color: { value: '#51cf66' },
        size: { value: 5 },
        line_linked: { enable: true, distance: 200, color: '#51cf66', opacity: 0.3, width: 2 },
        move: { enable: true, speed: 1 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
        modes: { repulse: { distance: 150, duration: 0.6 }, push: { particles_nb: 2 } }
      }
    },
    fast: {
      particles: {
        number: { value: 100, density: { enable: true, value_area: 700 } },
        color: { value: '#ff6b6b' },
        size: { value: 2.5 },
        line_linked: { enable: true, distance: 90, color: '#ff6b6b', opacity: 0.5, width: 1 },
        move: { enable: true, speed: 5 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: 'bubble' }, onclick: { enable: true, mode: 'push' } },
        modes: { bubble: { distance: 180, size: 8, duration: 0.3 }, push: { particles_nb: 4 } }
      }
    },
    nolines: {
      particles: {
        number: { value: 120, density: { enable: true, value_area: 700 } },
        color: { value: '#cc5de8' },
        size: { value: 4 },
        line_linked: { enable: false },
        move: { enable: true, speed: 3 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
        modes: { grab: { distance: 120 }, push: { particles_nb: 8 } }
      }
    },
    big: {
      particles: {
        number: { value: 40, density: { enable: true, value_area: 1000 } },
        color: { value: '#ffd43b' },
        size: { value: 8 },
        line_linked: { enable: true, distance: 150, color: '#ffd43b', opacity: 0.5, width: 2 },
        move: { enable: true, speed: 1.2 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: 'bubble' }, onclick: { enable: true, mode: 'push' } },
        modes: { bubble: { distance: 200, size: 12, duration: 0.5 }, push: { particles_nb: 3 } }
      }
    }
  };

  function initParticles() {
    var container = document.getElementById('particles-demo');
    if (!container || typeof window.particlesJS !== 'function') return;
    try {
      window.particlesJS('particles-demo', particlesPresets.default);
      document.querySelectorAll('.particles-preset').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var preset = this.getAttribute('data-preset');
          if (!particlesPresets[preset]) return;
          document.querySelectorAll('.particles-preset').forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');
          if (window.pJSDom && window.pJSDom.length > 0) {
            try { window.pJSDom[0].fn.vendors.destroypJS(); } catch (e) {}
            window.pJSDom = [];
          }
          window.particlesJS('particles-demo', particlesPresets[preset]);
        });
      });
    } catch (e) { console.warn('Particles.js init:', e); }
  }
  window.addEventListener('load', initParticles);
})();
