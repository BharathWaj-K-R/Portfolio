const STORAGE_KEY = "bharathwajPortfolioData";
const ADMIN_SESSION_KEY = "bharathwajPortfolioAdmin";
const ADMIN_PASSWORD_HASH = "29b09a62c1086fd3fd7999108a4df33fdba2ed4b13022b05417bc";
const ADMIN_PASSWORD_FALLBACK = "Bharathwaj@123";

const SECTION_TYPES = ["tag-list", "card-list", "timeline", "text-block", "link-list", "contact"];
const FIELD_TYPES = ["text", "textarea", "url", "tags", "image"];
const THEME_PRESETS = {
  emerald: {
    primary: "#39d98a",
    secondary: "#62c7ff",
    accent: "#f4c95d",
    background: "#090d13",
    surface: "#141d2a",
    text: "#f3f7fb",
    mutedText: "#9fb0c3"
  },
  graphite: {
    primary: "#7dd3fc",
    secondary: "#a7f3d0",
    accent: "#fbbf24",
    background: "#0a0a0a",
    surface: "#18181b",
    text: "#fafafa",
    mutedText: "#a1a1aa"
  },
  plum: {
    primary: "#c084fc",
    secondary: "#67e8f9",
    accent: "#fda4af",
    background: "#100b17",
    surface: "#1e1428",
    text: "#fbf7ff",
    mutedText: "#c4b5d4"
  }
};

const DEFAULT_DATA = window.PORTFOLIO_DATA || {};
let editorData = normalizeData(loadDraft() || DEFAULT_DATA);

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
    normalized.groups = Array.isArray(section.groups) ? section.groups.map((group) => ({
      title: group.title || "Group",
      tags: Array.isArray(group.tags) ? group.tags : splitTags(group.tags)
    })) : [];
    return normalized;
  }

  if (type === "text-block") {
    normalized.content = Array.isArray(section.content) ? section.content.map((block) => ({
      heading: block.heading || "Heading",
      text: block.text || ""
    })) : [];
    return normalized;
  }

  if (type === "contact") {
    return normalized;
  }

  normalized.fields = Array.isArray(section.fields) && section.fields.length
    ? section.fields.map(normalizeField)
    : defaultFieldsFor(type).map(normalizeField);
  normalized.items = Array.isArray(section.items) ? section.items.map((item) => ({ ...item })) : [];
  return normalized;
}

function normalizeTheme(theme = {}) {
  return {
    templateId: theme.templateId || "modern-grid",
    primary: theme.primary || "#39d98a",
    secondary: theme.secondary || "#62c7ff",
    accent: theme.accent || "#f4c95d",
    background: theme.background || "#090d13",
    surface: theme.surface || "#141d2a",
    text: theme.text || "#f3f7fb",
    mutedText: theme.mutedText || "#9fb0c3",
    headingFont: theme.headingFont || "Inter",
    bodyFont: theme.bodyFont || "Inter",
    radius: theme.radius || "8px",
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

  return {
    profile,
    hero,
    theme: normalizeTheme(data.theme || {}),
    sections
  };
}

function migrateLegacySections(data) {
  return Array.isArray(DEFAULT_DATA.sections) ? DEFAULT_DATA.sections : [];
}

function splitTags(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function saveDraft(data = editorData) {
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

function applyTheme(data) {
  const theme = normalizeTheme(data.theme);
  const root = document.documentElement;
  const densityMap = {
    compact: "0.82",
    comfortable: "1",
    spacious: "1.18"
  };

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-dark", theme.primary);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--bg", theme.background);
  root.style.setProperty("--bg-soft", theme.surface);
  root.style.setProperty("--bg-elevated", theme.surface);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--text-muted", theme.mutedText);
  root.style.setProperty("--radius", theme.radius);
  root.style.setProperty("--density", densityMap[theme.density] || "1");
  root.style.setProperty("--heading-font", fontStack(theme.headingFont));
  root.style.setProperty("--body-font", fontStack(theme.bodyFont));
  document.body.dataset.template = theme.templateId;
}

function fontStack(fontName) {
  const presets = {
    Inter: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    System: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    Georgia: 'Georgia, "Times New Roman", serif',
    Mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
  };
  return presets[fontName] || presets.Inter;
}

function renderPublicSite() {
  const data = getPortfolioData();
  applyTheme(data);
  renderProfile(data);
  renderHero(data);
  renderNav(data);
  renderSections(data);
  renderFooter(data);
  initCommonInteractions();
}

function renderProfile(data) {
  document.querySelectorAll("[data-profile='name']").forEach((element) => {
    element.textContent = data.profile.name;
  });
  document.querySelectorAll("[data-profile='initials']").forEach((element) => {
    element.textContent = data.profile.initials;
  });
  setText("#profile-role-line", `${data.profile.role} • ${data.profile.location}`);
  const avatar = document.querySelector("#profile-avatar");
  const avatarImage = avatar?.querySelector("img");
  if (avatar && avatarImage) {
    avatarImage.src = data.profile.photoUrl || "";
    avatar.classList.toggle("has-photo", Boolean(data.profile.photoUrl));
  }
}

function renderHero(data) {
  setText("#hero-kicker", data.hero.kicker);
  const title = document.querySelector("#hero-title");
  if (title) {
    title.innerHTML = "";
    title.append(`${data.hero.headlinePrefix} `);
    title.appendChild(createElement("span", "", data.profile.name));
  }
  setText("#hero-tagline", `${data.hero.tagline} `);
  setText("#hero-summary", data.hero.summary);
  setText("#hero-status-text", data.hero.statusText);
  setText("#hero-status-value", data.hero.statusValue);

  const actions = document.querySelector("#hero-actions");
  if (actions) {
    actions.replaceChildren();
    const primaryHref = data.profile[data.hero.primaryButton?.hrefField] || data.profile.resumeUrl;
    const primary = createElement("a", "btn btn-primary", data.hero.primaryButton?.label || "Download Resume");
    primary.setAttribute("download", "");
    setLinkState(primary, primaryHref);
    actions.append(primary);
    const targetSection = data.sections.find((section) => section.id === data.hero.secondaryButton?.sectionId && section.visible);
    const secondary = createElement("a", "btn btn-secondary", data.hero.secondaryButton?.label || "View Work");
    setLinkState(secondary, targetSection ? `#${targetSection.id}` : "#");
    actions.append(secondary);
  }

  renderSocialLinks(data);
  startTyping(data.hero.typingWords || []);
}

function renderSocialLinks(data) {
  const container = document.querySelector("#social-links");
  if (!container) return;
  container.replaceChildren();
  [
    { label: "GitHub", url: data.profile.githubUrl, text: "GH" },
    { label: "LinkedIn", url: data.profile.linkedinUrl, text: "IN" },
    { label: "Email", url: data.profile.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.profile.email)}` : "", text: "@" }
  ].forEach((item) => {
    const link = createElement("a", "", item.text);
    link.setAttribute("aria-label", item.label);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    setLinkState(link, item.url);
    container.append(link);
  });
}

function renderNav(data) {
  const navMenu = document.querySelector("#nav-menu");
  if (!navMenu) return;
  navMenu.replaceChildren();
  const links = [{ id: "home", title: "Home" }, ...data.sections.filter((section) => section.visible)];
  links.forEach((section, index) => {
    const item = createElement("li");
    const link = createElement("a", `nav-link${index === 0 ? " active" : ""}`, section.title);
    link.href = `#${section.id}`;
    item.append(link);
    navMenu.append(item);
  });
}

function renderSections(data) {
  const root = document.querySelector("#sections-root");
  if (!root) return;
  root.replaceChildren();
  data.sections.filter((section) => section.visible).forEach((section, index) => {
    const wrapper = createElement("section", `section${index % 2 ? " section-muted" : ""}`);
    wrapper.id = section.id;
    wrapper.setAttribute("aria-labelledby", `${section.id}-title`);
    const container = createElement("div", "container");
    container.append(createSectionHeading(section));

    const renderer = {
      "tag-list": renderTagList,
      "card-list": renderCardList,
      timeline: renderTimeline,
      "text-block": renderTextBlock,
      "link-list": renderLinkList,
      contact: renderContact
    }[section.type];

    container.append(renderer ? renderer(section, data) : renderEmptyState("Unsupported section type."));
    wrapper.append(container);
    root.append(wrapper);
  });
}

function createSectionHeading(section) {
  const heading = createElement("div", "section-heading reveal visible");
  heading.append(createElement("p", "section-kicker", section.title));
  const title = createElement("h2", "", section.subtitle || section.title);
  title.id = `${section.id}-title`;
  heading.append(title);
  return heading;
}

function renderEmptyState(message) {
  return createElement("p", "empty-state", message || "Nothing added yet.");
}

function renderTagList(section) {
  const grid = createElement("div", "skills-grid");
  if (!section.groups?.length) return renderEmptyState("No skills added yet.");
  section.groups.forEach((group) => {
    const card = createElement("article", "skill-card reveal visible");
    card.append(createElement("h3", "", group.title));
    const list = createElement("div", "skill-list");
    (group.tags || []).forEach((tag) => list.append(createElement("span", "", tag)));
    card.append(list);
    grid.append(card);
  });
  return grid;
}

function renderTextBlock(section) {
  const grid = createElement("div", "about-grid");
  if (!section.content?.length) return renderEmptyState("No text blocks added yet.");
  section.content.forEach((block) => {
    const article = createElement("article", "about-panel reveal visible");
    article.append(createElement("h3", "", block.heading));
    article.append(createElement("p", "", block.text));
    grid.append(article);
  });
  return grid;
}

function renderCardList(section) {
  const grid = createElement("div", "project-grid dynamic-card-grid");
  if (!section.items?.length) return renderEmptyState("No items added yet.");
  section.items.forEach((item, index) => grid.append(renderGenericCard(section, item, index)));
  return grid;
}

function renderTimeline(section) {
  const timeline = createElement("div", "timeline-list");
  if (!section.items?.length) return renderEmptyState("No timeline items added yet.");
  section.items.forEach((item, index) => timeline.append(renderGenericCard(section, item, index, "timeline-item")));
  return timeline;
}

function renderLinkList(section) {
  const list = createElement("div", "link-list");
  if (!section.items?.length) return renderEmptyState("No links added yet.");
  section.items.forEach((item) => {
    const link = createElement("a", "link-card");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    setLinkState(link, item.url);
    link.append(createElement("strong", "", item.title || "Untitled Link"));
    link.append(createElement("span", "", item.description || item.url || ""));
    list.append(link);
  });
  return list;
}

function renderGenericCard(section, item, index, extraClass = "") {
  const card = createElement("article", `project-card reveal visible ${extraClass}`);
  const fields = section.fields || [];
  const titleField = fields.find((field) => field.key === "title") || fields[0];
  const subtitleField = fields.find((field) => ["type", "subtitle", "issuer", "organization", "duration"].includes(field.key));
  const descriptionField = fields.find((field) => field.type === "textarea" || field.key === "description");
  const imageField = fields.find((field) => field.type === "image");

  const top = createElement("div", "project-topline");
  top.append(createElement("span", "project-index", String(index + 1).padStart(2, "0")));
  if (subtitleField && item[subtitleField.key]) {
    top.append(createElement("span", "project-type", item[subtitleField.key]));
  }
  card.append(top);

  if (imageField && item[imageField.key]) {
    const image = document.createElement("img");
    image.className = "card-image";
    image.src = item[imageField.key];
    image.alt = item[titleField?.key] || section.title;
    card.append(image);
  }

  card.append(createElement("h3", "", item[titleField?.key] || "Untitled"));
  if (descriptionField && item[descriptionField.key]) {
    card.append(renderDescription(item[descriptionField.key]));
  }

  fields.filter((field) => field.showInCard && ![titleField?.key, subtitleField?.key, descriptionField?.key, imageField?.key].includes(field.key)).forEach((field) => {
    const value = item[field.key];
    if (!value) return;
    if (field.type === "tags") {
      const stack = createElement("div", "tech-stack");
      splitTags(value).forEach((tag) => stack.append(createElement("span", "", tag)));
      card.append(stack);
      return;
    }
    if (field.type === "url") {
      return;
    }
    const row = createElement("p", "field-row");
    row.innerHTML = `<strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(String(value))}`;
    card.append(row);
  });

  const urlFields = fields.filter((field) => field.type === "url" && item[field.key]);
  if (urlFields.length) {
    const actions = createElement("div", "project-actions");
    urlFields.forEach((field, urlIndex) => {
      const link = createElement("a", `btn btn-small ${urlIndex === 0 ? "btn-primary" : "btn-secondary"}`, field.label);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      setLinkState(link, item[field.key]);
      actions.append(link);
    });
    card.append(actions);
  }
  return card;
}

function renderDescription(text) {
  const lines = String(text).split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 1) {
    const list = document.createElement("ul");
    lines.forEach((line) => list.append(createElement("li", "", line)));
    return list;
  }
  return createElement("p", "", text);
}

function renderContact(section, data) {
  const grid = createElement("div", "contact-grid");
  const form = document.createElement("form");
  form.className = "contact-form reveal visible";
  form.id = "contact-form";
  form.innerHTML = `
    <label for="name">Name</label>
    <input type="text" id="name" name="name" autocomplete="name" required>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" autocomplete="email" required>
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="5" required></textarea>
    <button class="btn btn-primary" type="submit">Send Message</button>
    <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
  `;
  const info = createElement("aside", "contact-info reveal visible");
  info.setAttribute("aria-label", "Contact information");
  [
    { label: "Email", value: data.profile.email, href: data.profile.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.profile.email)}` : "" },
    { label: "GitHub", value: formatLinkLabel(data.profile.githubUrl, "Add GitHub profile"), href: data.profile.githubUrl },
    { label: "LinkedIn", value: formatLinkLabel(data.profile.linkedinUrl, "Add LinkedIn profile"), href: data.profile.linkedinUrl },
    { label: "Location", value: data.profile.location, href: "" }
  ].forEach((item) => {
    const element = item.href ? document.createElement("a") : document.createElement("p");
    if (item.href && !item.href.startsWith("mailto:")) {
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }
    if (item.href) setLinkState(element, item.href);
    element.innerHTML = `<span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value || "")}</strong>`;
    info.append(element);
  });
  grid.append(form, info);
  return grid;
}

function renderFooter(data) {
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
  const links = document.querySelector("#footer-links");
  if (!links) return;
  links.replaceChildren();
  [
    { label: "GitHub", href: data.profile.githubUrl },
    { label: "LinkedIn", href: data.profile.linkedinUrl },
    { label: "Email", href: data.profile.email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.profile.email)}` : "" },
    { label: "Edit Site", href: "admin.html" }
  ].forEach((item) => {
    const link = createElement("a", "", item.label);
    if (item.href?.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    setLinkState(link, item.href);
    links.append(link);
  });
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

let typingTimer = null;
function startTyping(words) {
  const target = document.querySelector("#typing-text");
  if (!target || !words.length) return;
  clearTimeout(typingTimer);
  let wordIndex = 0;
  let letterIndex = 0;
  let deleting = false;
  const loop = () => {
    const word = words[wordIndex] || "";
    target.textContent = word.slice(0, letterIndex);
    if (!deleting && letterIndex < word.length) {
      letterIndex += 1;
      typingTimer = setTimeout(loop, 90);
      return;
    }
    if (deleting && letterIndex > 0) {
      letterIndex -= 1;
      typingTimer = setTimeout(loop, 45);
      return;
    }
    if (!deleting) {
      deleting = true;
      typingTimer = setTimeout(loop, 1200);
      return;
    }
    deleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    typingTimer = setTimeout(loop, 250);
  };
  loop();
}

function initCommonInteractions() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const backToTop = document.querySelector(".back-to-top");

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("open");
      navToggle?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

  window.addEventListener("scroll", () => {
    backToTop?.classList.toggle("visible", window.scrollY > 500);
  }, { passive: true });

  document.querySelectorAll(".disabled-link").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  const contactForm = document.querySelector("#contact-form");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = getPortfolioData();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const message = String(formData.get("message")).trim();
    const status = document.querySelector("#form-status");
    if (!name || !email || !message) {
      status.textContent = "Please complete all fields before sending.";
      return;
    }
    if (!data.profile.email) {
      status.textContent = "Please add an email address first.";
      return;
    }

    const subjectText = `Portfolio message from ${name}`;
    const bodyText = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const subject = encodeURIComponent(subjectText);
    const body = encodeURIComponent(bodyText);
    const toEmail = encodeURIComponent(data.profile.email);

    // Gmail web compose — deliberately NOT using mailto:, since mailto: only works
    // if the laptop has a default mail app configured, and just gets stuck on a
    // blank tab otherwise. Gmail web compose only needs a browser + internet.
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toEmail}&su=${subject}&body=${body}`;

    // Opening via a real, appended <a> click is far more reliable across browsers/laptops
    // than window.open(), which many browsers silently block as a popup.
    const link = document.createElement("a");
    link.href = gmailUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();

    const copyText = `To: ${data.profile.email}\nSubject: ${subjectText}\n\n${bodyText}`;
    status.innerHTML = `Opening Gmail in a new tab... If it didn't open, <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer">click here</a> or <button type="button" id="copy-message-btn" style="background:none;border:none;padding:0;font:inherit;color:var(--primary,#39d98a);text-decoration:underline;cursor:pointer;">copy the message</button> to paste into any email app.`;

    const copyButton = document.querySelector("#copy-message-btn");
    copyButton?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyText);
        status.textContent = `Copied! Paste it into an email addressed to ${data.profile.email}.`;
      } catch {
        status.textContent = `Please email ${data.profile.email} directly with your message.`;
      }
    });

    contactForm.reset();
  });
}

async function hashText(value) {
  if (!crypto.subtle) return "";
  const encodedValue = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedValue);
  return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function initAdmin() {
  const loginForm = document.querySelector("#login-form");
  const editor = document.querySelector("#admin-editor");
  const login = document.querySelector("#admin-login");
  if (!loginForm || !editor) return;

  applyTheme(editorData);
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "true") showEditor();

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = loginForm.elements.namedItem("admin-password").value;
    const hash = await hashText(password);
    if (hash !== ADMIN_PASSWORD_HASH && password !== ADMIN_PASSWORD_FALLBACK) {
      setText("#login-status", "Incorrect password. Try again.");
      return;
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    loginForm.reset();
    showEditor();
  });

  function showEditor() {
    login.classList.add("hidden");
    editor.classList.remove("hidden");
    renderAdmin();
  }
}

function renderAdmin() {
  applyTheme(editorData);
  renderProfileEditor();
  renderAppearanceEditor();
  renderSectionEditors();
  bindAdminEvents();
  runValidation(false);
}

function bindAdminEvents() {
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.onclick = () => {
      document.querySelectorAll(".admin-tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`[data-panel='${tab.dataset.tab}']`)?.classList.add("active");
    };
  });

  document.querySelector("#admin-form").onsubmit = (event) => {
    event.preventDefault();
    saveDraft(editorData);
    setEditorStatus("Draft saved.");
  };
  document.querySelector("#save-draft").onclick = () => {
    saveDraft(editorData);
    setEditorStatus("Draft saved.");
  };
  document.querySelector("#export-data").onclick = () => {
    const issues = validateData(editorData).filter((issue) => issue.level === "error");
    if (issues.length) {
      runValidation(true);
      setEditorStatus("Fix validation errors before exporting.");
      return;
    }
    downloadData(editorData);
    setEditorStatus("Downloaded data.js. Replace the GitHub file and Render will redeploy.");
  };
  document.querySelector("#reset-data").onclick = () => {
    if (!confirm("Reset local draft to deployed data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    editorData = normalizeData(DEFAULT_DATA);
    renderAdmin();
    setEditorStatus("Draft reset.");
  };
  document.querySelector("#lock-editor").onclick = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.reload();
  };
  document.querySelector("#run-validation").onclick = () => runValidation(true);
  document.querySelector("#reset-theme").onclick = () => {
    editorData.theme = normalizeTheme({});
    saveDraft(editorData);
    renderAdmin();
  };
  document.querySelector("#import-data").onchange = handleImport;
  document.querySelector("#add-section").onclick = addSectionFromControls;

  document.querySelectorAll("[data-bind]").forEach((input) => {
    input.oninput = () => {
      setPath(editorData, input.dataset.bind, input.type === "checkbox" ? input.checked : input.value);
      if (input.dataset.bind.endsWith(".title")) {
        const index = Number(input.dataset.sectionIndex);
        if (!Number.isNaN(index)) {
          editorData.sections[index].id = uniqueSectionId(input.value, editorData.sections, editorData.sections[index].id);
        }
      }
      saveDraft(editorData);
      applyTheme(editorData);
    };
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.onclick = () => handleAdminAction(button);
  });
}

function renderProfileEditor() {
  const root = document.querySelector("#profile-editor");
  if (!root) return;
  const fields = [
    ["profile.name", "Name", "text"],
    ["profile.initials", "Initials", "text"],
    ["profile.role", "Role", "text"],
    ["profile.college", "College", "text"],
    ["profile.location", "Location", "text"],
    ["profile.email", "Email", "email"],
    ["profile.githubUrl", "GitHub URL", "url"],
    ["profile.linkedinUrl", "LinkedIn URL", "url"],
    ["profile.resumeUrl", "Resume URL", "text"],
    ["profile.photoUrl", "Photo URL", "url"],
    ["hero.kicker", "Hero Kicker", "text"],
    ["hero.headlinePrefix", "Headline Prefix", "text"],
    ["hero.tagline", "Tagline", "text"],
    ["hero.summary", "Hero Summary", "textarea"],
    ["hero.statusText", "Status Text", "text"],
    ["hero.statusValue", "Status Value", "text"]
  ];
  root.replaceChildren();
  fields.forEach(([path, label, type]) => root.append(createBoundField(path, label, type)));
  root.append(createBoundField("hero.typingWords", "Typing Words (comma separated)", "tags"));
}

function renderAppearanceEditor() {
  const root = document.querySelector("#appearance-editor");
  if (!root) return;
  root.replaceChildren();
  const colorFields = [
    ["theme.primary", "Primary"],
    ["theme.secondary", "Secondary"],
    ["theme.accent", "Accent"],
    ["theme.background", "Background"],
    ["theme.surface", "Surface"],
    ["theme.text", "Text"],
    ["theme.mutedText", "Muted Text"]
  ];
  const presetBox = createElement("div", "admin-field full-span");
  presetBox.append(createElement("label", "", "Preset Palettes"));
  const presetButtons = createElement("div", "preset-row");
  Object.entries(THEME_PRESETS).forEach(([key, preset]) => {
    const button = createElement("button", "btn btn-secondary", key);
    button.type = "button";
    button.onclick = () => {
      editorData.theme = { ...editorData.theme, ...preset };
      saveDraft(editorData);
      renderAdmin();
    };
    presetButtons.append(button);
  });
  presetBox.append(presetButtons);
  root.append(presetBox);
  colorFields.forEach(([path, label]) => root.append(createBoundField(path, label, "color")));
  root.append(createSelectField("theme.headingFont", "Heading Font", ["Inter", "System", "Georgia", "Mono"]));
  root.append(createSelectField("theme.bodyFont", "Body Font", ["Inter", "System", "Georgia", "Mono"]));
  root.append(createSelectField("theme.radius", "Border Radius", ["4px", "8px", "14px", "22px"]));
  root.append(createSelectField("theme.density", "Spacing Density", ["compact", "comfortable", "spacious"]));
  root.append(createSelectField("theme.templateId", "Template", ["modern-grid", "classic-sidebar", "minimal-timeline"]));
}

function renderSectionEditors() {
  const root = document.querySelector("#section-editor-list");
  if (!root) return;
  root.replaceChildren();
  editorData.sections.forEach((section, sectionIndex) => {
    const card = createElement("article", "section-editor-card");
    card.innerHTML = `
      <div class="section-editor-head">
        <div>
          <h3>${escapeHtml(section.title)}</h3>
          <p>${escapeHtml(section.type)} / #${escapeHtml(section.id)}</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-secondary" type="button" data-action="move-up" data-section="${sectionIndex}">Up</button>
          <button class="btn btn-secondary" type="button" data-action="move-down" data-section="${sectionIndex}">Down</button>
          <button class="btn btn-secondary" type="button" data-action="delete-section" data-section="${sectionIndex}">Delete</button>
        </div>
      </div>
    `;
    const meta = createElement("div", "editor-grid");
    meta.append(createBoundField(`sections.${sectionIndex}.title`, "Section Title", "text", sectionIndex));
    meta.append(createBoundField(`sections.${sectionIndex}.subtitle`, "Section Subtitle", "text", sectionIndex));
    meta.append(createSelectField(`sections.${sectionIndex}.type`, "Section Type", SECTION_TYPES));
    meta.append(createBoundField(`sections.${sectionIndex}.visible`, "Show Section", "checkbox", sectionIndex));
    card.append(meta);

    if (["card-list", "timeline", "link-list"].includes(section.type)) {
      card.append(renderFieldBuilder(section, sectionIndex));
      card.append(renderItemEditor(section, sectionIndex));
    } else if (section.type === "tag-list") {
      card.append(renderTagEditor(section, sectionIndex));
    } else if (section.type === "text-block") {
      card.append(renderTextEditor(section, sectionIndex));
    } else {
      card.append(createElement("p", "editor-note", "Contact uses profile email, social links, and location from the Profile tab."));
    }
    root.append(card);
  });
}

function renderFieldBuilder(section, sectionIndex) {
  const box = createElement("div", "nested-editor");
  box.append(createElement("h4", "", "Fields"));
  section.fields.forEach((field, fieldIndex) => {
    const row = createElement("div", "field-builder-row");
    row.append(createBoundField(`sections.${sectionIndex}.fields.${fieldIndex}.label`, "Label", "text"));
    row.append(createBoundField(`sections.${sectionIndex}.fields.${fieldIndex}.key`, "Key", "text"));
    row.append(createSelectField(`sections.${sectionIndex}.fields.${fieldIndex}.type`, "Type", FIELD_TYPES));
    row.append(createBoundField(`sections.${sectionIndex}.fields.${fieldIndex}.required`, "Required", "checkbox"));
    row.append(createBoundField(`sections.${sectionIndex}.fields.${fieldIndex}.showInCard`, "Show", "checkbox"));
    const remove = createElement("button", "btn btn-secondary", "Remove Field");
    remove.type = "button";
    remove.dataset.action = "remove-field";
    remove.dataset.section = sectionIndex;
    remove.dataset.field = fieldIndex;
    row.append(remove);
    box.append(row);
  });
  const add = createElement("button", "btn btn-secondary", "Add Field");
  add.type = "button";
  add.dataset.action = "add-field";
  add.dataset.section = sectionIndex;
  box.append(add);
  return box;
}

function renderItemEditor(section, sectionIndex) {
  const box = createElement("div", "nested-editor");
  box.append(createElement("h4", "", "Items"));
  if (!section.items.length) box.append(createElement("p", "empty-state", "No items yet."));
  section.items.forEach((item, itemIndex) => {
    const card = createElement("div", "item-editor-card");
    const head = createElement("div", "section-editor-head");
    head.append(createElement("h4", "", item.title || `Item ${itemIndex + 1}`));
    const remove = createElement("button", "btn btn-secondary", "Remove Item");
    remove.type = "button";
    remove.dataset.action = "remove-item";
    remove.dataset.section = sectionIndex;
    remove.dataset.item = itemIndex;
    head.append(remove);
    card.append(head);
    section.fields.forEach((field) => {
      card.append(createBoundField(`sections.${sectionIndex}.items.${itemIndex}.${field.key}`, field.label, field.type));
    });
    box.append(card);
  });
  const add = createElement("button", "btn btn-secondary", "Add Item");
  add.type = "button";
  add.dataset.action = "add-item";
  add.dataset.section = sectionIndex;
  box.append(add);
  return box;
}

function renderTagEditor(section, sectionIndex) {
  const box = createElement("div", "nested-editor");
  box.append(createElement("h4", "", "Groups"));
  section.groups.forEach((group, groupIndex) => {
    const row = createElement("div", "item-editor-card");
    row.append(createBoundField(`sections.${sectionIndex}.groups.${groupIndex}.title`, "Group Title", "text"));
    row.append(createBoundField(`sections.${sectionIndex}.groups.${groupIndex}.tags`, "Tags", "tags"));
    const remove = createElement("button", "btn btn-secondary", "Remove Group");
    remove.type = "button";
    remove.dataset.action = "remove-group";
    remove.dataset.section = sectionIndex;
    remove.dataset.group = groupIndex;
    row.append(remove);
    box.append(row);
  });
  const add = createElement("button", "btn btn-secondary", "Add Skill Group");
  add.type = "button";
  add.dataset.action = "add-group";
  add.dataset.section = sectionIndex;
  box.append(add);
  return box;
}

function renderTextEditor(section, sectionIndex) {
  const box = createElement("div", "nested-editor");
  box.append(createElement("h4", "", "Text Blocks"));
  section.content.forEach((block, blockIndex) => {
    const row = createElement("div", "item-editor-card");
    row.append(createBoundField(`sections.${sectionIndex}.content.${blockIndex}.heading`, "Heading", "text"));
    row.append(createBoundField(`sections.${sectionIndex}.content.${blockIndex}.text`, "Text", "textarea"));
    const remove = createElement("button", "btn btn-secondary", "Remove Block");
    remove.type = "button";
    remove.dataset.action = "remove-text-block";
    remove.dataset.section = sectionIndex;
    remove.dataset.block = blockIndex;
    row.append(remove);
    box.append(row);
  });
  const add = createElement("button", "btn btn-secondary", "Add Text Block");
  add.type = "button";
  add.dataset.action = "add-text-block";
  add.dataset.section = sectionIndex;
  box.append(add);
  return box;
}

function createBoundField(path, label, type, sectionIndex) {
  const wrapper = createElement("div", "admin-field");
  const id = `field-${path.replace(/[^a-z0-9]/gi, "-")}`;
  const labelElement = createElement("label", "", label);
  labelElement.htmlFor = id;
  let input;
  const value = getPath(editorData, path);
  if (type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 4;
    input.value = value || "";
  } else if (type === "checkbox") {
    input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(value);
  } else {
    input = document.createElement("input");
    input.type = type === "tags" ? "text" : type;
    input.value = Array.isArray(value) ? value.join(", ") : (value || "");
  }
  input.id = id;
  input.dataset.bind = path;
  if (sectionIndex !== undefined) input.dataset.sectionIndex = sectionIndex;
  wrapper.append(labelElement, input);
  if (type === "url" || type === "image") wrapper.append(createOpenButton(input));
  return wrapper;
}

function createSelectField(path, label, options) {
  const wrapper = createElement("div", "admin-field");
  const id = `field-${path.replace(/[^a-z0-9]/gi, "-")}`;
  const labelElement = createElement("label", "", label);
  labelElement.htmlFor = id;
  const select = document.createElement("select");
  select.id = id;
  select.dataset.bind = path;
  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option;
    element.textContent = option;
    select.append(element);
  });
  select.value = getPath(editorData, path) || options[0];
  wrapper.append(labelElement, select);
  return wrapper;
}

function createOpenButton(input) {
  const button = createElement("button", "btn btn-secondary open-url", "Open");
  button.type = "button";
  button.onclick = () => {
    const url = input.value.trim();
    if (!url) {
      input.focus();
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return button;
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

function handleAdminAction(button) {
  const action = button.dataset.action;
  const sectionIndex = Number(button.dataset.section);
  const section = editorData.sections[sectionIndex];
  if (action === "move-up" && sectionIndex > 0) {
    editorData.sections.splice(sectionIndex - 1, 0, editorData.sections.splice(sectionIndex, 1)[0]);
  }
  if (action === "move-down" && sectionIndex < editorData.sections.length - 1) {
    editorData.sections.splice(sectionIndex + 1, 0, editorData.sections.splice(sectionIndex, 1)[0]);
  }
  if (action === "delete-section" && confirm(`Delete ${section.title}?`)) {
    editorData.sections.splice(sectionIndex, 1);
  }
  if (action === "add-field") {
    const next = section.fields.length + 1;
    section.fields.push(normalizeField({ key: `field_${next}`, label: `Field ${next}`, type: "text" }));
  }
  if (action === "remove-field") {
    section.fields.splice(Number(button.dataset.field), 1);
  }
  if (action === "add-item") {
    const item = {};
    section.fields.forEach((field) => { item[field.key] = field.type === "tags" ? [] : ""; });
    section.items.push(item);
  }
  if (action === "remove-item") {
    section.items.splice(Number(button.dataset.item), 1);
  }
  if (action === "add-group") section.groups.push({ title: "New Group", tags: [] });
  if (action === "remove-group") section.groups.splice(Number(button.dataset.group), 1);
  if (action === "add-text-block") section.content.push({ heading: "New Heading", text: "" });
  if (action === "remove-text-block") section.content.splice(Number(button.dataset.block), 1);
  editorData = normalizeData(editorData);
  saveDraft(editorData);
  renderAdmin();
}

function addSectionFromControls() {
  const titleInput = document.querySelector("#new-section-title");
  const typeInput = document.querySelector("#new-section-type");
  const title = titleInput.value.trim() || "New Section";
  const type = typeInput.value;
  const section = normalizeSection({ id: uniqueSectionId(title, editorData.sections), title, subtitle: title, type, visible: true }, editorData.sections.length, editorData.sections);
  if (["card-list", "timeline", "link-list"].includes(type)) {
    section.fields = defaultFieldsFor(type).map(normalizeField);
    section.items = [];
  }
  if (type === "tag-list") section.groups = [];
  if (type === "text-block") section.content = [];
  editorData.sections.push(section);
  titleInput.value = "";
  saveDraft(editorData);
  renderAdmin();
}

function validateData(data) {
  const issues = [];
  if (!data.profile.name) issues.push({ level: "error", message: "Profile name is required." });
  if (data.profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.profile.email)) {
    issues.push({ level: "error", message: "Profile email is not valid." });
  }
  data.sections.forEach((section) => {
    if (!section.title) issues.push({ level: "error", message: "Every section needs a title." });
    if (!SECTION_TYPES.includes(section.type)) issues.push({ level: "error", message: `${section.title} has an invalid type.` });
    if (["card-list", "timeline", "link-list"].includes(section.type)) {
      section.items.forEach((item, itemIndex) => {
        section.fields.forEach((field) => {
          const value = item[field.key];
          if (field.required && !value) issues.push({ level: "error", message: `${section.title} item ${itemIndex + 1}: ${field.label} is required.` });
          if (["url", "image"].includes(field.type) && value && !isUsableUrl(value)) {
            issues.push({ level: "warning", message: `${section.title} item ${itemIndex + 1}: ${field.label} may be a broken link.` });
          }
        });
      });
    }
    if (section.visible && section.type !== "contact" && !section.items?.length && !section.groups?.length && !section.content?.length) {
      issues.push({ level: "warning", message: `${section.title} is visible but empty.` });
    }
  });
  return issues;
}

function runValidation(showStatus) {
  const results = document.querySelector("#validation-results");
  if (!results) return;
  const issues = validateData(editorData);
  results.replaceChildren();
  if (!issues.length) {
    results.append(createElement("p", "success-state", "No validation issues found."));
    if (showStatus) setEditorStatus("Validation passed.");
    return;
  }
  issues.forEach((issue) => {
    const item = createElement("p", `validation-item ${issue.level}`, `${issue.level.toUpperCase()}: ${issue.message}`);
    results.append(item);
  });
}

function downloadData(data) {
  const fileContents = `window.PORTFOLIO_DATA = ${JSON.stringify(normalizeData(data), null, 2)};\n`;
  const blob = new Blob([fileContents], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "data.js";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result);
      const imported = parseImportedData(text);
      editorData = normalizeData(imported);
      saveDraft(editorData);
      renderAdmin();
      setEditorStatus("Imported data.js successfully.");
    } catch (error) {
      setEditorStatus("Import failed. Check that the file contains window.PORTFOLIO_DATA.");
    }
  };
  reader.readAsText(file);
}

function parseImportedData(text) {
  if (text.trim().startsWith("{")) return JSON.parse(text);
  const match = text.match(/window\.PORTFOLIO_DATA\s*=\s*([\s\S]*?);?\s*$/);
  if (!match) throw new Error("Missing data object.");
  return Function(`"use strict"; return (${match[1]});`)();
}

function setEditorStatus(message) {
  setText("#editor-status", message);
}

if (document.body.classList.contains("admin-page")) {
  initAdmin();
} else {
  renderPublicSite();
}