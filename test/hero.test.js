const request = require("supertest");
const app = require("../app");

describe("Pengujian Endpoint Menu Hero & Detail Hero", () => {
  it("Harus mengembalikan status 200 OK saat mengakses daftar hero utama (/)", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Daftar Meta Hero");
  });

  it("Harus mengembalikan status 200 OK saat melihat detail hero tunggal (/hero/miya)", async () => {
    const res = await request(app).get("/hero/miya");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Miya");
  });

  it("Harus mengembalikan status 200 OK untuk nama hero lebih dari 1 kata (/hero/yi-sun-shin)", async () => {
    const res = await request(app).get("/hero/yi-sun-shin");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Yi Sun-shin");
  });

  it("Harus mengembalikan status 404 saat hero tidak ada di database (/hero/herogakada)", async () => {
    const res = await request(app).get("/hero/herogakada");
    expect(res.statusCode).toEqual(404);
  });
});
