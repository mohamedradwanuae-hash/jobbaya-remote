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