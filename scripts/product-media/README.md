# POPS product media generator

Recreates the screenshots and captioned workflow videos in `public/media/` from the real POPS app
(`POPS_Application`, branch `mobile-tauri-v2`) using a fictional sample case (`mock.js`). No real records are used.

```bash
cd ~/projects/POPS_Application && npm run build && npx vite preview --port 4174 &
cd ~/projects/POPS_website/scripts/product-media
pip install playwright pillow imageio-ffmpeg && playwright install chromium
python3 generate_site_media.py all            # or: shots | videos, then desktop,android,ios
```
Output lands in `out/`. Copy `out/<device>-*.webp` to `public/media/<device>/` (drop the `<device>-` prefix) and the MP4/JPG files to `public/media/`.
Set `CHROME` in the script to your Chromium path. Make WebM copies with:
`ffmpeg -i pops-desktop-workflow.mp4 -c:v libvpx-vp9 -b:v 0 -crf 36 -an pops-desktop-workflow.webm`
