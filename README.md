# Pancho Meme Generator V2

No-API meme generator powered by one main image.

## Features
- One-click crypto meme generation (Spanglish + CT humor)
- Meme Modes: All, Bull, Bear, Degen
- Spice Slider: Mild, Savage, Unhinged
- Favorites with click-to-load
- Anti-repetition for recent captions and images
- Optional chaos sticker tags (REKT, FOMO, HODL, etc.)
- Copy-ready X caption + hashtags
- Export formats: 4:5, 1:1, 16:9

## Main image setup
Place your new image here:
- `public/assets/pancho-main.png`

Fallback image (already supported):
- `public/assets/pancho-base.png`

## Rotation images (optional)
To rotate many backgrounds/images on each `Generate Meme` click, add files using any of these patterns:
- `public/assets/pancho-01.png` ... `pancho-80.png`
- `public/assets/rotations/pancho_01.jpg` ... `pancho_80.jpg`
- `public/assets/variants/meme-01.webp` ... `meme-80.webp`

You can also define exact files in:
- `public/assets/rotation-images.json`

Example:
```json
{
  "images": [
    "public/assets/rotations/custom-1.png",
    "public/assets/rotations/custom-2.png"
  ]
}
```

## Run locally
```bash
python3 -m http.server 8080
```

Open:
- `http://localhost:8080`
