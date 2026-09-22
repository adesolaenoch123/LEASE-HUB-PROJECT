const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    use: {
        baseURL: "http://127.0.0.1:4173",
        browserName: "chromium",
        headless: true,
        viewport: { width: 1280, height: 900 }
    },
    webServer: {
        command: "node tests/static-server.js",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
        timeout: 30_000
    },
    reporter: "list"
});
