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

test("owner dashboard shows the house tour and subscription plans", async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem("leasehubCurrentUser", JSON.stringify({
            id: "owner-test",
            name: "Test Owner",
            email: "owner@example.com",
            accountType: "owner"
        }));
    });
    await page.goto("/owner-dashboard.html");

    const video = page.locator(".owner-featured-video");
    await expect(video).toBeVisible();
    await expect.poll(() => video.evaluate((element) => element.readyState)).toBeGreaterThan(0);
    await expect(page.locator("#ownerPlanOptions .owner-plan-option")).toHaveCount(3);
    await expect(page.locator("#ownerPlanOptions")).toContainText("₦20,000");

    await page.getByRole("button", { name: "Subscribe now" }).click();
    await expect(page.locator("#ownerPlanNotice")).toContainText("checkout is not connected yet");

    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.locator("#ownerPlanOptions").evaluate((element) =>
        getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length
    )).toBe(1);
    await expect.poll(() => page.evaluate(() =>
        document.documentElement.scrollWidth <= window.innerWidth
    )).toBe(true);
});
