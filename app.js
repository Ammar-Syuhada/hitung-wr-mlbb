const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Logika Matematika Kalkulator WR (Sama dengan Service Layer)
const calculateWr = (totalMatch, currentWr, targetWr) => {
  const totalWin = Math.round((currentWr / 100) * totalMatch);
  const totalLose = totalMatch - totalWin;
  let neededWinStreak = 0;

  if (targetWr && targetWr > currentWr) {
    const numerator = targetWr * totalMatch - 100 * totalWin;
    const denominator = 100 - targetWr;
    neededWinStreak = Math.ceil(numerator / denominator);
  }

  return { totalWin, totalLose, neededWinStreak };
};

// Menu 1: Home - Grid Hero dari JSON
app.get("/", (req, requireRes) => {
  const rawData = fs.readFileSync(
    path.join(__dirname, "data", "hero-meta-final.json"),
  );
  const heroesJson = JSON.parse(rawData);
  // Filter data agar "None" tidak muncul di grid
  const heroes = heroesJson.data.filter((h) => h.hero_name !== "None");
  requireRes.render("home", { heroes });
});

// Menu 2: Halaman Kalkulator WR
app.get("/kalkulator", (req, res) => {
  res.render("kalkulator", { hasil: null, input: {} });
});

// ROUTE BARU: DETAIL HERO (RILIS V1.1.0)
app.get("/hero/:name", (req, res) => {
  const heroName = req.params.name;
  // Membaca data hero dari file json kamu
  const heroesData = require("./data/hero-meta-final.json");

  // Cari hero yang namanya cocok
  const hero = heroesData.find(
    (h) => h.hero_name.toLowerCase() === heroName.toLowerCase(),
  );

  if (!hero) {
    return res.status(404).send("Hero tidak ditemukan");
  }

  res.render("detail", { hero });
});

app.post("/kalkulator/hitung", (req, res) => {
  const { total_match, current_wr, target_wr } = req.body;
  const hasil = calculateWr(
    parseInt(total_match),
    parseFloat(current_wr),
    target_wr ? parseFloat(target_wr) : null,
  );
  res.render("kalkulator", { hasil, input: req.body });
});

module.exports = app; // Di-export agar bisa diuji oleh Jest

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => console.log("Gas server jalan di port 3000 banh! 😎"));
}
