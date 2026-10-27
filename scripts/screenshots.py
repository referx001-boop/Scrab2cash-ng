"""Capture mobile screenshots of the built app (dist/) with headless Chromium.
Usage: python3 scripts/screenshots.py  (serves dist/ on :4173 itself)"""
import http.server, threading, functools, os, json, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST, OUT = os.path.join(ROOT, 'dist'), os.path.join(ROOT, 'screenshots')
os.makedirs(OUT, exist_ok=True)
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIST)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
Handler = functools.partial(Quiet, directory=DIST)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 4173), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:4173/'

cart = [{"materialId": "pet_clear", "kg": 12}, {"materialId": "al_cans", "kg": 3}, {"materialId": "carton", "kg": 8}]
now = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
log = [
  {"id": "a", "date": now, "materialId": "pet_clear", "kg": 18, "naira": 5000, "estimated": False},
  {"id": "b", "date": now, "materialId": "al_cans", "kg": 4, "naira": 3000, "estimated": True},
  {"id": "c", "date": now, "materialId": "carton", "kg": 10, "naira": 800, "estimated": True},
  {"id": "d", "date": now, "materialId": "iron", "kg": 6, "naira": 2580, "estimated": False},
]
profile = {"name": "Yusuf", "area": "Rumuola, Port Harcourt", "landmark": "near the filling station", "when": "Saturday morning"}

with sync_playwright() as p:
    import glob
    cands = ['/usr/bin/chromium', '/usr/bin/chromium-browser', *sorted(glob.glob(os.path.expanduser('~/.cache/ms-playwright/chromium-*/chrome-linux/chrome')))]
    exe = next((c for c in cands if os.path.exists(c)), None)  # None = Playwright's default browser
    b = p.chromium.launch(executable_path=exe, args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='en-NG')
    page = ctx.new_page()
    page.goto(URL)
    page.evaluate("""([c,l,p]) => { localStorage.setItem('s2c.cart.v1', JSON.stringify(c)); localStorage.setItem('s2c.log.v1', JSON.stringify(l)); localStorage.setItem('s2c.profile.v1', JSON.stringify(p)); localStorage.setItem('s2c.city.v1', JSON.stringify('Port Harcourt')) }""", [cart, log, profile])

    def go(h):
        page.goto(URL + h); page.evaluate("window.scrollTo({top: 0, behavior: 'instant'})"); page.wait_for_timeout(150)

    def shot(name, full=False):
        page.wait_for_timeout(900)  # let entrance animations and number tweens settle
        page.screenshot(path=os.path.join(OUT, name), full_page=full)
        print('saved', name)

    # 1 estimate (top) + bag
    page.goto(URL + '#/estimate'); page.reload()
    shot('01-home.png')
    page.get_by_role('radio', name='Aluminium drink cans').click()
    page.get_by_role('radio', name='By count').click()
    page.fill('#count', '60')
    page.get_by_text('Show how we priced this').click()
    page.wait_for_timeout(400)
    page.evaluate("window.scrollTo({top: document.querySelector('#count').getBoundingClientRect().top + window.scrollY - 560, behavior: 'instant'})")
    shot('02-estimate-sources.png')
    page.evaluate("window.scrollTo({top: document.querySelector('#bag').getBoundingClientRect().top + window.scrollY - 76, behavior: 'instant'})")
    shot('03-bag-total.png')
    # 3 ask
    go('#/ask')
    for q in ['used diapers', '2kg malt cans', '30 pure water bottles']:
        page.fill('#ask', q); page.keyboard.press('Enter')
    shot('04-assistant.png')
    # 4 collectors
    go('#/collectors')
    shot('05-collectors-ph.png')
    # 5 pickup
    go('#/pickup')
    page.get_by_text('Fifthseed Recycling: Eleme hub').click()
    page.wait_for_timeout(300)
    page.evaluate("window.scrollTo({top: document.querySelector('#preview').getBoundingClientRect().top + window.scrollY - 330, behavior: 'instant'})")
    shot('06-pickup-whatsapp.png')
    # 6 impact
    go('#/impact')
    shot('07-impact.png')
    # 7 about / sources
    go('#/about')
    page.evaluate("window.scrollTo({top: [...document.querySelectorAll('h2')].find(h => h.textContent.includes('Full price')).getBoundingClientRect().top + window.scrollY - 100, behavior: 'instant'})")
    shot('08-price-table.png')
    # offline check: service worker serves the app with network off
    page.goto(URL); page.wait_for_timeout(1500); page.reload(); page.wait_for_timeout(800)
    ctx.set_offline(True)
    page.reload(); page.wait_for_timeout(800)
    ok = page.get_by_label('Scrap2Cash NG home').first.is_visible()
    print('offline reload renders app:', ok)
    ctx.set_offline(False)
    b.close()
srv.shutdown()
