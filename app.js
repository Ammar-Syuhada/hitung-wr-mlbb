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

// ROUTE DETAIL HERO - normalisasi nama dengan strip SEMUA spasi & strip (-)
// baik dari URL param maupun dari hero_name di database, jadi gak masalah
// walau nama hero-nya sendiri mengandung tanda hubung (mis. "Lapu-Lapu", "Yi Sun-shin")
// atau lebih dari 2 kata (mis. "Popol and Kupa").
app.get("/hero/:name", (req, res) => {
  // 1. Bersihkan parameter URL dari spasi dan tanda minus
  const targetName = req.params.name.toLowerCase().replace(/[\s-]/g, "");

  try {
    const jsonPath = path.join(__dirname, "data", "hero-meta-final.json");
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const heroesData = JSON.parse(rawData);
    const arrayHero = heroesData.data;

    // 2. Cari hero dengan membandingkan targetName secara presisi
    const hero = arrayHero.find(
      (h) => h.hero_name.toLowerCase().replace(/[\s-]/g, "") === targetName,
    );

    if (!hero) {
      return res.status(404).send("Hero tidak ditemukan banh!");
    }

    // 3. Ambil gambar counter secara dinamis
    const mappedCounters = (hero.counters || []).map((c) => {
      const found = arrayHero.find(
        (h) => h.hero_name.toLowerCase() === c.heroname.toLowerCase(),
      );
      return {
        heroname: c.heroname,
        portrait: found
          ? found.portrait
          : "https://placehold.co/100x100?text=MLBB",
      };
    });

    // 4. Ambil gambar synergy secara dinamis
    const mappedSynergies = (hero.synergies || []).map((s) => {
      const found = arrayHero.find(
        (h) => h.hero_name.toLowerCase() === s.heroname.toLowerCase(),
      );
      return {
        heroname: s.heroname,
        portrait: found
          ? found.portrait
          : "https://placehold.co/100x100?text=MLBB",
      };
    });

    // 5. Kirim variabel yang sudah benar ke detail.ejs
    res.render("detail", {
      hero,
      counters: mappedCounters,
      synergies: mappedSynergies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan internal server.");
  }
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
