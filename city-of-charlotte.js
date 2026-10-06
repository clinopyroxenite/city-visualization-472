// ===== Charlotte, NC proportional symbol map (OSM basemap) =====
// Controls: drag = pan | mouse wheel = zoom | arrow keys = move | R = reset | B = print boundary

// ---- Variables that move the city on the canvas ----
let cityX = 400;       // canvas x where the map centre sits
let cityY = 300;       // canvas y where the map centre sits
let zoomLevel = 10.3;  // map zoom (higher = closer)

const CENTER_LON = -80.82;
const CENTER_LAT = 35.20;

// ---- Basemap tile source ----
// If OSM tiles don't show in the p5 editor, swap in the CARTO line below.
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
// const TILE_URL = "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
let tiles = {};

// ---- Charlotte boundary: approximate fallback, replaced by the real OSM outline if it downloads ----
let boundary = [
  [-80.93, 35.37], [-80.85, 35.40], [-80.76, 35.38], [-80.70, 35.34],
  [-80.66, 35.30], [-80.64, 35.23], [-80.66, 35.17], [-80.70, 35.12],
  [-80.72, 35.06], [-80.76, 35.01], [-80.83, 35.00], [-80.89, 35.03],
  [-80.96, 35.06], [-81.00, 35.11], [-80.99, 35.17], [-80.97, 35.23],
  [-80.97, 35.30]
];
let BOUNDARY_CACHE = [];   // optional: press B after it loads, paste the console output here
let boundaryStatus = "Boundary: loading...";

// ---- Main roads (your traced coordinates) ----
const roads = [
  { name: "I-485", color: [200, 40, 40], closed: true, labelAt: 10, pts: [[-80.9686128,35.2148489],[-80.9693549,35.173821],[-80.9677996,35.1687357],[-80.9618378,35.1643917],[-80.9517286,35.1620608],[-80.9494165,35.1597203],[-80.9465652,35.1527267],[-80.9443619,35.1495477],[-80.9297166,35.1403276],[-80.9277725,35.1385259],[-80.9215515,35.1283506],[-80.9133864,35.1230504],[-80.9078134,35.1212483],[-80.9042973,35.1185981],[-80.8943178,35.1075721],[-80.8809685,35.1013163],[-80.8777284,35.0986895],[-80.8755251,35.0942358],[-80.872285,35.077161],[-80.8689152,35.0709029],[-80.8591949,35.0658112],[-80.8404022,35.0651747],[-80.8330147,35.0645382],[-80.8291266,35.0639017],[-80.8279601,35.0637956],[-80.8112924,35.0641139],[-80.800924,35.0634774],[-80.76943,35.0598705],[-80.7555623,35.0632652],[-80.7466196,35.0715393],[-80.7428461,35.0781156],[-80.7363658,35.0847974],[-80.7112225,35.1014465],[-80.6841351,35.1118372],[-80.6726415,35.1135599],[-80.6643468,35.1185426],[-80.6456837,35.1378345],[-80.6307791,35.1452727],[-80.6297423,35.1494057],[-80.6293535,35.1959495],[-80.6327232,35.2015626],[-80.6439988,35.2125241],[-80.6538488,35.2262886],[-80.6544968,35.2313702],[-80.652812,35.2357106],[-80.649183,35.2432754],[-80.6499607,35.2484619],[-80.6543672,35.2528013],[-80.6651244,35.2599979],[-80.6694014,35.265924],[-80.6710862,35.27058],[-80.6721231,35.2773518],[-80.6867684,35.3031334],[-80.6896197,35.3050372],[-80.7047835,35.3099024],[-80.708055,35.3126308],[-80.720497,35.3328282],[-80.7417522,35.3580509],[-80.7656568,35.3681974],[-80.7932626,35.3691486],[-80.8086856,35.3671405],[-80.8519975,35.3621731],[-80.8553672,35.3603762],[-80.8692349,35.347586],[-80.8803809,35.3442031],[-80.8883019,35.3398685],[-80.8925789,35.3393399],[-80.9016512,35.34008],[-80.9061874,35.3385999],[-80.9127972,35.3319389],[-80.9189492,35.3297185],[-80.9267254,35.3284496],[-80.9386491,35.323374],[-80.9435741,35.3190384],[-80.9531648,35.3074873],[-80.9547201,35.3050546],[-80.9580898,35.29691],[-80.9637924,35.2906688],[-80.9654773,35.2858024],[-80.9657365,35.2778675],[-80.9702726,35.2346643],[-80.9711799,35.2258813],[-80.9685878,35.2149758],[-80.9685878,35.214764]] },
  { name: "I-77", color: [230, 120, 20], closed: false, labelAt: 1, pts: [ [-80.9652965,35.0279689],[-80.9609555,35.0347253],[-80.9578524,35.0565622],[-80.9550847,35.0628781],[-80.9331848,35.0924871],[-80.9313415,35.1028856],[-80.9110646,35.1348039],[-80.8945715,35.1501154],[-80.8861309,35.1763049],[-80.8880713,35.1843371],[-80.8879743,35.1868744],[-80.8802128,35.2032067],[-80.8726453,35.2147729],[-80.8714811,35.2186567],[-80.8608091,35.2283258],[-80.8583836,35.2336354],[-80.855085,35.2368844],[-80.8475176,35.2440159],[-80.8408233,35.2594653],[-80.8406293,35.2611921],[-80.8451891,35.2679254],[-80.8452862,35.269272],[-80.8440249,35.2739453],[-80.8505252,35.288993],[-80.8514128,35.2925896],[-80.8473946,35.3113433],[-80.8489014,35.3413606],[-80.8477713,35.3490652],[-80.8426229,35.360433],[-80.8426229,35.367601],[-80.8487758,35.3792498],[-80.8499059,35.3829355],[-80.8501571,35.3883612],[-80.855431,35.3974716],[-80.8571889,35.4054041],[-80.8588213,35.4138985]] },
  { name: "I-85", color: [200, 40, 120], closed: false, labelAt: 1, pts: [[-81.041649,35.2565159],[-81.0053551,35.258428],[-80.9950783,35.2573657],[-80.9849316,35.2554537],[-80.9487274,35.2416431],[-80.9436541,35.2406869],[-80.9318163,35.2417493],[-80.9168564,35.2379244],[-80.8991648,35.2427055],[-80.8973436,35.2453615],[-80.8942215,35.251417],[-80.8888359,35.2544635],[-80.8824617,35.2597747],[-80.8790795,35.2615805],[-80.8719248,35.2676347],[-80.8436962,35.2731574],[-80.8319402,35.272945],[-80.8124273,35.2770868],[-80.8026709,35.2763435],[-80.7757431,35.2839894],[-80.763515,35.2982175],[-80.7583488,35.3120539],[-80.7470313,35.3256403],[-80.7410474,35.3402855],[-80.7095666,35.3735564],[-80.7068348,35.3794962],[-80.7068348,35.3794962] ] },
  { name: "I-277", color: [90, 60, 160], closed: false, labelAt: 0, pts: [[-80.8647116,35.2248493],[-80.8635202,35.2250278],[-80.85941,35.2245249],[-80.8562727,35.2246385],[-80.8534878,35.2239728],[-80.8501916,35.2220101],[-80.8418786,35.2156512],[-80.8406476,35.2150996],[-80.8385825,35.2148401],[-80.8368749,35.2156025],[-80.832957,35.2194963],[-80.8307383,35.2213395],[-80.829911,35.2216467],[-80.8292717,35.223582],[-80.8282564,35.2256095],[-80.828482,35.2272376],[-80.8290461,35.2278732],[-80.8357773,35.2337708],[-80.8391241,35.2356752],[-80.844652,35.2425231],[-80.8467578,35.2435673],[-80.8467954,35.2435673] ] }
];

// ---- Two proportional symbols (200 is twice 100) ----
const symbols = [
  { name: "Uptown",          lon: -80.843, lat: 35.227, value: 200 },
  { name: "University City", lon: -80.745, lat: 35.305, value: 100 }
];
const SYMBOL_K = 6.6; // diameter = sqrt(value) * SYMBOL_K, so AREA is proportional to value

// ---- Sample data points for clustering ----
let points = [];
const NUM_POINTS = 90;
const CLUSTER_CELL = 55;

function setup() {
  createCanvas(800, 600);
  startData();
}

// loads the boundary first, then makes the dots inside it
async function startData() {
  await loadBoundary();
  makePoints();
}

function makePoints() {
  randomSeed(7);
  points = [];
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (let p of boundary) {
    minLon = min(minLon, p[0]); maxLon = max(maxLon, p[0]);
    minLat = min(minLat, p[1]); maxLat = max(maxLat, p[1]);
  }
  let tries = 0;
  while (points.length < NUM_POINTS && tries < 20000) {
    tries++;
    let lon = random(minLon, maxLon);
    let lat = random(minLat, maxLat);
    if (insideBoundary(lon, lat)) points.push({ lon: lon, lat: lat });
  }
}

// ---------- Real city boundary from OpenStreetMap (Nominatim) ----------
async function loadBoundary() {
  if (BOUNDARY_CACHE.length > 2) {
    boundary = BOUNDARY_CACHE;
    boundaryStatus = "Boundary: saved data";
    return;
  }
  const url = "https://nominatim.openstreetmap.org/search?city=Charlotte" +
              "&state=North%20Carolina&country=US&featuretype=city" +
              "&polygon_geojson=1&format=jsonv2&limit=1";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data.length || !data[0].geojson) throw new Error("no polygon returned");
    let g = data[0].geojson;
    let rings;
    if (g.type === "Polygon") rings = [g.coordinates[0]];
    else if (g.type === "MultiPolygon") rings = g.coordinates.map(p => p[0]);
    else throw new Error("result was " + g.type + ", not a polygon");
    let best = rings.reduce((a, b) => (b.length > a.length ? b : a));
    boundary = thinRing(best, 0.003);   // raise to 0.01 for a simpler shape
    boundaryStatus = "Boundary: OpenStreetMap (" + boundary.length + " points)";
  } catch (err) {
    console.log("Boundary download failed:", err.message);
    boundaryStatus = "Boundary: download failed, using approximate shape";
  }
}

// keeps a point only if it is at least minDist degrees from the last kept point
function thinRing(ring, minDist) {
  let out = [ring[0]];
  for (let i = 1; i < ring.length; i++) {
    let last = out[out.length - 1];
    if (dist(ring[i][0], ring[i][1], last[0], last[1]) >= minDist) out.push(ring[i]);
  }
  return out.map(p => [p[0], p[1]]);
}

function draw() {
  background(230);

  // incremental assignment in the draw loop moves the city
  if (keyIsDown(LEFT_ARROW))  cityX -= 4;
  if (keyIsDown(RIGHT_ARROW)) cityX += 4;
  if (keyIsDown(UP_ARROW))    cityY -= 4;
  if (keyIsDown(DOWN_ARROW))  cityY += 4;

  drawBasemap();
  drawBoundary();
  drawRoads();
  drawClusters();
  drawSymbols();
  drawLegend();
}

// ---------- Web Mercator conversion (matches map tiles) ----------
function merc(lon, lat) {
  let x = (lon + 180) / 360;
  let latRad = radians(lat);
  let y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
  return { x: x, y: y };
}

function toScreen(lon, lat) {
  let m = merc(lon, lat);
  let c = merc(CENTER_LON, CENTER_LAT);
  let mapSize = 256 * pow(2, zoomLevel);
  return createVector((m.x - c.x) * mapSize + cityX, (m.y - c.y) * mapSize + cityY);
}

// ---------- OSM tiles ----------
function getTile(z, x, y) {
  let key = z + "/" + x + "/" + y;
  if (!tiles[key]) {
    tiles[key] = { img: null, ok: false };
    let url = TILE_URL.replace("{z}", z).replace("{x}", x).replace("{y}", y);
    loadImage(url,
      (img) => { tiles[key].img = img; tiles[key].ok = true; },
      () => { tiles[key].failed = true; });
  }
  return tiles[key];
}

function drawBasemap() {
  let c = merc(CENTER_LON, CENTER_LAT);
  let mapSize = 256 * pow(2, zoomLevel);
  let zi = constrain(round(zoomLevel), 0, 18);
  let n = pow(2, zi);
  let ts = mapSize / n;

  let tx0 = floor(((0 - cityX) / mapSize + c.x) * n);
  let tx1 = floor(((width - cityX) / mapSize + c.x) * n);
  let ty0 = floor(((0 - cityY) / mapSize + c.y) * n);
  let ty1 = floor(((height - cityY) / mapSize + c.y) * n);

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      if (ty < 0 || ty >= n) continue;
      let wrappedX = ((tx % n) + n) % n;
      let sx = (tx / n - c.x) * mapSize + cityX;
      let sy = (ty / n - c.y) * mapSize + cityY;
      let t = getTile(zi, wrappedX, ty);
      if (t.ok) {
        image(t.img, sx, sy, ts + 1, ts + 1);
      } else {
        noStroke();
        fill(225);
        rect(sx, sy, ts + 1, ts + 1);
      }
    }
  }
}

// ---------- Boundary ----------
function drawBoundary() {
  fill(200, 70, 60, 25);
  stroke(170, 40, 35);
  strokeWeight(3);
  beginShape();
  for (let p of boundary) { let s = toScreen(p[0], p[1]); vertex(s.x, s.y); }
  endShape(CLOSE);
}

// ---------- Main roads ----------
function drawRoads() {
  noFill();
  for (let pass = 0; pass < 2; pass++) {
    for (let r of roads) {
      if (pass === 0) { stroke(255); strokeWeight(7); }
      else            { stroke(r.color[0], r.color[1], r.color[2]); strokeWeight(4); }
      beginShape();
      for (let p of r.pts) { let s = toScreen(p[0], p[1]); vertex(s.x, s.y); }
      endShape(r.closed ? CLOSE : OPEN);
    }
  }
  // labels
  textAlign(CENTER, CENTER);
  textSize(12);
  textStyle(BOLD);
  for (let r of roads) {
    let p = r.pts[r.labelAt];
    let s = toScreen(p[0], p[1]);
    stroke(255);
    strokeWeight(4);
    fill(r.color[0], r.color[1], r.color[2]);
    text(r.name, s.x, s.y);
  }
}

// ---------- Clustering dots ----------
function drawClusters() {
  let cells = {};
  for (let p of points) {
    let s = toScreen(p.lon, p.lat);
    let key = floor(s.x / CLUSTER_CELL) + "_" + floor(s.y / CLUSTER_CELL);
    if (!cells[key]) cells[key] = { sx: 0, sy: 0, n: 0 };
    cells[key].sx += s.x;
    cells[key].sy += s.y;
    cells[key].n++;
  }
  for (let key in cells) {
    let c = cells[key];
    let x = c.sx / c.n;
    let y = c.sy / c.n;
    stroke(255);
    strokeWeight(1.5);
    if (c.n === 1) {
      fill(20, 110, 120);
      circle(x, y, 9);
    } else {
      fill(20, 110, 120, 215);
      circle(x, y, 18 + sqrt(c.n) * 9);
      noStroke();
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(12);
      textStyle(BOLD);
      text(c.n, x, y);
    }
  }
}

// ---------- Two proportional symbols ----------
function drawSymbols() {
  for (let s of symbols) {
    let pos = toScreen(s.lon, s.lat);
    let d = sqrt(s.value) * SYMBOL_K;
    fill(255, 150, 20, 190);
    stroke(120, 60, 0);
    strokeWeight(2);
    circle(pos.x, pos.y, d);
    stroke(255);
    strokeWeight(3);
    fill(40);
    textAlign(CENTER, TOP);
    textSize(12);
    textStyle(BOLD);
    text(s.name + " (" + s.value + ")", pos.x, pos.y + d / 2 + 4);
  }
}

// ---------- Legend and attribution ----------
function drawLegend() {
  noStroke();
  fill(255, 255, 255, 225);
  rect(10, 10, 300, 108, 6);
  fill(30);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(15);
  text("Charlotte, NC", 20, 18);
  textStyle(NORMAL);
  textSize(11);
  text("Orange circles: sample data (area proportional to value)", 20, 40);
  text("Teal dots: sample points; zoom out to cluster them", 20, 56);
  text("Drag = pan | Wheel = zoom | Arrows = move | R = reset", 20, 72);
  text(boundaryStatus, 20, 92);

  fill(255, 255, 255, 200);
  rect(width - 190, height - 20, 190, 20);
  fill(60);
  textAlign(RIGHT, CENTER);
  textSize(10);
  text("© OpenStreetMap contributors", width - 6, height - 10);
}

// ---------- Interaction ----------
function mouseDragged() {
  cityX += mouseX - pmouseX;
  cityY += mouseY - pmouseY;
}

function mouseWheel(event) {
  let newZoom = constrain(zoomLevel + (event.delta > 0 ? -0.25 : 0.25), 9, 17);
  let f = pow(2, newZoom - zoomLevel);
  cityX = mouseX - (mouseX - cityX) * f;
  cityY = mouseY - (mouseY - cityY) * f;
  zoomLevel = newZoom;
  return false;
}

function keyPressed() {
  if (key === 'r' || key === 'R') { cityX = 400; cityY = 300; zoomLevel = 10.3; }
  if (key === 'b' || key === 'B') {
    console.log(JSON.stringify(boundary.map(p => [Number(p[0].toFixed(4)), Number(p[1].toFixed(4))])));
  }
}

// ---------- Point-in-polygon ----------
function insideBoundary(lon, lat) {
  let inside = false;
  for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
    let xi = boundary[i][0], yi = boundary[i][1];
    let xj = boundary[j][0], yj = boundary[j][1];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
