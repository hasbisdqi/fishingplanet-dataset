const https = require("https");

const tackleCats = [
  "Rods", "Reels", "Lines", "Rig", "Bobbers_and_Fishing_Alarm",
  "Hooks", "Sinker_and_Feeders", "Lures", "Baits", "Groundbaits",
  "Equipment", "Transport", "Other"
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function run() {
  for (const cat of tackleCats) {
    const html = await fetch(`https://wiki.fishingplanet.com/wiki/${cat}`);
    // Check if it has subcategories (like Rods had Match rods, Spinning rods, etc.)
    // Look for links in mw-parser-output
    const content = html.slice(html.indexOf("mw-parser-output"));
    // check bold links or gallery
    const sublinks = [];
    const reg = /<a href="(\/wiki\/[^":]+)"[^>]*><b>(.*?)<\/b><\/a>/g;
    let m;
    while ((m = reg.exec(content)) !== null) {
      if (!m[1].includes("index.php") && !m[1].includes("Brands") && !m[1].includes("Technologies")) {
        sublinks.push({ title: m[2].trim(), url: m[1] });
      }
    }
    // also check gallerybox
    const greg = /<li[^>]*class="gallerybox"[\s\S]*?<a\s+href="(\/wiki\/[^":]+)"\s+title="([^"]+)"/g;
    let gm;
    while ((gm = greg.exec(content)) !== null) {
      sublinks.push({ title: gm[2].trim(), url: gm[1] });
    }
    // check tables count
    const tableCount = (content.match(/<table/g) || []).length;
    console.log(`[${cat}] sublinks: ${sublinks.length}, tables: ${tableCount}`);
    if (sublinks.length > 0) {
      console.log(`   Subs:`, sublinks.map(s => s.title).join(", "));
    }
  }
}
run();
