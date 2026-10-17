"""Generate POPS website product media (screenshots + captioned workflow videos)
from the real POPS frontend running with a fictional demo case (mock.js).

  cd POPS_Application && npm run build && npx vite preview --port 4174 &
  python3 generate_site_media.py [shots|videos|all]
"""
import asyncio, pathlib, subprocess, sys, time
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from playwright.async_api import async_playwright
import imageio_ffmpeg

BASE = "http://localhost:4174"
HERE = pathlib.Path(__file__).parent
MOCK = (HERE / "mock.js").read_text()
OVERLAY = (HERE / "overlay.js").read_text()
OUT = HERE / "out"
RAW = HERE / "raw"
PHOTO = HERE / "demo-exchange-photo.jpg"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
CHROME = "/root/bin/chromium"
GEO = {"latitude": 39.737211, "longitude": -104.989342, "accuracy": 8}
FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

DEVICES = {
    "desktop": {"platform": "windows", "viewport": (1440, 900), "scale": 2, "mobile": False},
    "android": {"platform": "android", "viewport": (412, 892), "scale": 3, "mobile": True},
    "ios": {"platform": "ios", "viewport": (393, 852), "scale": 3, "mobile": True},
}


def demo_photo():
    """Fictional scene used as the 'camera' photo in demos."""
    if PHOTO.exists():
        return
    w, h = 1600, 1200
    img = Image.new("RGB", (w, h), (120, 150, 185))
    d = ImageDraw.Draw(img)
    for y in range(h // 2):
        c = int(150 + 60 * y / (h / 2))
        d.line([(0, y), (w, y)], fill=(c - 40, c - 10, min(255, c + 30)))
    d.rectangle([0, 700, w, h], fill=(92, 96, 100))
    d.rectangle([180, 260, 1420, 760], fill=(186, 168, 140))
    d.rectangle([180, 230, 1420, 290], fill=(150, 130, 105))
    for x in range(260, 1400, 170):
        d.rectangle([x, 360, x + 110, 540], fill=(70, 90, 110))
    d.rectangle([700, 560, 900, 760], fill=(55, 60, 66))
    f = ImageFont.truetype(FONT, 64)
    d.text((800, 300), "CIVIC CENTER LIBRARY", font=f, fill=(250, 245, 230), anchor="mm")
    for x in range(0, w, 220):
        d.rectangle([x + 40, 960, x + 160, 975], fill=(230, 230, 230))
    img = img.filter(ImageFilter.GaussianBlur(1.2))
    d = ImageDraw.Draw(img)
    d.text((40, 1140), "5:40 PM  ·  exchange location", font=ImageFont.truetype(FONT, 36), fill=(255, 255, 255))
    img.save(PHOTO, quality=88)


async def new_context(browser, device, video=False):
    cfg = DEVICES[device]
    w, h = cfg["viewport"]
    kw = dict(viewport={"width": w, "height": h}, device_scale_factor=1 if video else cfg["scale"],
              permissions=["geolocation"], geolocation=GEO, is_mobile=cfg["mobile"], has_touch=cfg["mobile"])
    if video:
        kw["record_video_dir"] = str(RAW / device)
        kw["record_video_size"] = {"width": w, "height": h}
    ctx = await browser.new_context(**kw)
    await ctx.add_init_script(f"window.__POPS_DEMO_PLATFORM__={cfg['platform']!r};window.__POPS_DEMO_MOBILE__={str(cfg['mobile']).lower()};")
    await ctx.add_init_script(MOCK)
    await ctx.add_init_script(OVERLAY)
    return ctx


async def ready(page, mobile):
    await page.goto(BASE)
    await page.wait_for_selector(".pops-startup-splash", state="detached", timeout=45000)
    if mobile:
        await page.wait_for_selector(".mobile-topbar", state="visible", timeout=20000)
    await page.wait_for_timeout(1500)
    if await page.get_by_label("Close chat assistant").count():
        await page.get_by_label("Close chat assistant").first.click()
        await page.wait_for_timeout(400)


class Demo:
    def __init__(self, page, mobile, video):
        self.page, self.mobile, self.video = page, mobile, video

    async def pause(self, ms):
        await self.page.wait_for_timeout(ms if self.video else min(ms, 600))

    async def caption(self, step, title, text, hold=0):
        if self.video:
            await self.page.evaluate("a => window.__demo.caption(a[0], a[1], a[2])", [step, title, text])
        await self.pause(hold)

    async def hide_caption(self):
        if self.video:
            await self.page.evaluate("window.__demo.caption('', '', '')")

    async def card(self, title, sub, hold=3500, kicker="P.O.P.S."):
        if self.video:
            await self.page.evaluate("a => window.__demo.card(a[0], a[1], a[2])", [kicker, title, sub])
            await self.page.wait_for_timeout(hold)
            await self.page.evaluate("window.__demo.card('', '', '')")
            await self.page.wait_for_timeout(500)

    async def tap(self, locator, force=False):
        locator = locator.first
        await locator.scroll_into_view_if_needed()
        if self.video:
            box = await locator.bounding_box()
            if box:
                x, y = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
                await self.page.evaluate("a => window.__demo.pointer(a[0], a[1], a[2])", [x, y, self.mobile])
                await self.page.wait_for_timeout(750)
                await self.page.evaluate("a => window.__demo.press(a[0], a[1])", [x, y])
                await self.page.wait_for_timeout(250)
        await locator.click(force=force)

    async def scroll(self, selector, dy, steps=6):
        for _ in range(steps):
            await self.page.evaluate("a => { const el = document.querySelector(a[0]) || document.scrollingElement; el.scrollBy({top: a[1], behavior: 'smooth'}); }", [selector, dy / steps])
            await self.page.wait_for_timeout(160 if self.video else 40)

    async def to_top(self, selector=".main-content"):
        await self.page.evaluate("s => { const el = document.querySelector(s); if (el) el.scrollTo({top: 0}); window.scrollTo(0, 0); }", selector)

    async def nav(self, section, sub=None):
        """Desktop: sidebar section + item. Mobile: open drawer first."""
        p = self.page
        await self.hide_caption()
        if self.mobile:
            await self.tap(p.get_by_label("Open navigation"))
            await p.wait_for_timeout(500)
        sec = p.locator(".sidebar .nav-section-button", has_text=section).first
        if sub and not await p.locator(".sidebar .nav-subitem", has_text=sub).count():
            await self.tap(sec)
            await p.wait_for_timeout(350)
        if sub:
            await self.tap(p.locator(".sidebar .nav-subitem", has_text=sub))
        else:
            await self.tap(sec)
        await p.wait_for_timeout(900)
        if self.mobile and await p.locator(".sidebar.sidebar-mobile-open").count():
            await p.locator(".mobile-nav-backdrop").click(force=True)
            await p.wait_for_timeout(300)

    async def tab(self, label):
        await self.hide_caption()
        await self.tap(self.page.locator(".mobile-tab", has_text=label))
        await self.page.wait_for_timeout(900)

    async def pick_denied_day(self):
        days = self.page.locator(".viscal-day:has(.has-records)")
        if await days.count() >= 2:
            await self.tap(days.nth(1))
            await self.page.wait_for_timeout(800)
            entry = self.page.get_by_text("Attempted contact:").first
            if await entry.count():
                await entry.scroll_into_view_if_needed()

    async def enable_location(self):
        toggle = self.page.get_by_test_id("capture-location-toggle")
        await toggle.scroll_into_view_if_needed()
        if not await toggle.locator("input").is_checked():
            await self.tap(toggle.locator("input"))
            await self.page.wait_for_timeout(700)

    async def capture_photo(self):
        p = self.page
        await self.enable_location()
        async with p.expect_file_chooser() as fc:
            await self.tap(p.get_by_test_id("camera-capture-button"))
        chooser = await fc.value
        if self.video:
            await p.evaluate("window.__demo.shutter()")
            await p.wait_for_timeout(900)
        await self.hide_caption()
        await chooser.set_files(str(PHOTO))
        await p.wait_for_selector(".modal", state="visible", timeout=15000)
        await p.wait_for_timeout(1200)


async def snap(page, device, name):
    OUT.mkdir(parents=True, exist_ok=True)
    png = RAW / f"{device}-{name}.png"
    png.parent.mkdir(parents=True, exist_ok=True)
    await page.wait_for_timeout(500)
    await page.screenshot(path=str(png))
    Image.open(png).convert("RGB").save(OUT / f"{device}-{name}.webp", "WEBP", quality=84, method=6)
    print("shot", device, name)


async def flow_desktop(page, video):
    d = Demo(page, False, video)
    shot = (lambda n: asyncio.sleep(0)) if video else (lambda n: snap(page, "desktop", n))
    await d.card("POPS Desktop", "From a moment to a sealed, court-ready record.", 4000)

    await d.caption("Step 1 of 8", "Case Command", "Your primary case, active orders, upcoming dates and open alerts on one screen.", 3800)
    await shot("1-case-overview")
    await d.scroll(".main-content", 420)
    await d.pause(1800)
    await d.to_top()

    await d.nav("Evidence", "Evidence Vault")
    await d.caption("Step 2 of 8", "Evidence Vault", "Every item is preserved unaltered and fingerprinted with SHA-256 at import.", 3000)
    await page.get_by_test_id("camera-capture-button").scroll_into_view_if_needed()
    await d.pause(1200)
    await shot("2-evidence-vault")
    await d.caption("Step 3 of 8", "Capture & seal", "Turn on Attach location, then Capture Photo. POPS seals the original and re-verifies it.", 1200)
    await d.capture_photo()
    await d.caption("Step 3 of 8", "Sealed & verified", "The new record shows its SHA-256 fingerprint, VERIFIED integrity check and capture location.", 1500)
    await page.locator(".modal label", has_text="SHA-256").first.scroll_into_view_if_needed()
    await d.pause(2500)
    await shot("3-sealed-record")
    show_map = page.get_by_test_id("evidence-location-show-map")
    if await show_map.count():
        await d.caption("Step 4 of 8", "Where it happened", "Show map plots the device-reported location stored with the evidence.", 600)
        await d.tap(show_map)
        await page.wait_for_timeout(2500)
        await page.get_by_test_id("evidence-location-map").scroll_into_view_if_needed()
        await d.pause(3000)
        await shot("4-evidence-location")
    await d.tap(page.locator(".modal .modal-close"))
    await page.wait_for_timeout(600)

    await d.nav("Case Calendar", "Parenting Time & Exchanges")
    await d.caption("Step 5 of 8", "Parenting time calendar", "Scheduled, completed and denied exchanges, each tied to the order it falls under.", 1500)
    await d.pick_denied_day()
    await d.pause(2500)
    await shot("5-parenting-calendar")

    await d.nav("Legal", "Court Orders")
    await d.caption("Step 6 of 8", "Court orders & violations", "Orders, terms and linked violations stay together so nothing is lost between hearings.", 1500)
    await d.tap(page.get_by_text("Parenting Plan & Time-Sharing Order", exact=True))
    await page.wait_for_timeout(700)
    await d.pause(2500)
    await shot("6-court-orders")

    await d.nav("Reports", "Reports")
    await d.caption("Step 7 of 8", "Attorney packet", "Generate a packet with the evidence index, hashes and capture locations in one click.", 1500)
    await d.tap(page.locator("button", has_text="Generate Report"))
    await page.wait_for_timeout(700)
    await d.tap(page.locator(".modal div", has_text="Attorney Packet").last)
    await d.pause(900)
    await d.tap(page.locator(".modal-footer button", has_text="Generate"))
    await page.wait_for_timeout(900)
    await d.tap(page.locator("button", has_text="Preview"))
    await page.wait_for_timeout(900)
    await d.pause(2200)
    await d.scroll(".modal-body", 500)
    await d.pause(2200)
    await shot("7-attorney-packet")
    await d.tap(page.locator(".modal-footer button", has_text="Close"))
    await page.wait_for_timeout(500)

    await d.nav("Settings", "Vault Transfer")
    await d.caption("Step 8 of 8", "Vault Transfer", "Package the full vault, fingerprinted file by file, to move it to your phone.", 1500)
    await d.tap(page.get_by_test_id("vault-transfer-export-button"))
    await page.wait_for_selector("[data-testid=vault-transfer-export-result]", timeout=10000)
    await d.pause(3500)
    await shot("8-vault-transfer")

    await d.to_top()
    await d.hide_caption()
    if not video:
        await d.nav("Case Overview")
        await page.locator("button[title='Open chat assistant']").first.click()
        await page.wait_for_timeout(800)
        await shot("9-orb-assistant")
    await d.card("Your record stays on your device.", "Local-first · SHA-256 sealed · Ready for review   —   popsproof.com", 4200)


async def flow_mobile(page, device, video):
    d = Demo(page, True, video)
    name = "Android" if device == "android" else "iPhone"
    shot = (lambda n: asyncio.sleep(0)) if video else (lambda n: snap(page, device, n))
    await d.card(f"POPS for {name}", "Capture proof the moment it happens.", 3800)

    await d.caption("Step 1 of 6", "Case at a glance", "Dashboard shows the active case, orders, upcoming dates and alerts.", 3500)
    await shot("1-dashboard")

    await d.tab("Evidence")
    await d.caption("Step 2 of 6", "Capture evidence", "Turn on Attach location and tap Capture Photo. The camera opens.", 1200)
    await page.get_by_test_id("camera-capture-button").scroll_into_view_if_needed()
    await d.enable_location()
    await d.pause(800)
    await shot("2-capture")
    await d.capture_photo()
    await d.caption("Step 3 of 6", "Sealed on the device", "The original is saved unaltered, sealed with SHA-256 and verified, with GPS attached.", 1200)
    await page.locator(".modal label", has_text="SHA-256").first.scroll_into_view_if_needed()
    await d.pause(2300)
    await shot("3-sealed-record")
    show_map = page.get_by_test_id("evidence-location-show-map")
    if await show_map.count():
        await d.tap(show_map)
        await page.wait_for_timeout(2500)
        await page.get_by_test_id("evidence-location-map").scroll_into_view_if_needed()
        await d.caption("Step 3 of 6", "Location on the record", "Coordinates and accuracy are stored with the evidence in your local vault.", 3000)
        await shot("4-evidence-location")
    await d.tap(page.locator(".modal .modal-close"))
    await page.wait_for_timeout(600)

    await d.tab("Calendar")
    await d.caption("Step 4 of 6", "Every exchange logged", "Denied, late and completed exchanges with times, place and contact attempts.", 1200)
    await d.pick_denied_day()
    await d.pause(2500)
    await shot("5-calendar")

    await d.tap(page.get_by_label("Open chat assistant"))
    await page.wait_for_timeout(900)
    await d.caption("Step 5 of 6", "ORB assistant", "Quick actions: capture photo evidence, log an exchange, review orders.", 3500)
    await shot("6-orb-assistant")
    if await page.get_by_label("Close chat assistant").count():
        await d.tap(page.get_by_label("Close chat assistant"))
        await page.wait_for_timeout(500)

    await d.nav("Settings", "Vault Transfer")
    await d.caption("Step 6 of 6", "Bring your desktop vault", "Choose the .popsvault package. POPS checks every fingerprint before restoring.", 1200)
    await d.tap(page.get_by_test_id("vault-transfer-choose-button"))
    await page.wait_for_selector("[data-testid=vault-transfer-inspection]", timeout=10000)
    await d.pause(1500)
    box = page.get_by_test_id("vault-transfer-confirm-checkbox")
    if await box.count():
        await d.tap(box)
        await d.pause(600)
    await d.tap(page.get_by_test_id("vault-transfer-restore-button"))
    await page.wait_for_selector("[data-testid=vault-transfer-restore-result]", timeout=10000)
    await page.get_by_test_id("vault-transfer-restore-result").scroll_into_view_if_needed()
    await d.caption("Step 6 of 6", "Restored & re-verified", "All originals re-checked against their recorded SHA-256 on this phone.", 3500)
    await shot("7-vault-transfer")
    await d.hide_caption()
    await d.card("Your record stays on your phone.", "Local-first · SHA-256 sealed · popsproof.com", 4000)


def to_mp4(webm, mp4, skip):
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-ss", f"{skip:.2f}", "-i", str(webm),
                    "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p",
                    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-movflags", "+faststart", "-an", str(mp4)], check=True)
    poster = mp4.with_suffix(".jpg")
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-ss", "1.5", "-i", str(mp4), "-frames:v", "1", "-q:v", "3", str(poster)], check=True)
    print("video", mp4.name, round(mp4.stat().st_size / 1e6, 2), "MB")


async def run(device, video):
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
        ctx = await new_context(browser, device, video)
        page = await ctx.new_page()
        page.on("pageerror", lambda e: print("PAGEERR", device, str(e)[:200]))
        t0 = time.monotonic()
        await ready(page, DEVICES[device]["mobile"])
        skip = time.monotonic() - t0 - 0.3
        if device == "desktop":
            await flow_desktop(page, video)
        else:
            await flow_mobile(page, device, video)
        unknown = await page.evaluate("window.__POPS_DEMO_UNKNOWN__")
        if unknown:
            print("unmocked commands:", sorted(set(unknown)))
        vid = page.video
        await ctx.close()
        await browser.close()
        if video and vid:
            OUT.mkdir(parents=True, exist_ok=True)
            to_mp4(pathlib.Path(await vid.path()), OUT / f"pops-{device}-workflow.mp4", skip)


async def main(mode, devices):
    demo_photo()
    for dev in devices:
        if mode in ("shots", "all"):
            await run(dev, False)
        if mode in ("videos", "all"):
            await run(dev, True)


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    devs = sys.argv[2].split(",") if len(sys.argv) > 2 else list(DEVICES)
    asyncio.run(main(mode, devs))
