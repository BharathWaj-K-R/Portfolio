/**
 * core.js
 * Shared data model + utilities.
 * Loaded by BOTH index.html and admin.html.
 * Contains nothing admin-only and nothing public-site-only —
 * see site.js for the public renderer and admin.js for the editor.
 */

const STORAGE_KEY = "bharathwajPortfolioData";
const ADMIN_SESSION_KEY = "bharathwajPortfolioAdmin";

// SHA-256 hash of the admin password. Generate a new one from the
// "Change password" tool in the admin Settings tab, then paste it here.
// NOTE: this is a static site with no server, so this can only ever be
// obscurity, not real security — anyone can read this file. Don't reuse
// this password anywhere sensitive.
const ADMIN_PASSWORD_HASH = "29b09a62c1086fd3fd7999108a4df33fdba2edc2a205edf90ed450fb5afd6366";

const SECTION_TYPES = ["tag-list", "card-list", "timeline", "text-block", "link-list", "contact"];
const FIELD_TYPES = ["text", "textarea", "url", "tags", "image"];

const THEME_PRESETS = {
  paper: {
    primary: "#2451D6",
    secondary: "#0F8B6C",
    accent: "#B5852B",
    background: "#F5F5F1",
    surface: "#FFFFFF",
    text: "#14171C",
    mutedText: "#5B6472"
  },
  slate: {
    primary: "#3255C4",
    secondary: "#2E7D74",
    accent: "#946A2B",
    background: "#F1F3F6",
    surface: "#FFFFFF",
    text: "#151A22",
    mutedText: "#5B6675"
  },
  warm: {
    primary: "#B24E1F",
    secondary: "#3A7355",
    accent: "#2451D6",
    background: "#F6F2EA",
    surface: "#FFFDF9",
    text: "#1E1A14",
    mutedText: "#756A5A"
  }
};

const FONT_STACKS = {
  "Space Grotesk": '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  Inter: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  System: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  Georgia: 'Georgia, "Times New Roman", serif',
  "JetBrains Mono": '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace'
};

const DEFAULT_DATA = window.PORTFOLIO_DATA || {};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
  const slug = String(value || "section")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `section-${Date.now()}`;
}

function uniqueSectionId(title, sections, existingId = "") {
  const base = slugify(title);
  let id = base;
  let count = 2;
  while (sections.some((section) => section.id === id && section.id !== existingId)) {
    id = `${base}-${count}`;
    count += 1;
  }
  return id;
}

function normalizeField(field = {}) {
  return {
    key: slugify(field.key || field.label || "field").replace(/-/g, "_"),
    label: field.label || field.key || "Field",
    type: FIELD_TYPES.includes(field.type) ? field.type : "text",
    required: Boolean(field.required),
    showInCard: field.showInCard !== false
  };
}

function defaultFieldsFor(type) {
  if (type === "link-list") {
    return [
      { key: "title", label: "Title", type: "text", required: true, showInCard: true },
      { key: "url", label: "URL", type: "url", required: true, showInCard: true },
      { key: "description", label: "Description", type: "textarea", showInCard: true }
    ];
  }
  return [
    { key: "title", label: "Title", type: "text", required: true, showInCard: true },
    { key: "subtitle", label: "Subtitle", type: "text", showInCard: true },
    { key: "description", label: "Description", type: "textarea", showInCard: true },
    { key: "tags", label: "Tags", type: "tags", showInCard: true },
    { key: "url", label: "Link", type: "url", showInCard: true },
    { key: "image", label: "Image", type: "image", showInCard: true }
  ];
}

function normalizeSection(section = {}, index = 0, sections = []) {
  const type = SECTION_TYPES.includes(section.type) ? section.type : "card-list";
  const title = section.title || `Section ${index + 1}`;
  const normalized = {
    id: uniqueSectionId(section.id || title, sections, section.id),
    type,
    title,
    subtitle: section.subtitle || "",
    visible: section.visible !== false
  };

  if (type === "tag-list") {
    normalized.groups = Array.isArray(section.groups)
      ? section.groups.map((group) => ({
          title: group.title || "Group",
          tags: Array.isArray(group.tags) ? group.tags : splitTags(group.tags)
        }))
      : [];
    return normalized;
  }

  if (type === "text-block") {
    normalized.content = Array.isArray(section.content)
      ? section.content.map((block) => ({ heading: block.heading || "Heading", text: block.text || "" }))
      : [];
    return normalized;
  }

  if (type === "contact") return normalized;

  normalized.fields = Array.isArray(section.fields) && section.fields.length
    ? section.fields.map(normalizeField)
    : defaultFieldsFor(type).map(normalizeField);
  normalized.items = Array.isArray(section.items) ? section.items.map((item) => ({ ...item })) : [];
  return normalized;
}

function normalizeTheme(theme = {}) {
  return {
    templateId: theme.templateId || "modern-grid",
    primary: theme.primary || "#2451D6",
    secondary: theme.secondary || "#0F8B6C",
    accent: theme.accent || "#B5852B",
    background: theme.background || "#F5F5F1",
    surface: theme.surface || "#FFFFFF",
    text: theme.text || "#14171C",
    mutedText: theme.mutedText || "#5B6472",
    headingFont: theme.headingFont || "Space Grotesk",
    bodyFont: theme.bodyFont || "Inter",
    radius: theme.radius || "6px",
    density: theme.density || "comfortable"
  };
}

function normalizeData(data = {}) {
  const profile = {
    name: "Bharathwaj K R",
    initials: "BK",
    role: "Aspiring Software Engineer",
    college: "V.S.B Engineering College",
    location: "Tamil Nadu, India",
    email: "ravikap0063@gmail.com",
    githubUrl: "https://github.com/BharathWaj-K-R",
    linkedinUrl: "",
    resumeUrl: "resume.pdf",
    photoUrl: "",
    leetcodeUrl: "",
    ...(data.profile || {})
  };

  const hero = {
    kicker: profile.role,
    headlinePrefix: "Hi, I am",
    tagline: "I build practical software solutions with a strong foundation in",
    summary: "",
    typingWords: ["Java development.", "DSA problem solving.", "Linux workflows.", "web development."],
    primaryButton: { label: "Download Resume", hrefField: "resumeUrl" },
    secondaryButton: { label: "View Projects", sectionId: "projects" },
    statusText: "Available for internships",
    statusValue: "2026",
    ...(data.hero || {})
  };

  const rawSections = Array.isArray(data.sections) ? data.sections : migrateLegacySections(data);
  const sections = rawSections.map((section, index) => normalizeSection(section, index, rawSections));

  return { profile, hero, theme: normalizeTheme(data.theme || {}), sections };
}

function migrateLegacySections() {
  return Array.isArray(DEFAULT_DATA.sections) ? DEFAULT_DATA.sections : [];
}

function splitTags(value) {
  if (Array.isArray(value)) return value;
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function loadDraft() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveDraft(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
}

function getPortfolioData() {
  return normalizeData(loadDraft() || DEFAULT_DATA);
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || "";
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function safeUrl(url) {
  return String(url || "").trim();
}

function isUsableUrl(url) {
  return /^(https?:\/\/|mailto:|tel:|#|\.?\/|[\w-]+\.(pdf|png|jpe?g|webp|gif))/i.test(String(url || ""));
}

function setLinkState(link, href) {
  const usable = Boolean(href);
  link.href = usable ? href : "#";
  link.classList.toggle("disabled-link", !usable);
  link.setAttribute("aria-disabled", String(!usable));
  link.tabIndex = usable ? 0 : -1;
}

function fontStack(fontName) {
  return FONT_STACKS[fontName] || FONT_STACKS.Inter;
}

function applyTheme(data) {
  const theme = normalizeTheme(data.theme);
  const root = document.documentElement;
  const densityMap = { compact: "0.82", comfortable: "1", spacious: "1.18" };

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--bg", theme.background);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--text-muted", theme.mutedText);
  root.style.setProperty("--radius", theme.radius);
  root.style.setProperty("--density", densityMap[theme.density] || "1");
  root.style.setProperty("--heading-font", fontStack(theme.headingFont));
  root.style.setProperty("--body-font", fontStack(theme.bodyFont));
  document.body.dataset.template = theme.templateId;
}

function formatLinkLabel(url, fallback) {
  if (!url) return fallback;
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

async function hashText(value) {
  if (!crypto.subtle) return "";
  const encodedValue = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedValue);
  return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getPath(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

function setPath(object, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((current, key) => current[key], object);
  const oldValue = target[last];
  target[last] = Array.isArray(oldValue) ? splitTags(value) : value;
}
