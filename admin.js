/**
 * admin.js
 * The password-gated visual editor. Loaded by admin.html only —
 * a visitor to index.html never downloads this file.
 */

let editorData = normalizeData(loadDraft() || DEFAULT_DATA);

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
    if (!ADMIN_PASSWORD_HASH || hash !== ADMIN_PASSWORD_HASH) {
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
      setEditorStatus("Fix validation errors in Settings before exporting.");
      return;
    }
    downloadData(editorData);
    setEditorStatus("Downloaded data.js. Replace the file in GitHub and Render will redeploy.");
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
  document.querySelector("#generate-hash").onclick = generatePasswordHash;

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
  presetBox.append(createElement("label", "", "Preset palettes"));
  const presetButtons = createElement("div", "preset-row");
  Object.entries(THEME_PRESETS).forEach(([key, preset]) => {
    const button = createElement("button", "btn btn-secondary", key.charAt(0).toUpperCase() + key.slice(1));
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
  root.append(createSelectField("theme.headingFont", "Heading Font", Object.keys(FONT_STACKS)));
  root.append(createSelectField("theme.bodyFont", "Body Font", Object.keys(FONT_STACKS)));
  root.append(createSelectField("theme.radius", "Corner Radius", ["2px", "6px", "10px", "16px"]));
  root.append(createSelectField("theme.density", "Spacing Density", ["compact", "comfortable", "spacious"]));
  root.append(createSelectField("theme.templateId", "Layout Template", ["modern-grid", "classic-sidebar", "minimal-timeline"]));
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
          <p>${escapeHtml(section.type)} · #${escapeHtml(section.id)}</p>
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
      card.append(createElement("p", "editor-note", "Contact uses the profile email, social links, and location from the Profile tab."));
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
  if (action === "remove-field") section.fields.splice(Number(button.dataset.field), 1);
  if (action === "add-item") {
    const item = {};
    section.fields.forEach((field) => { item[field.key] = field.type === "tags" ? [] : ""; });
    section.items.push(item);
  }
  if (action === "remove-item") section.items.splice(Number(button.dataset.item), 1);
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
    results.append(createElement("p", `validation-item ${issue.level}`, `${issue.level.toUpperCase()}: ${issue.message}`));
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
      const imported = parseImportedData(String(reader.result));
      editorData = normalizeData(imported);
      saveDraft(editorData);
      renderAdmin();
      setEditorStatus("Imported data.js successfully.");
    } catch {
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

// --- Settings tab: local password hash generator -------------------------
// A static site can't store a secret server-side, so this can only ever
// raise the bar from "plaintext in the repo" to "hashed, not reversible
// without brute force." Anyone with repo access can still read this file.
async function generatePasswordHash() {
  const input = document.querySelector("#new-password");
  const output = document.querySelector("#new-password-hash");
  const value = input.value.trim();
  if (!value) {
    output.textContent = "Type a new password first.";
    return;
  }
  if (value.length < 8) {
    output.textContent = "Use at least 8 characters.";
    return;
  }
  const hash = await hashText(value);
  output.innerHTML = `Paste this into <code>ADMIN_PASSWORD_HASH</code> in <strong>core.js</strong>, commit it, and use your new password next time you log in:<br><code>${hash}</code>`;
}

initAdmin();
