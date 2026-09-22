document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addPropertyForm");
    const imageInput = document.getElementById("propertyImage");
    const imagePreview = document.getElementById("imagePreview");
    const formStatus = document.getElementById("propertyFormStatus");
    if (!form) return;

    const MIN_IMAGES = 8;
    const MAX_IMAGES = 20;
    let selectedImages = [];
    let coverIndex = 0;

    function showFormStatus(message, type = "error") {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.className = `form-status is-visible is-${type}`;
    }
    function readCurrentUser() {
        try { return JSON.parse(localStorage.getItem("leasehubCurrentUser") || "null"); }
        catch { return null; }
    }
    const currentUser = readCurrentUser();
    if (!currentUser || currentUser.accountType !== "owner") {
        window.location.href = "login.html";
        return;
    }

    function compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Unable to read image."));
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const maxSide = 1280;
                    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(img.width * scale));
                    canvas.height = Math.max(1, Math.round(img.height * scale));
                    const ctx = canvas.getContext("2d", { alpha: false });
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.72));
                };
                img.onerror = () => reject(new Error("Invalid image."));
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function renderPreview() {
        if (!imagePreview) return;
        imagePreview.innerHTML = `
            <div class="leasehub-image-upload-summary">
                <strong>${selectedImages.length} / ${MAX_IMAGES} photos selected</strong>
                <span>${selectedImages.length < MIN_IMAGES ? `Add ${MIN_IMAGES - selectedImages.length} more to continue.` : "Minimum reached — you can add more photos."}</span>
            </div>
            <div class="leasehub-upload-grid">
                ${selectedImages.map((src, index) => `
                    <div class="leasehub-upload-thumb ${index === coverIndex ? "is-cover" : ""}" draggable="true" data-index="${index}">
                        <img src="${src}" alt="Property photo ${index + 1}">
                        ${index === coverIndex ? '<span class="leasehub-cover-label">Cover</span>' : ''}
                        <button type="button" class="leasehub-remove-photo" data-remove="${index}" aria-label="Remove photo ${index + 1}"><i class="bx bx-x"></i></button>
                        <button type="button" class="leasehub-set-cover" data-cover="${index}">${index === coverIndex ? "Cover photo" : "Set as cover"}</button>
                    </div>
                `).join("")}
            </div>
        `;
        imagePreview.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => {
            const index = Number(btn.dataset.remove);
            selectedImages.splice(index, 1);
            if (coverIndex >= selectedImages.length) coverIndex = Math.max(0, selectedImages.length - 1);
            else if (index < coverIndex) coverIndex -= 1;
            renderPreview();
        }));
        imagePreview.querySelectorAll("[data-cover]").forEach(btn => btn.addEventListener("click", () => {
            coverIndex = Number(btn.dataset.cover);
            renderPreview();
        }));
        let dragIndex = null;
        imagePreview.querySelectorAll(".leasehub-upload-thumb").forEach(card => {
            card.addEventListener("dragstart", () => { dragIndex = Number(card.dataset.index); });
            card.addEventListener("dragover", e => e.preventDefault());
            card.addEventListener("drop", e => {
                e.preventDefault();
                const target = Number(card.dataset.index);
                if (dragIndex === null || dragIndex === target) return;
                const [moved] = selectedImages.splice(dragIndex, 1);
                selectedImages.splice(target, 0, moved);
                if (coverIndex === dragIndex) coverIndex = target;
                else if (dragIndex < coverIndex && target >= coverIndex) coverIndex -= 1;
                else if (dragIndex > coverIndex && target <= coverIndex) coverIndex += 1;
                renderPreview();
            });
        });
    }

    imageInput?.addEventListener("change", async () => {
        const files = Array.from(imageInput.files || []);
        if (!files.length) return;
        const valid = files.filter(file => file.type.startsWith("image/"));
        if (valid.length !== files.length) showFormStatus("Some selected files were skipped because they are not images.");
        const room = MAX_IMAGES - selectedImages.length;
        if (valid.length > room) showFormStatus(`You can add only ${room} more photo${room === 1 ? "" : "s"}.`);
        const filesToAdd = valid.slice(0, room);
        try {
            for (const file of filesToAdd) selectedImages.push(await compressImage(file));
            renderPreview();
            if (selectedImages.length >= MIN_IMAGES) showFormStatus("Photo set ready. You can continue through the property wizard.", "success");
        } catch (error) {
            showFormStatus("One or more images could not be processed. Please try again.");
        }
        imageInput.value = "";
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        const title = document.getElementById("propertyTitle")?.value.trim();
        const type = document.getElementById("propertyType")?.value;
        const purpose = document.getElementById("listingPurpose")?.value;
        const state = document.getElementById("propertyState")?.value;
        const city = document.getElementById("propertyCity")?.value.trim();
        const location = document.getElementById("propertyLocation")?.value.trim();
        const price = Number(document.getElementById("propertyPrice")?.value);
        const period = document.getElementById("propertyPeriod")?.value;
        const bedrooms = Number(document.getElementById("propertyBedrooms")?.value) || 0;
        const bathrooms = Number(document.getElementById("propertyBathrooms")?.value) || 0;
        const size = document.getElementById("propertySize")?.value.trim() || "";
        const description = document.getElementById("propertyDescription")?.value.trim();

        if (!title || !type || !purpose || !state || !city || !location || !Number.isFinite(price) || price <= 0 || !description) {
            showFormStatus("Please complete all required fields."); return;
        }
        if (selectedImages.length < MIN_IMAGES) {
            showFormStatus(`Please upload at least ${MIN_IMAGES} property photos before submitting.`); return;
        }
        const amenities = Array.from(document.querySelectorAll('input[name="amenity"]:checked')).map(c => c.value);
        let ownerProfile = {};
        try { ownerProfile = JSON.parse(localStorage.getItem("leasehubOwnerProfile") || "{}") || {}; } catch {}
        const ownerName = ownerProfile.name || ownerProfile.displayName || currentUser.name || "Property Owner";
        const newProperty = {
            id: Date.now(), title, type, purpose, state, city, location, price, period, bedrooms, bathrooms, size,
            description, amenities, image: selectedImages[coverIndex] || selectedImages[0], images: selectedImages,
            ownerId: currentUser.id, ownerName, ownerAvatar: ownerProfile.avatar || currentUser.avatar || "",
            ownerPhone: ownerProfile.phone || currentUser.phone || "",
            verified: false, verificationStatus: "pending", verificationLabel: "Pending Verification",
            submittedAt: new Date().toISOString(), listingStatus: "pending"
        };
        let storedProperties = [];
        try { const parsed = JSON.parse(localStorage.getItem("leasehubProperties") || "[]"); storedProperties = Array.isArray(parsed) ? parsed : []; } catch {}
        storedProperties.push(newProperty);
        localStorage.setItem("leasehubProperties", JSON.stringify(storedProperties));
        const currentUserProperties = Array.isArray(currentUser.properties) ? currentUser.properties : [];
        if (!currentUserProperties.some(id => String(id) === String(newProperty.id))) currentUserProperties.push(newProperty.id);
        currentUser.properties = currentUserProperties;
        localStorage.setItem("leasehubCurrentUser", JSON.stringify(currentUser));
        try {
            const users = JSON.parse(localStorage.getItem("leasehubUsers") || "[]");
            if (Array.isArray(users)) {
                const index = users.findIndex(user => String(user.id) === String(currentUser.id));
                if (index !== -1) { users[index] = currentUser; localStorage.setItem("leasehubUsers", JSON.stringify(users)); }
            }
        } catch {}
        showFormStatus("Property submitted successfully. Your listing is now pending verification.", "success");
        window.setTimeout(() => { window.location.href = "owner-dashboard.html"; }, 700);
    });
    renderPreview();
});
