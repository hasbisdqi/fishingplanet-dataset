const fs = require("fs");
const path = require("path");
const { getAllFishList, scrapeFishPage, getAllGearList, scrapeGearFromPage } = require("./collect_all.js");

const OUTPUT_DIR = "/home/hasbisdqi/fishingplanet_scrape";

async function run() {
  console.log("=== STARTING FULL SCRAPE ===");

  // --- 1. FISH SCRAPING ---
  const fishList = await getAllFishList();
  console.log(`Discovered ${fishList.length} fish to scrape.`);
  
  const allFish = [];
  let fCount = 0;
  for (const item of fishList) {
    try {
      const data = await scrapeFishPage(item);
      if (data && data.name) {
        allFish.push(data);
      }
      fCount++;
      if (fCount % 25 === 0 || fCount === fishList.length) {
        console.log(`Fish progress: ${fCount}/${fishList.length}`);
      }
    } catch (err) {
      console.error(`Error scraping fish ${item.name}:`, err.message);
    }
  }

  const fishJsonPath = path.join(OUTPUT_DIR, "fish.json");
  fs.writeFileSync(fishJsonPath, JSON.stringify(allFish, null, 2), "utf8");
  console.log(`Saved ${allFish.length} fish to ${fishJsonPath}`);

  // --- 2. GEAR SCRAPING ---
  const gearPages = await getAllGearList();
  console.log(`Discovered ${gearPages.length} gear pages to scrape.`);

  const allGear = [];
  let gCount = 0;
  for (const gp of gearPages) {
    try {
      const items = await scrapeGearFromPage(gp);
      allGear.push(...items);
      gCount++;
      if (gCount % 10 === 0 || gCount === gearPages.length) {
        console.log(`Gear pages progress: ${gCount}/${gearPages.length} (Items so far: ${allGear.length})`);
      }
    } catch (err) {
      console.error(`Error scraping gear page ${gp.url}:`, err.message);
    }
  }

  // Deduplicate gear
  const uniqueGear = [];
  const gearSeen = new Set();
  for (const g of allGear) {
    const key = `${g.name}|${g.subCategory}`.toLowerCase();
    if (!gearSeen.has(key)) {
      gearSeen.add(key);
      uniqueGear.push(g);
    }
  }

  const gearJsonPath = path.join(OUTPUT_DIR, "gear.json");
  fs.writeFileSync(gearJsonPath, JSON.stringify(uniqueGear, null, 2), "utf8");
  console.log(`Saved ${uniqueGear.length} gear items to ${gearJsonPath}`);

  // Combined json
  const combinedPath = path.join(OUTPUT_DIR, "fishingplanet_all.json");
  fs.writeFileSync(combinedPath, JSON.stringify({
    scraped_at: new Date().toISOString(),
    total_fish: allFish.length,
    total_gear: uniqueGear.length,
    fish: allFish,
    gear: uniqueGear
  }, null, 2), "utf8");
  console.log(`Saved combined dataset to ${combinedPath}`);

  console.log("=== SCRAPE FINISHED SUCCESSFULLY ===");
}

run().catch(console.error);
