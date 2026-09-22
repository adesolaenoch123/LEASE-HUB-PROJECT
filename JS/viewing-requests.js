/* =========================================================
   LEASEHUB - VIEWING REQUESTS
   Tenant Dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const container =
        document.getElementById("viewingRequests");

    if (!container) return;


    /* =====================================================
       RENDER VIEWING REQUESTS
       ===================================================== */

    function renderViewingRequests() {

        let requests = [];

        try {

            requests =
                JSON.parse(
                    localStorage.getItem("viewingRequests")
                ) || [];

        } catch (error) {

            console.error(
                "Unable to load viewing requests.",
                error
            );

            requests = [];

        }


        /* =================================================
           UPDATE VIEWING COUNT
           ================================================= */

        const viewingCount =
            document.getElementById("viewingCount");

        if (viewingCount) {

            viewingCount.textContent =
                requests.length;

        }


        /* =================================================
           EMPTY REQUESTS
           ================================================= */

        if (requests.length === 0) {

            container.innerHTML = `

                <div class="empty-requests">

                    <h2>
                        No viewing requests yet
                    </h2>

                    <p>
                        You haven't requested a viewing for
                        any property yet.
                    </p>

                    <a
                        href="properties.html"
                        class="primary-btn request-property-btn"
                    >
                        Browse Properties
                    </a>

                </div>

            `;

            return;
        }


        /* =================================================
           DISPLAY REQUESTS
           ================================================= */

        container.innerHTML =
            requests
                .slice()
                .reverse()
                .map(request => {

                    let status =
                        request.status || "pending";

                    status =
                        status.toLowerCase();


                    /* -------------------------------------
                       DEFAULT STATUS
                       ------------------------------------- */

                    let statusClass =
                        "status-pending";

                    let statusText =
                        "Pending";


                    /* -------------------------------------
                       ACCEPTED
                       ------------------------------------- */

                    if (status === "accepted") {

                        statusClass =
                            "status-accepted";

                        statusText =
                            "Accepted";

                    }


                    /* -------------------------------------
                       DECLINED
                       ------------------------------------- */

                    if (status === "declined") {

                        statusClass =
                            "status-declined";

                        statusText =
                            "Declined";

                    }


                    /* =====================================
                       FORMAT DATE
                       ===================================== */

                    let formattedDate =
                        request.viewingDate ||
                        "Date not set";


                    if (request.viewingDate) {

                        const date =
                            new Date(
                                request.viewingDate +
                                "T00:00:00"
                            );

                        if (!isNaN(date)) {

                            formattedDate =
                                date.toLocaleDateString(
                                    "en-NG",
                                    {
                                        weekday: "short",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    }
                                );

                        }

                    }


                    /* =====================================
                       REQUEST CARD
                       ===================================== */

                    return `

                        <article class="request-card">

                            <div class="request-info">

                                <h2>
                                    ${
                                        request.propertyTitle ||
                                        "Property Viewing"
                                    }
                                </h2>

                                <div class="request-location">
                                    <i class="bx bx-map" aria-hidden="true"></i> Property viewing request
                                </div>


                                <div class="request-details">

                                    <span>
                                        <i class="bx bx-calendar" aria-hidden="true"></i>
                                        ${formattedDate}
                                    </span>

                                    <span>
                                        <i class="bx bx-time-five" aria-hidden="true"></i>
                                        ${
                                            request.viewingTime ||
                                            "Time not set"
                                        }
                                    </span>

                                </div>

                            </div>


                            <div
                                class="
                                    request-status
                                    ${statusClass}
                                "
                            >
                                ${statusText}
                            </div>

                        </article>

                    `;

                })
                .join("");

    }


    /* =====================================================
       FIRST LOAD
       ===================================================== */

    renderViewingRequests();


    /* =====================================================
       REFRESH WHEN PAGE BECOMES VISIBLE
       ===================================================== */

    window.addEventListener(
        "pageshow",
        function () {

            renderViewingRequests();

        }
    );


    /* =====================================================
       REFRESH WHEN LOCAL STORAGE CHANGES
       ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === "viewingRequests"
            ) {

                renderViewingRequests();

            }

        }
    );


    /* =====================================================
       REFRESH WHEN TAB BECOMES ACTIVE
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState === "visible"
            ) {

                renderViewingRequests();

            }

        }
    );

});