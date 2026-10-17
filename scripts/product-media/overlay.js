// On-screen captions, title cards and a visible pointer for POPS demo recordings.
(() => {
  const css = `
  #demo-cap{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);z-index:2147483600;opacity:0;transition:opacity .35s,transform .35s;
    width:min(860px,calc(100vw - 28px));box-sizing:border-box;padding:14px 20px;border-radius:14px;background:rgba(6,12,24,.92);border:1px solid rgba(76,158,255,.55);
    box-shadow:0 10px 40px rgba(0,0,0,.55);font-family:Inter,'Segoe UI',Arial,sans-serif;color:#eef3ff;pointer-events:none}
  #demo-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
  #demo-cap .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7fb4ff;font-weight:700}
  #demo-cap .t{font-size:20px;font-weight:800;margin:3px 0 2px;color:#fbbf24}
  #demo-cap .s{font-size:15px;line-height:1.4;color:#d8e2f5}
  .demo-m #demo-cap{bottom:84px;padding:11px 14px}.demo-m #demo-cap .t{font-size:16px}.demo-m #demo-cap .s{font-size:13px}
  #demo-card{position:fixed;inset:0;z-index:2147483640;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;
    background:radial-gradient(circle at 50% 38%,#12305e 0,#070c17 64%);opacity:0;transition:opacity .45s;pointer-events:none;font-family:Inter,'Segoe UI',Arial,sans-serif}
  #demo-card.on{opacity:1}
  #demo-card img{width:120px;height:120px;object-fit:contain;filter:drop-shadow(0 10px 28px rgba(47,143,255,.5));margin-bottom:22px}
  #demo-card .k{font-size:15px;letter-spacing:.5em;color:#fbbf24;font-weight:800}
  #demo-card .t{font-size:46px;font-weight:800;color:#f2f6ff;margin:12px 0 10px}
  #demo-card .s{font-size:20px;color:#9fb3d9;max-width:760px;line-height:1.45}
  .demo-m #demo-card .t{font-size:30px}.demo-m #demo-card .s{font-size:16px}
  #demo-ptr{position:fixed;left:0;top:0;z-index:2147483620;pointer-events:none;transition:transform .7s cubic-bezier(.4,.1,.2,1);transform:translate(-80px,-80px)}
  #demo-ptr.arrow svg{display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6))}
  #demo-ptr.touch{width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.85);box-shadow:0 0 0 6px rgba(76,158,255,.25)}
  .demo-ring{position:fixed;z-index:2147483610;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:3px solid #4c9eff;pointer-events:none;animation:demoRing .6s ease-out forwards}
  @keyframes demoRing{to{transform:scale(4);opacity:0}}
  #demo-flash{position:fixed;inset:0;background:#fff;z-index:2147483630;opacity:0;pointer-events:none;transition:opacity .12s}`;
  function ensure() {
    if (document.getElementById('demo-cap') || !document.body) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    if (window.__POPS_DEMO_MOBILE__) document.documentElement.classList.add('demo-m');
    document.body.insertAdjacentHTML('beforeend', '<div id="demo-cap"><div class="k"></div><div class="t"></div><div class="s"></div></div><div id="demo-card"><img src="/popsbadge.png" alt=""/><div class="k"></div><div class="t"></div><div class="s"></div></div><div id="demo-ptr"></div><div id="demo-flash"></div>');
  }
  const set = (el, k, t, s) => { el.querySelector('.k').textContent = k; el.querySelector('.t').textContent = t; el.querySelector('.s').textContent = s; el.classList.toggle('on', !!t); };
  window.__demo = {
    caption(k, t, s) { ensure(); set(document.getElementById('demo-cap'), k, t, s); },
    card(k, t, s) { ensure(); set(document.getElementById('demo-card'), k, t, s); },
    pointer(x, y, touch) {
      ensure(); const p = document.getElementById('demo-ptr');
      if (touch) { p.className = 'touch'; p.innerHTML = ''; }
      else if (p.className !== 'arrow') { p.className = 'arrow'; p.innerHTML = '<svg width="26" height="30" viewBox="0 0 26 30"><path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 16 L21 16 Z" fill="#fff" stroke="#111" stroke-width="1.6"/></svg>'; }
      p.style.transform = `translate(${x}px, ${y}px)`;
    },
    press(x, y) { const r = document.createElement('div'); r.className = 'demo-ring'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); },
    shutter() { ensure(); const f = document.getElementById('demo-flash'); f.style.opacity = '.85'; setTimeout(() => (f.style.opacity = '0'), 140); },
  };
  document.addEventListener('DOMContentLoaded', ensure);
})();
