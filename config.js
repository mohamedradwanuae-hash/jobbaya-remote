// config.js

const SUPABASE_URL = "https://uwyznpcudiisazmmrugn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3eXpucGN1ZGlpc2F6bW1ydWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjQ4ODgsImV4cCI6MjEwMTUwMDg4OH0.TY32DadI2XDkLVIZM2_DHMs2ww0vMEmQ6UCxCDT5csM";
const JOB_IMAGES_BUCKET = "job-images";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function safeUrl(url) {
    if (!url) return null;

    try {
        const parsed = new URL(String(url));

        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return String(url);
        }

        return null;
    } catch {
        return null;
    }
}

function formatDate(value) {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function normalizePhone(input) {
    let digits = String(input || "").replace(/\D/g, "");

    if (digits.startsWith("00")) {
        digits = digits.slice(2);
    }

    if (digits.startsWith("20") && digits.length === 12) {
        digits = digits.slice(2);
    }

    if (digits.startsWith("0") && digits.length === 11) {
        digits = digits.slice(1);
    }

    return digits;
}

function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

async function getCurrentProfile() {
    const session = await getCurrentSession();

    if (!session || !session.user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

    if (error) {
        console.error("Profile fetch error:", error);
        return null;
    }

    return data;
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = "index.html";
}

window.logout = logout;

async function renderAuthLinks(containerId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    const profile = await getCurrentProfile();

    if (profile) {
        const adminLink = profile.role === "admin"
            ? `<a href="upload.html" class="hover:text-emerald-600">Upload</a>`
            : "";

        container.innerHTML = `
            <span class="text-gray-500">${escapeHtml(profile.name || "User")}</span>
            ${adminLink}
            <button onclick="logout()" class="text-red-500 hover:text-red-700">
                Logout
            </button>
        `;
    } else {
        container.innerHTML = `
            <a href="login.html" class="hover:text-emerald-600">Login</a>
            <a href="signup.html" class="hover:text-emerald-600">Sign up</a>
        `;
    }
}

window.renderAuthLinks = renderAuthLinks;

function jobCard(job) {
    const imageUrl = safeUrl(job.image_url);

    const imageHtml = imageUrl
        ? `
            <img
                src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(job.title)}"
                class="w-full h-48 object-cover rounded-lg mb-4 border bg-gray-50"
            >
        `
        : `
            <div class="w-full h-48 rounded-lg bg-emerald-100 flex items-center justify-center text-5xl mb-4">
                💼
            </div>
        `;

    const salaryHtml = job.salary_range
        ? `
            <span class="inline-block mt-3 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                ${escapeHtml(job.salary_range)}
            </span>
        `
        : "";

    return `
        <a
            href="job.html?id=${encodeURIComponent(job.id)}"
            class="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border hover:border-emerald-300"
        >
            ${imageHtml}

            <h2 class="text-xl font-bold leading-snug">
                ${escapeHtml(job.title)}
            </h2>

            <p class="text-gray-500 text-sm mt-2">
                Posted ${formatDate(job.created_at)}
            </p>

            ${salaryHtml}
        </a>
    `;
}
