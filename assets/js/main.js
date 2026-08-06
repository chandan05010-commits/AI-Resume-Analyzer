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

// Submit Form Handler
function setupFormListener() {
    document.addEventListener("submit", function(e) {
        if (e.target && e.target.id === "analyzerForm") {
            e.preventDefault();
            
            const modal = document.getElementById("resultModal");
            const loading = document.getElementById("loadingState");
            const output = document.getElementById("outputState");
            
            modal.classList.remove("hidden");
            loading.classList.remove("hidden");
            output.classList.add("hidden");

            setTimeout(() => {
                loading.classList.add("hidden");
                output.classList.remove("hidden");
            }, 3000);
        }
    });
}

function closeModal() {
    document.getElementById("resultModal").classList.add("hidden");
}

// Auth Modal
let authMode = "login";

function openAuthModal(mode) {
    authMode = mode;
    document.getElementById("authModal").classList.remove("hidden");
    updateAuthText();
}

function closeAuthModal() {
    document.getElementById("authModal").classList.add("hidden");
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
        title.innerText = "Login";
        btn.innerText = "Sign In";
        toggleText.innerText = "Don't have an account?";
        toggleBtn.innerText = "Sign Up";
    } else {
        title.innerText = "Sign Up";
        btn.innerText = "Register";
        toggleText.innerText = "Already have an account?";
        toggleBtn.innerText = "Login";
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    alert(authMode === "login" ? "Logged in!" : "Registered!");
    closeAuthModal();
}
// Close Auth Modal function
function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

// Background dark area par click karne se close hone ka logic
function closeAuthModalOnOutsideClick(event) {
    // Agar click modal content ke bahar (dark backdrop par) hua hai tabhi band karein
    if (event.target.id === "authModal") {
        closeAuthModal();
    }
}