# Fishing Planet Scraped Dataset & Log App Assets

Dataset lengkap ikan (*fish*) dan peralatan pancing (*gear / tackle*) yang di-scrape langsung dari [Fishing Planet Wiki](https://wiki.fishingplanet.com/wiki/).

Proyek ini juga mencakup skrip scraper otomatis berbasis Node.js serta konsep UI/UX mobile mockup berbasis **Bento Grid** untuk aplikasi **Fishing Planet Catch & Gear Log**.

---

## 📦 Isi Dataset

| File | Keterangan | Total Entri |
|---|---|---|
| `fish.json` | Seluruh spesies ikan di game Fishing Planet | 340 spesies |
| `gear.json` | Seluruh tackle & perlengkapan pancing | 1.338 item |
| `fishingplanet_all.json` | Gabungan data ikan dan gear | 1.678 item |

### Skema Data

#### Ikan (`fish.json`)
```json
{
  "name": "Butterfly Peacock Bass",
  "category": "Bass family",
  "url": "https://wiki.fishingplanet.com/wiki/Butterfly_Peacock_Bass/en",
  "image": "https://wiki.fishingplanet.com/images/5/50/Butterfly_Peacock_Bass.png",
  "description": "Peacock bass (Cichla ocellaris) is native to the Amazon River Basin..."
}
```

#### Gear / Tackle (`gear.json`)
```json
{
  "name": "MagFin™ FeatherLight",
  "category": "Rods",
  "subCategory": "Spinning rods",
  "url": "https://wiki.fishingplanet.com/wiki/Spinning_rods",
  "image": "https://wiki.fishingplanet.com/images/f/f9/FeatherLight.png",
  "description": "Part of our PrimeSpinn® lux line rod segment..."
}
```

### Cakupan Kategori Gear:
- **Rods** (239 item)
- **Reels** (157 item)
- **Lines** (43 item)
- **Rig** (58 item)
- **Bobbers & Fishing Alarm** (37 item)
- **Hooks** (72 item)
- **Sinker & Feeders** (55 item)
- **Lures** (95 item)
- **Baits** (195 item)
- **Groundbaits** (69 item)
- **Equipment** (253 item)
- **Transport** (58 item)
- **Other** (5 item)

---

## 📱 Mobile UI Concept: Catch Log (Bento Grid)

Folder `mockups/` berisi rancangan antarmuka mobile untuk mencatat hasil tangkapan ikan lengkap beserta kombinasi gear dan kondisi cuaca saat ikan terpancing.

- `mockups/bento_catch_detail.html`: Standalone HTML prototype dengan Tailwind CSS.
- `mockups/bento_preview.png`: Screenshot tampilan mockup.

---

## 🛠️ Menjalankan Scraper Ulang

Jika wiki diperbarui di masa mendatang, scraper dapat dijalankan kembali:

```bash
# Menjalankan scraper
node run_scraper.js
```
