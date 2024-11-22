import puppetteer from "puppeteer";

import { fork } from "child_process";

jest.setTimeout(30000); 

describe("Credit Card Validator form", () => {
  let browser = null;
  let page = null;
  let server = null;
  const baseUrl = "http://localhost:8080";

  beforeAll(async () => {
    server = fork(`${__dirname}/e2e.server.js`);

    browser = await puppetteer.launch({
      headless: false, 
      slowMo: 100,
      devtools: true, 
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  describe("should show color card by number", () => {
    beforeEach(async () => {
      await page.goto(baseUrl);
    });

    test("Should change Visa color", async () => {
      await page.type(".input-field", "44");
      const card = await page.$eval(".visa", (el) => el.className);
      expect(card).toContain("active");
    });

    test("Should change Mastercard color", async () => {
      await page.type(".input-field", "56");
      const card = await page.$eval(".mcd", (el) => el.className);
      expect(card).toContain("active");
    });

    test("Should change Discover color", async () => {
      await page.type(".input-field", "64");
      const card = await page.$eval(".discover", (el) => el.className);
      expect(card).toContain("active");
    });

    test("Should change Мир color", async () => {
      await page.type(".input-field", "28");
      const card = await page.$eval(".pease", (el) => el.className);
      expect(card).toContain("active");
    });

    test("Should change JCB color", async () => {
      await page.type(".input-field", "35");
      const card = await page.$eval(".jcb", (el) => el.className);
      expect(card).toContain("active");
    });

    test("Should change Dinners color", async () => {
      await page.type(".input-field", "36");
      const card = await page.$eval(".dinners", (el) => el.className);
      expect(card).toContain("active");
    });

    test("Should change American express color", async () => {
      await page.type(".input-field", "32");
      const card = await page.$eval(".am_ex", (el) => el.className);
      expect(card).toContain("active");
    });
  });
});
