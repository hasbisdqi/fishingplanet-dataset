# Fishing Planet Scraped Dataset

Dataset lengkap spesies ikan (*fish*), peralatan pancing (*gear / tackle*), dan lokasi/peta perairan (*maps / waterways*) yang di-scrape langsung dari [Fishing Planet Wiki](https://wiki.fishingplanet.com/wiki/).

---

## 📦 Isi Dataset

| File | Keterangan | Total Entri |
|---|---|---|
| `fish.json` | Seluruh spesies ikan di Fishing Planet | 340 spesies |
| `gear.json` | Seluruh tackle & perlengkapan pancing (100% with image) | 1.464 item |
| `maps.json` | Seluruh peta/lokasi danau, sungai, dan laut | 28 map |
| `fishingplanet_all.json` | Gabungan data ikan, gear, dan map | 1.832 item |

---

## 📋 Skema Data

### 1. Ikan (`fish.json`)
```json
{
  "name": "Butterfly Peacock Bass",
  "category": "Bass family",
  "url": "https://wiki.fishingplanet.com/wiki/Butterfly_Peacock_Bass/en",
  "image": "https://wiki.fishingplanet.com/images/5/50/Butterfly_Peacock_Bass.png",
  "description": "Peacock bass (Cichla ocellaris) is native to the Amazon River Basin..."
}
```

### 2. Gear / Tackle (`gear.json`)
```json
{
  "name": "Slim (Natural / Red / Green)",
  "category": "Bobbers and Fishing Alarm",
  "subCategory": "Classic Bobbers",
  "url": "https://wiki.fishingplanet.com/wiki/Classic_Bobbers",
  "image": "https://wiki.fishingplanet.com/images/thumb/e/e1/115.png/200px-115.png",
  "description": "Slim Floats are made of high-quality plastic, allowing gentle presentations and smooth drifts..."
}
```

### 3. Maps / Waterways (`maps.json`)
```json
{
  "name": "Lone Star Lake - Texas",
  "region": "North America",
  "locationCountry": "Texas",
  "url": "https://wiki.fishingplanet.com/wiki/Lone_Star_Lake_-_Texas",
  "image": "https://wiki.fishingplanet.com/images/5/56/LoneStarLake.jpg",
  "requiredLevel": 2,
  "fees": {
    "travel": "FREE",
    "daily": "FREE"
  },
  "description": "Lone Star Lake is your quiet spot in the heart of the Texas countryside...",
  "pegs": [
    {
      "name": "Home Sweet Home",
      "description": "This cozy house was built for true angling enthusiasts..."
    }
  ],
  "fishSpecies": [
    {
      "name": "Guadalupe Bass",
      "rarityFound": "Common Trophy Unique",
      "image": "https://wiki.fishingplanet.com/images/thumb/9/91/Guadalupe_Bass.png/300px-Guadalupe_Bass.png",
      "url": "https://wiki.fishingplanet.com/wiki/Guadalupe_Bass"
    }
  ]
}
```
