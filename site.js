/**
 * site.js
 * Renders the public portfolio page. Loaded by index.html only,
 * after core.js and data.js. Nothing in here ever touches the
 * admin editor, so this is the only script a visitor's browser
 * has to download and run.
 */

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
  setText("#profile-role-line", `${data.profile.role} — ${data.profile.location}`);
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
    container.append(createSectionHeading(section, index));

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

function createSectionHeading(section, index) {
  const heading = createElement("div", "section-heading reveal visible");
  heading.append(createElement("p", "section-kicker", `// ${String(index + 1).padStart(2, "0")} — ${section.title.toLowerCase()}`));
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
  const grid = createElement("div", "card-grid");
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
  const card = createElement("article", `card-item reveal visible ${extraClass}`);
  const fields = section.fields || [];
  const titleField = fields.find((field) => field.key === "title") || fields[0];
  const subtitleField = fields.find((field) => ["type", "subtitle", "issuer", "organization", "duration"].includes(field.key));
  const descriptionField = fields.find((field) => field.type === "textarea" || field.key === "description");
  const imageField = fields.find((field) => field.type === "image");

  const top = createElement("div", "card-topline");
  top.append(createElement("span", "card-index", String(index + 1).padStart(2, "0")));
  if (subtitleField && item[subtitleField.key]) {
    top.append(createElement("span", "card-type", item[subtitleField.key]));
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
    if (field.type === "url") return;
    const row = createElement("p", "field-row");
    row.innerHTML = `<strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(String(value))}`;
    card.append(row);
  });

  const urlFields = fields.filter((field) => field.type === "url" && item[field.key]);
  if (urlFields.length) {
    const actions = createElement("div", "card-actions");
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
  const backToTop = document.querySelector(".back-to-top");

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
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
    // if the device has a default mail app configured, and otherwise just opens
    // a blank tab. Gmail web compose only needs a browser + internet.
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toEmail}&su=${subject}&body=${body}`;

    // Opening via a real, appended <a> click is more reliable across browsers
    // than window.open(), which many browsers silently block as a popup.
    const link = document.createElement("a");
    link.href = gmailUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();

    const copyText = `To: ${data.profile.email}\nSubject: ${subjectText}\n\n${bodyText}`;
    status.innerHTML = `Opening Gmail in a new tab. If it didn't open, <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer">click here</a> or <button type="button" id="copy-message-btn" class="link-button">copy the message</button> to paste into any email app.`;

    document.querySelector("#copy-message-btn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyText);
        status.textContent = `Copied. Paste it into an email addressed to ${data.profile.email}.`;
      } catch {
        status.textContent = `Please email ${data.profile.email} directly with your message.`;
      }
    });

    contactForm.reset();
  });
}

renderPublicSite();
