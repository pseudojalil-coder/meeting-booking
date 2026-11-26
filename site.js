// Wattlegrove Community Network (FICTIONAL test site): puts the pasted SupporterHub iframe code into each page's booking slot,
// once per page load (as a real website does), and logs what the frame tells this page.
(function () {
  var KEYS = { type: 'wcn_type_code', team: 'wcn_team_code', tunnel: 'wcn_tunnel' };
  function get(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function swapTunnel(code) {
    var t = get(KEYS.tunnel).replace(/\/+$/, '');
    return t ? code.replace(/https?:\/\/localhost:3001/g, t) : code;
  }
  // Scripts set with innerHTML don't run: re-create them.
  function inject(slot, html) {
    slot.innerHTML = html;
    slot.querySelectorAll('script').forEach(function (old) {
      var s = document.createElement('script');
      if (old.src) s.src = old.src; else s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  // Phone menu
  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('nav.main');
  if (btn && nav) btn.addEventListener('click', function () { nav.classList.toggle('open'); });

  // The page's booking slot: data-code="type" or "team" (team falls back to the meeting type's code).
  var slot = document.querySelector('.booking-slot');
  if (slot) {
    var want = slot.getAttribute('data-code') || 'type';
    var code = get(want === 'team' ? KEYS.team : KEYS.type) || get(KEYS.type);
    if (code) inject(slot, swapTunnel(code));
    else slot.innerHTML = '<div class="booking-missing">The booking form appears here. <a href="setup.html">Set up the test site</a> first.</div>';
  }

  // Test tools: a corner button opening a log of the frame's messages.
  var toggle = document.createElement('button'); toggle.className = 'tt-toggle'; toggle.textContent = 'Test log';
  var panel = document.createElement('div'); panel.className = 'tt-panel';
  panel.innerHTML = '<div id="tt-verdict">No messages yet.</div><div id="tt-size"></div><div id="tt-log"></div><p><a href="setup.html">Setup</a></p>';
  document.body.appendChild(toggle); document.body.appendChild(panel);
  toggle.addEventListener('click', function () { panel.classList.toggle('open'); });
  var count = 0, bad = 0;
  window.addEventListener('message', function (e) {
    var frame = slot && slot.querySelector('iframe');
    if (!frame || e.source !== frame.contentWindow) return;
    count++;
    var d = e.data, text; try { text = JSON.stringify(d); } catch (x) { text = String(d); }
    var keys = d && typeof d === 'object' ? Object.keys(d).sort().join(',') : '';
    var ok = (keys === 'height' && typeof d.height === 'number') || (keys === 'action' && d.action === 'scrollToTop');
    if (ok && /\/|token|booking|http/i.test(text)) ok = false;
    if (!ok) bad++;
    var line = document.createElement('div'); line.className = ok ? 'ok' : 'bad';
    line.textContent = new Date().toLocaleTimeString() + ' ' + text + (ok ? '' : '  ⚠ not height or scroll-to-top');
    var log = document.getElementById('tt-log'); log.insertBefore(line, log.firstChild);
    document.getElementById('tt-verdict').textContent = bad ? bad + ' of ' + count + ' messages were NOT height or scroll-to-top.' : 'All ' + count + ' messages were height or scroll-to-top only.';
    var r = frame.getBoundingClientRect();
    document.getElementById('tt-size').textContent = 'Frame ' + Math.round(r.width) + ' × ' + Math.round(r.height) + 'px';
  });
})();
