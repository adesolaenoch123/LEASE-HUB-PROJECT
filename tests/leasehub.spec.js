const { test, expect } = require("@playwright/test");

const pendingProperty = {
    id: 9001,
    title: "Test Pending Apartment",
    type: "Apartment",
    location: "Lekki Phase 1, Lagos",
    city: "Lagos",
    price: 2500000,
    period: "year",
    bedrooms: 2,
    bathrooms: 2,
    verified: false,
    verificationStatus: "pending",
    image: "https://example.com/test-property.jpg"
};

test("admin approval updates the shared public property store", async ({ page }) => {
    await page.addInitScript((property) => {
        localStorage.setItem("leasehubProperties", JSON.stringify([property]));
        localStorage.removeItem("leasehubAdminProperties");
    }, pendingProperty);

    await page.goto("/admin/admin.html");
    await page.getByLabel("Email").fill("admin@leasehub.ng");
    await page.getByLabel("Access code").fill("CHANGE-ME");
    await page.getByRole("button", { name: /Enter staff portal/i }).click();
    await page.getByRole("link", { name: "Properties" }).click();

    page.once("dialog", dialog => dialog.accept());
    await page.locator('#propertiesTable [data-prop="9001"][data-prop-action="approve"]').click();

    await expect.poll(() => page.evaluate(() => {
        const properties = JSON.parse(localStorage.getItem("leasehubProperties"));
        return properties[0].verificationStatus;
    })).toBe("approved");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("leasehubAdminProperties"))).toBeNull();
});

test("tenant dashboard reads saved properties from the shared saved store", async ({ page }) => {
    await page.addInitScript(() => {
        const user = {
            id: "tenant-test",
            name: "Test Tenant",
            email: "tenant@example.com",
            accountType: "tenant",
            savedProperties: [1]
        };
        localStorage.setItem("leasehubCurrentUser", JSON.stringify(user));
        localStorage.removeItem("savedProperties");
    });

    await page.goto("/tenant-dashboard.html");
    await expect(page.locator("#savedCount")).toHaveText("1");
    await expect.poll(() => page.evaluate(() => {
        const user = JSON.parse(localStorage.getItem("leasehubCurrentUser"));
        return user.savedProperties;
    })).toEqual([1]);
});

test("property search filters the public catalog", async ({ page }) => {
    await page.goto("/properties.html");
    const search = page.locator("#marketSearch");

    await search.fill("Lekki");
    await page.locator("#marketSearchBtn").click();

    await expect(page.locator("#marketplaceProperties .property-card").first()).toBeVisible();
    await expect(page.locator("#marketplaceProperties .property-card").first()).toContainText(/Lekki/i);
});
