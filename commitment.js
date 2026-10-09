/* ============================================================
   CATALYZTER — Commitment Letter Addon
   فقط یک‌بار در اولین ورود نمایش داده می‌شود.
   هیچ تداخلی با app.js و index.html ندارد.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'catalyzter_commitment_signed_v1';
  if (localStorage.getItem(KEY)) return; // قبلاً امضا کرده → کاری نکن

  var CLAUSES = [
    'صبح‌ها ساعت ۶ بیدار می‌شوم',
    '۱۰۰ اسکواد، ۱۰۰ شنا، ۱۰۰ شکم و ۱۰ دقیقه پلانک',
    'دوش می‌گیرم',
    'صبحانه کامل می‌خورم',
    'قرآن می‌خوانم',
    'نماز پنج‌گانه را به‌جا می‌آورم',
    'آب کافی می‌نوشم',
    'ترک خودارضایی',
    'درس و مطالعه روزانه',
    'یادگیری زبان'
  ];

  var fa = function (s) {
    return String(s).replace(/[0-9]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  };

  /* ---------- استایل ---------- */
  var css = ''
    + '#cmt-overlay{position:fixed;inset:0;z-index:99999;display:flex;padding:16px;'
    + 'background:radial-gradient(ellipse at 50% -10%,#321500,transparent 55%),#080604;'
    + 'font-family:Tahoma,Arial,sans-serif;color:#fff7ee;direction:rtl;'
    + 'overflow-y:auto;opacity:0;transition:opacity .5s ease;}'
    + '#cmt-overlay.show{opacity:1;}'
    + '#cmt-overlay *{box-sizing:border-box;}'
    + '#cmt-card{width:100%;max-width:640px;margin:auto;padding:22px;'
    + 'background:linear-gradient(145deg,#1b140e,#100c08);'
    + 'border:1px solid #382416;border-radius:22px;'
    + 'box-shadow:0 20px 60px #0009;}'
    + '#cmt-card h1{font-size:clamp(20px,5vw,26px);margin:0 0 6px;text-align:center;}'
    + '#cmt-card h1 span{color:#ffc21a;}'
    + '#cmt-card .sub{text-align:center;color:#ac9b8c;font-size:11px;'
    + 'line-height:2;margin:0 0 22px;}'
    + '.cmt-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px;}'
    + '@media(max-width:480px){.cmt-row{grid-template-columns:1fr;}}'
    + '.cmt-field{margin-bottom:12px;}'
    + '.cmt-field label{display:block;font-size:12px;color:#ac9b8c;'
    + 'margin-bottom:6px;font-weight:bold;}'
    + '.cmt-field input{width:100%;padding:12px 14px;border-radius:12px;'
    + 'border:1px solid #52351e;background:#0b0907;color:#fff7ee;'
    + 'font:inherit;font-size:13px;outline:none;transition:.2s;}'
    + '.cmt-field input:focus{border-color:#ff7900;'
    + 'box-shadow:0 0 0 3px rgba(255,121,0,.15);}'
    + '.cmt-sec{display:flex;align-items:center;gap:10px;'
    + 'margin:22px 0 12px;font-size:14px;font-weight:bold;}'
    + '.cmt-sec::after{content:"";flex:1;height:1px;'
    + 'background:linear-gradient(90deg,#382416,transparent);}'
    + '.cmt-sec .dot{width:7px;height:7px;border-radius:50%;'
    + 'background:#ff7900;box-shadow:0 0 10px #ff7900;}'
    + '#cmt-clauses{display:flex;flex-direction:column;gap:7px;}'
    + '.cmt-item{display:flex;align-items:center;gap:11px;padding:11px 14px;'
    + 'border:1px solid #302116;border-radius:12px;background:#100d09;'
    + 'cursor:pointer;transition:.18s;user-select:none;}'
    + '.cmt-item:hover{border-color:#52351e;background:#18110a;}'
    + '.cmt-item input{position:absolute;opacity:0;pointer-events:none;}'
    + '.cmt-item .box{flex:none;width:20px;height:20px;border-radius:6px;'
    + 'border:1.5px solid #52351e;background:#0b0907;position:relative;'
    + 'transition:.18s;}'
    + '.cmt-item .box::after{content:"✓";position:absolute;inset:0;'
    + 'display:grid;place-items:center;font-size:13px;font-weight:bold;'
    + 'color:#1b0c00;opacity:0;transform:scale(.4);transition:.18s;}'
    + '.cmt-item .txt{font-size:12.5px;line-height:1.6;}'
    + '.cmt-item .num{margin-inline-start:auto;font-size:10px;color:#ac9b8c;'
    + 'font-weight:bold;flex:none;}'
    + '.cmt-item.on{border-color:#ff7900;background:rgba(255,121,0,.08);}'
    + '.cmt-item.on .box{background:linear-gradient(135deg,#ffc21a,#ff5b00);'
    + 'border-color:transparent;box-shadow:0 0 12px rgba(255,121,0,.5);}'
    + '.cmt-item.on .box::after{opacity:1;transform:scale(1);}'
    + '.cmt-duration{display:flex;align-items:center;justify-content:center;'
    + 'gap:8px;margin-top:14px;padding:14px;border-radius:14px;'
    + 'border:1px dashed rgba(255,121,0,.5);background:rgba(255,121,0,.06);'
    + 'font-size:13px;}'
    + '.cmt-duration b{font-size:19px;font-weight:900;'
    + 'background:linear-gradient(90deg,#ffc21a,#ff5b00);'
    + '-webkit-background-clip:text;background-clip:text;color:transparent;}'
    + '.cmt-sign-head{display:flex;align-items:center;justify-content:space-between;'
    + 'margin-bottom:8px;}'
    + '.cmt-sign-head span{font-size:12px;color:#ac9b8c;}'
    + '.cmt-sign-head button{background:none;border:none;color:#ff9b96;'
    + 'font-family:inherit;font-size:11px;cursor:pointer;padding:5px 9px;'
    + 'border-radius:8px;transition:.2s;}'
    + '.cmt-sign-head button:hover{background:rgba(255,80,80,.12);}'
    + '#cmt-sign{width:100%;height:150px;display:block;border-radius:14px;'
    + 'border:1.5px dashed #52351e;background:#0b0907;touch-action:none;'
    + 'cursor:crosshair;transition:.2s;}'
    + '#cmt-sign.active{border-color:#ff7900;border-style:solid;'
    + 'box-shadow:0 0 0 3px rgba(255,121,0,.15);}'
    + '.cmt-hint{font-size:10.5px;color:#8a6448;text-align:center;margin-top:7px;}'
    + '#cmt-msg{display:none;margin-top:14px;padding:11px 14px;border-radius:12px;'
    + 'font-size:12px;line-height:1.8;background:rgba(255,80,80,.1);'
    + 'border:1px solid rgba(255,80,80,.4);color:#ffb0b8;}'
    + '#cmt-msg.show{display:block;}'
    + '#cmt-submit{width:100%;margin-top:16px;padding:15px;border:none;'
    + 'border-radius:14px;font-family:inherit;font-size:14px;font-weight:900;'
    + 'cursor:pointer;background:linear-gradient(90deg,#ff7900,#ffc21a);'
    + 'color:#1b0c00;transition:.2s;box-shadow:0 0 20px rgba(255,121,0,.3);}'
    + '#cmt-submit:hover{transform:translateY(-2px);'
    + 'box-shadow:0 10px 30px rgba(255,80,0,.45);}'
    + '#cmt-submit:disabled{opacity:.6;cursor:wait;transform:none;}'
    + '.cmt-foot{text-align:center;font-size:10.5px;color:#7a5540;'
    + 'margin-top:14px;line-height:1.9;}'
    /* welcome */
    + '#cmt-welcome{display:none;text-align:center;padding:20px 10px;}'
    + '#cmt-welcome.show{display:block;animation:cmtPop .5s ease;}'
    + '@keyframes cmtPop{from{opacity:0;transform:scale(.92)}'
    + 'to{opacity:1;transform:none}}'
    + '#cmt-welcome .badge{width:90px;height:90px;border-radius:50%;'
    + 'margin:0 auto 22px;display:grid;place-items:center;font-size:40px;'
    + 'color:#ffc21a;background:linear-gradient(135deg,rgba(255,194,26,.15),'
    + 'rgba(255,91,0,.2));border:1px solid rgba(255,121,0,.5);'
    + 'box-shadow:0 0 30px rgba(255,121,0,.35);}'
    + '#cmt-welcome h2{font-size:clamp(19px,5vw,25px);margin:0 0 12px;}'
    + '#cmt-welcome h2 span{background:linear-gradient(90deg,#ffc21a,#ff5b00);'
    + '-webkit-background-clip:text;background-clip:text;color:transparent;}'
    + '#cmt-welcome .nm{font-size:15px;font-weight:bold;color:#ffc21a;'
    + 'margin-bottom:10px;}'
    + '#cmt-welcome p{color:#ac9b8c;font-size:12px;line-height:2;margin:0;}'
    + '#cmt-close{display:inline-block;margin-top:22px;padding:12px 32px;'
    + 'border:none;border-radius:12px;font-family:inherit;font-size:13px;'
    + 'font-weight:900;cursor:pointer;background:linear-gradient(90deg,'
    + '#ff7900,#ffc21a);color:#1b0c00;transition:.2s;}'
    + '#cmt-close:hover{transform:translateY(-2px);'
    + 'box-shadow:0 10px 26px rgba(255,121,0,.4);}';

  var styleTag = document.createElement('style');
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ---------- ساخت overlay ---------- */
  var overlay = document.createElement('div');
  overlay.id = 'cmt-overlay';
  overlay.innerHTML =
    '<div id="cmt-card">'
    + '  <div id="cmt-form">'
    + '    <h1>تعهدنامه <span>دیجیتال</span></h1>'
    + '    <p class="sub">قبل از شروع، هر بند را بخوان، بپذیر و با امضای خود آن را برای ۸۰ روز آینده‌ات الزام‌آور کن.</p>'
    + '    <div class="cmt-row">'
    + '      <div class="cmt-field"><label for="cmt-fname">نام</label>'
    + '        <input id="cmt-fname" type="text" placeholder="مثلاً: علی" autocomplete="given-name"></div>'
    + '      <div class="cmt-field"><label for="cmt-lname">نام خانوادگی</label>'
    + '        <input id="cmt-lname" type="text" placeholder="مثلاً: محمدی" autocomplete="family-name"></div>'
    + '    </div>'
    + '    <div class="cmt-sec"><span class="dot"></span> بندهای تعهدنامه</div>'
    + '    <div id="cmt-clauses"></div>'
    + '    <div class="cmt-duration"><span>این تعهد به مدت</span><b>۸۰ روز</b><span>لازم‌الاجراست</span></div>'
    + '    <div class="cmt-sec"><span class="dot"></span> امضای دیجیتال</div>'
    + '    <div class="cmt-sign-head">'
    + '      <span>امضای خود را در کادر زیر رسم کن</span>'
    + '      <button type="button" id="cmt-clear">پاک کردن</button>'
    + '    </div>'
    + '    <canvas id="cmt-sign"></canvas>'
    + '    <div class="cmt-hint">با ماوس یا انگشت، امضای خود را اینجا بکش</div>'
    + '    <div id="cmt-msg"></div>'
    + '    <button id="cmt-submit">ثبت تعهدنامه و امضا</button>'
    + '    <div class="cmt-foot">با ثبت این تعهدنامه، یک نسخه دیجیتال همراه امضای شما در همین مرورگر ذخیره می‌شود.</div>'
    + '  </div>'
    + '  <div id="cmt-welcome">'
    + '    <div class="badge">✓</div>'
    + '    <h2>خوش اومدی به <span>CATALYZTER</span></h2>'
    + '    <div class="nm" id="cmt-wName"></div>'
    + '    <p>تعهدنامه ۸۰ روزه‌ات با موفقیت ثبت و امضا شد.<br>از همین لحظه، مسیر ساخت نسخه جدید خودت شروع شد.</p>'
    + '    <button id="cmt-close">شروع</button>'
    + '  </div>'
    + '</div>';

  /* ---------- نمایش بعد از بسته شدن splash ---------- */
  function show() {
    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { overlay.classList.add('show'); });
    });
    initCanvas();
    fnameEl.focus();
  }

  function waitForSplash(cb) {
    var splash = document.getElementById('splash');
    if (!splash || splash.classList.contains('hide')) {
      setTimeout(cb, 300);
      return;
    }
    var done = false;
    var obs = new MutationObserver(function () {
      if (splash.classList.contains('hide')) {
        obs.disconnect();
        if (!done) { done = true; setTimeout(cb, 700); }
      }
    });
    obs.observe(splash, { attributes: true, attributeFilter: ['class'] });
    setTimeout(function () {
      obs.disconnect();
      if (!done) { done = true; cb(); }
    }, 8000);
  }

  /* ---------- ساخت بندها ---------- */
  var clausesBox = overlay.querySelector('#cmt-clauses');
  CLAUSES.forEach(function (text, i) {
    var el = document.createElement('label');
    el.className = 'cmt-item';
    el.innerHTML =
      '<input type="checkbox" data-i="' + i + '">'
      + '<span class="box"></span>'
      + '<span class="txt">' + text + '</span>'
      + '<span class="num">' + fa(i + 1) + '</span>';
    clausesBox.appendChild(el);
  });

  clausesBox.addEventListener('change', function (e) {
    if (e.target.matches('input[type="checkbox"]')) {
      e.target.closest('.cmt-item').classList.toggle('on', e.target.checked);
      hideMsg();
    }
  });

  /* ---------- امضا ---------- */
  var cvs, ctx, strokes = [], current = null, drawing = false;
  var fnameEl, lnameEl, msgEl, submitEl;

  function initCanvas() {
    cvs = overlay.querySelector('#cmt-sign');
    ctx = cvs.getContext('2d');
    fnameEl = overlay.querySelector('#cmt-fname');
    lnameEl = overlay.querySelector('#cmt-lname');
    msgEl = overlay.querySelector('#cmt-msg');
    submitEl = overlay.querySelector('#cmt-submit');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    cvs.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      cvs.setPointerCapture(e.pointerId);
      drawing = true;
      cvs.classList.add('active');
      current = [pos(e)];
      strokes.push(current);
      redraw();
      hideMsg();
    });
    cvs.addEventListener('pointermove', function (e) {
      if (!drawing || !current) return;
      e.preventDefault();
      current.push(pos(e));
      redraw();
    });
    function end() { drawing = false; current = null; cvs.classList.remove('active'); }
    cvs.addEventListener('pointerup', end);
    cvs.addEventListener('pointercancel', end);

    overlay.querySelector('#cmt-clear').onclick = function () {
      strokes = []; current = null; redraw(); hideMsg();
    };

    submitEl.onclick = onSubmit;
    overlay.querySelector('#cmt-close').onclick = function () {
      overlay.classList.remove('show');
      setTimeout(function () { overlay.remove(); }, 500);
    };
  }

  function resizeCanvas() {
    if (!cvs) return;
    var r = cvs.getBoundingClientRect();
    if (!r.width) return;
    var dpr = window.devicePixelRatio || 1;
    cvs.width  = Math.round(r.width  * dpr);
    cvs.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function redraw() {
    if (!ctx) return;
    var r = cvs.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ff7900';
    ctx.fillStyle = '#ffc21a';
    ctx.shadowColor = 'rgba(255,121,0,.7)';
    ctx.shadowBlur = 7;
    strokes.forEach(function (s) {
      if (s.length === 1) {
        ctx.beginPath();
        ctx.arc(s[0].x, s[0].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      for (var i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
  }

  function pos(e) {
    var r = cvs.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function showMsg(txt) {
    msgEl.textContent = txt;
    msgEl.classList.add('show');
  }
  function hideMsg() { msgEl.classList.remove('show'); }

  /* ---------- ثبت ---------- */
  var busy = false;
  function onSubmit() {
    if (busy) return;
    var fn = fnameEl.value.trim();
    var ln = lnameEl.value.trim();
    var checked = clausesBox.querySelectorAll('input[type="checkbox"]:checked');
    var missing = [];

    if (!fn || !ln) missing.push('نام و نام خانوادگی را کامل وارد کن');
    if (checked.length < CLAUSES.length)
      missing.push(fa(CLAUSES.length - checked.length) + ' بند دیگر باقی مانده');
    if (strokes.length === 0) missing.push('امضای دیجیتال را رسم کن');

    if (missing.length) { showMsg(missing.join('  •  ')); return; }

    busy = true;
    submitEl.disabled = true;
    submitEl.textContent = 'در حال ثبت…';

    var profile = {
      firstName: fn,
      lastName: ln,
      fullName: fn + ' ' + ln,
      signedAt: new Date().toISOString(),
      durationDays: 80,
      clauses: CLAUSES,
      signature: cvs.toDataURL('image/png')
    };

    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch (err) {
      showMsg('ذخیره‌سازی انجام نشد. حافظه مرورگر را بررسی کن.');
      busy = false;
      submitEl.disabled = false;
      submitEl.textContent = 'ثبت تعهدنامه و امضا';
      return;
    }

    // نمایش پیام خوش‌آمد
    overlay.querySelector('#cmt-form').style.display = 'none';
    overlay.querySelector('#cmt-wName').textContent = profile.fullName + ' عزیز';
    overlay.querySelector('#cmt-welcome').classList.add('show');
  }

  /* ---------- شروع ---------- */
  waitForSplash(show);

})();