# Fishing Planet Scraped Dataset

Dataset lengkap spesies ikan (*fish*) dan peralatan pancing (*gear / tackle*) yang di-scrape langsung dari [Fishing Planet Wiki](https://wiki.fishingplanet.com/wiki/).

---

## 📦 Isi Dataset

| File | Keterangan | Total Entri |
|---|---|---|
| `fish.json` | Seluruh spesies ikan di Fishing Planet | 340 spesies |
| `gear.json` | Seluruh tackle & perlengkapan pancing | 1.277 item |
| `fishingplanet_all.json` | Gabungan data ikan dan gear | 1.617 item |

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
