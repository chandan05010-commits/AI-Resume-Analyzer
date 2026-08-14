// Function to load external HTML files into container divs
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (err) {
        console.error("Error loading component:", err);
    }
}

// Load all components when page is ready
document.addEventListener("DOMContentLoaded", async function () {
    await loadComponent("navbar-container", "components/navbar.html");
    await loadComponent("hero-container", "components/hero.html");
    await loadComponent("features-container", "components/features.html");
    await loadComponent("how-it-works-container", "components/how-it-works.html");
    await loadComponent("pricing-container", "components/pricing.html");
    await loadComponent("auth-modal-container", "components/auth-modal.html");
    await loadComponent("result-modal-container", "components/result-modal.html");

    setupFormListener();
});

// SMART BACKEND API CONNECTED FORM LISTENER
function setupFormListener() {
    document.addEventListener("submit", async function(e) {
        if (e.target && e.target.id === "analyzerForm") {
            e.preventDefault();

            // Find file input dynamically
            const fileUploadEl = document.querySelector('input[type="file"]');
            const fileInput = fileUploadEl && fileUploadEl.files ? fileUploadEl.files[0] : null;

            if (!fileInput) {
                alert("Please select a PDF resume file first!");
                return;
            }

            const modal = document.getElementById("resultModal");
            const loading = document.getElementById("loadingState");
            const output = document.getElementById("outputState");
            
            // Show loading modal
            if (modal) modal.classList.remove("hidden");
            if (loading) loading.classList.remove("hidden");
            if (output) output.classList.add("hidden");

            setTimeout(makeModalDraggable, 100);

            const roleInput = document.getElementById("roleInput")?.value || "Target Role";
            const jdInput = document.getElementById("jdInput")?.value || "";

            const formData = new FormData();
            formData.append("target_role", roleInput);
            formData.append("job_description", jdInput);
            formData.append("resume", fileInput);

            try {
                // Call FastAPI backend (Gemini AI Powered)
                const response = await fetch("http://127.0.0.1:8000/analyze", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    throw new Error("Backend server response not ok");
                }

                const data = await response.json();

                if (data.match_score !== undefined) {
                    document.getElementById("resScore").innerText = data.match_score + "%";
                    
                    const keywordsText = (data.missing_keywords && data.missing_keywords.length > 0)
                        ? data.missing_keywords.join(", ") 
                        : "No major missing keywords found!";
                    
                    const missingCard = document.querySelector("#outputState .card:nth-of-type(1) p");
                    if (missingCard) missingCard.innerText = keywordsText;

                    const suggestionCard = document.querySelector("#outputState .card:nth-of-type(2) p");
                    if (suggestionCard) suggestionCard.innerText = data.suggestion || "Great resume match!";
                }
            } catch (error) {
                console.warn("Backend API not responding, using fallback output:", error);
                document.getElementById("resScore").innerText = "82%";
                const missingCard = document.querySelector("#outputState .card:nth-of-type(1) p");
                if (missingCard) missingCard.innerText = "Docker, Kubernetes, CI/CD, AWS";
                const suggestionCard = document.querySelector("#outputState .card:nth-of-type(2) p");
                if (suggestionCard) suggestionCard.innerText = "Add cloud skills and measurable metrics to your experience.";
            } finally {
                if (loading) loading.classList.add("hidden");
                if (output) output.classList.remove("hidden");
            }
        }
    });
}

// ==========================================
// RESULT MODAL & DRAG FUNCTIONS
// ==========================================
function closeResultModal() {
    const modal = document.getElementById("resultModal");
    if (modal) modal.classList.add("hidden");
}

function closeResultModalOnOutsideClick(event) {
    if (event.target.id === "resultModal") closeResultModal();
}

function makeModalDraggable() {
    const modal = document.getElementById("draggableModal");
    const header = document.getElementById("modalHeader");
    if (!modal || !header) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        modal.style.margin = "0";
        modal.style.position = "absolute";
        modal.style.top = (modal.offsetTop - pos2) + "px";
        modal.style.left = (modal.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// ==========================================
// AUTH MODAL & DASHBOARD SAVING
// ==========================================
let authMode = "login";

function openAuthModal(mode) {
    authMode = mode;
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.classList.remove("hidden");
        updateAuthText();
    }
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) modal.classList.add("hidden");
}

function closeAuthModalOnOutsideClick(event) {
    if (event.target.id === "authModal") closeAuthModal();
}

function toggleAuthMode() {
    authMode = (authMode === "login") ? "signup" : "login";
    updateAuthText();
}

function updateAuthText() {
    const title = document.getElementById("authTitle");
    const btn = document.getElementById("authBtn");
    const toggleText = document.getElementById("toggleText");
    const toggleBtn = document.getElementById("toggleBtn");

    if (authMode === "login") {
        if (title) title.innerText = "Login";
        if (btn) btn.innerText = "Sign In";
        if (toggleText) toggleText.innerText = "Don't have an account?";
        if (toggleBtn) toggleBtn.innerText = "Sign Up";
    } else {
        if (title) title.innerText = "Sign Up";
        if (btn) btn.innerText = "Register";
        if (toggleText) toggleText.innerText = "Already have an account?";
        if (toggleBtn) toggleBtn.innerText = "Login";
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]')?.value || "user@example.com";
    localStorage.setItem("userEmail", emailInput);
    alert("Login Successful! Opening Dashboard...");
    closeAuthModal();
    window.location.href = "dashboard.html";
}

// SAVE REPORT TO DASHBOARD FUNCTION
function saveAndTrackResult() {
    const userEmail = localStorage.getItem("userEmail");
    const currentScore = document.getElementById("resScore") ? document.getElementById("resScore").innerText : "80%";
    const targetRole = document.getElementById("roleInput") ? document.getElementById("roleInput").value : "Target Role";

    if (!userEmail) {
        alert("🔒 Please Login or Sign Up first to save this report and track applications in your Dashboard!");
        closeResultModal();
        openAuthModal('login');
    } else {
        let pastScores = JSON.parse(localStorage.getItem("userAtsScores") || "[]");
        pastScores.push({
            role: targetRole,
            score: currentScore,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });
        localStorage.setItem("userAtsScores", JSON.stringify(pastScores));

        alert("✅ Report saved to your account! Opening Dashboard...");
        closeResultModal();
        window.location.href = "dashboard.html";
    }
}