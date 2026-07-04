const request = require("supertest");
const app = require("../app");

describe("Pengujian Validasi Rumus Kalkulator WR", () => {
  it("Harus sukses menghitung total win/lose sesuai gambar input", async () => {
    // Simulasi input match: 2183, WR: 65.9
    const res = await request(app)
      .post("/kalkulator/hitung")
      .send({ total_match: 2183, current_wr: 65.9 });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("1439"); // Total win harus 1439
    expect(res.text).toContain("744"); // Total lose harus 744
  });

  it("Harus sukses menghitung target win streak", async () => {
    // Simulasi input match: 272, WR: 78.2, Target: 80
    const res = await request(app)
      .post("/kalkulator/hitung")
      .send({ total_match: 272, current_wr: 78.2, target_wr: 80 });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("23"); // Butuh 24 win streak tanpa lose
  });
});
