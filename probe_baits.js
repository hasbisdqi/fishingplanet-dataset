const https = require("https");
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
  const html = await fetch("https://wiki.fishingplanet.com/wiki/Baits");
  const content = html.slice(html.indexOf("mw-parser-output"));
  const reg = /<a href="(\/wiki\/[^":]+)"\s+title="([^"]+)">/g;
  let m;
  const set = new Set();
  while ((m = reg.exec(content)) !== null) {
    if (!m[1].includes("index.php") && !m[1].includes("Float_fishing") && !m[1].includes("Main_page")) {
      set.add(`${m[2]} -> ${m[1]}`);
    }
  }
  console.log("Baits links:");
  set.forEach(s => console.log(" ", s));
}
run();
