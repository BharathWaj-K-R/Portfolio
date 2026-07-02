const STORAGE_KEY = "bharathwajPortfolioData";
const ADMIN_SESSION_KEY = "bharathwajPortfolioAdmin";
const ADMIN_PASSWORD_HASH = "29b09a62c1086fd3fd7999108a4df33fdba2edc2a205edf90ed450fb5afd6366";

const defaultProjects = [
  {
    title: "AI-Based Interview Preparation System",
    type: "Full-stack AI",
    description: "Resume-based interview question generation, technical and HR interview practice, voice and text answer support, and performance analytics dashboard.",
    techStack: "Python, Flask, SQLite, HTML, CSS, JavaScript",
    githubUrl: "https://github.com/BharathWaj-K-R/Ai-Interview-preparation",
    liveUrl: ""
  },
  {
    title: "Stress Level Detection from Handwriting",
    type: "Machine Learning",
    description: "Handwriting image upload, stress prediction using machine learning, and a Streamlit-based interface.",
    techStack: "Python, Streamlit, Scikit-Learn",
    githubUrl: "",
    liveUrl: ""
  }
];

const defaultCertificates = [
  {
    title: "Java Programming",
    issuer: "Add issuer and completion date.",
    url: ""
  },
  {
    title: "Web Development",
    issuer: "Add issuer and completion date.",
    url: ""
  },
  {
    title: "Data Structures and Algorithms",
    issuer: "Add issuer and completion date.",
    url: ""
  }
];

const defaultSkills = [
  {
    category: "Programming Languages",
    items: "Java, Python, C, C++"
  },
  {
    category: "Web Technologies",
    items: "HTML, CSS, JavaScript"
  },
  {
    category: "Tools",
    items: "Git, GitHub, Linux, VS Code"
  }
];

const deployedPortfolioData = typeof window !== "undefined" && window.PORTFOLIO_DATA ? window.PORTFOLIO_DATA : {};

const defaultPortfolioData = {
  resumeUrl: "resume.pdf",
  email: "ravikap0063@gmail.com",
  githubUrl: "https://github.com/BharathWaj-K-R",
  linkedinUrl: "",
  profilePhoto: "",
  profilePhotoUrl: "",
  leetcodeUrl: "",
  leetcodeSolved: "--",
  leetcodeRating: "--",
  projects: defaultProjects,
  certificates: defaultCertificates,
  skills: defaultSkills,
  ...deployedPortfolioData,
  projects: deployedPortfolioData.projects || defaultProjects,
  certificates: deployedPortfolioData.certificates || defaultCertificates,
  skills: deployedPortfolioData.skills || defaultSkills
};

function normalizeProject(project = {}) {
  return {
    title: project.title || "New Project",
    type: project.type || "Software Project",
    description: project.description || "",
    techStack: project.techStack || "",
    githubUrl: project.githubUrl || "",
    liveUrl: project.liveUrl || ""
  };
}

function normalizeCertificate(certificate = {}) {
  return {
    title: certificate.title || "New Certificate",
    issuer: certificate.issuer || "",
    url: certificate.url || ""
  };
}

function normalizeSkillCategory(skillCategory = {}) {
  return {
    category: skillCategory.category || "New Skill Category",
    items: skillCategory.items || ""
  };
}

function normalizeData(data = {}) {
  const mergedData = { ...defaultPortfolioData, ...data };

  if (!Array.isArray(mergedData.projects)) {
    mergedData.projects = defaultProjects;
  }

  if (!Array.isArray(mergedData.certificates)) {
    mergedData.certificates = [
      {
        title: mergedData.cert1Title || "Java Programming",
        issuer: mergedData.cert1Meta || "Add issuer and completion date.",
        url: mergedData.cert1Url || ""
      },
      {
        title: mergedData.cert2Title || "Web Development",
        issuer: mergedData.cert2Meta || "Add issuer and completion date.",
        url: mergedData.cert2Url || ""
      },
      {
        title: mergedData.cert3Title || "Data Structures and Algorithms",
        issuer: mergedData.cert3Meta || "Add issuer and completion date.",
        url: mergedData.cert3Url || ""
      }
    ];
  }

  if (!Array.isArray(mergedData.skills)) {
    mergedData.skills = defaultSkills;
  }

  mergedData.projects = mergedData.projects.map(normalizeProject);
  mergedData.certificates = mergedData.certificates.map(normalizeCertificate);
  mergedData.skills = mergedData.skills.map(normalizeSkillCategory);
  return mergedData;
}

function getPortfolioData() {
  const storedData = localStorage.getItem(STORAGE_KEY);

  if (!storedData) {
    return normalizeData();
  }

  try {
    return normalizeData(JSON.parse(storedData));
  } catch {
    return normalizeData();
  }
}

function savePortfolioData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
}

function formatLinkLabel(url, fallback) {
  if (!url) {
    return fallback;
  }

  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function setLinkState(element, url) {
  const validUrl = url && url !== "#";
  element.classList.toggle("disabled-link", !validUrl);
  element.setAttribute("aria-disabled", String(!validUrl));
  element.tabIndex = validUrl ? 0 : -1;
}

function createProjectCard(project, index) {
  const card = document.createElement("article");
  card.className = "project-card reveal visible";

  const techItems = project.techStack
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);

  const descriptionItems = project.description
    .split(/\n|\. /)
    .map((item) => item.replace(/\.$/, "").trim())
    .filter(Boolean);

  card.innerHTML = `
    <div class="project-topline">
      <span class="project-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="project-type"></span>
    </div>
    <h3></h3>
    <div class="project-description"></div>
    <div class="tech-stack"></div>
    <div class="project-actions">
      <a class="btn btn-small btn-primary" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a class="btn btn-small btn-secondary" target="_blank" rel="noopener noreferrer">Live Demo</a>
    </div>
  `;

  card.querySelector(".project-type").textContent = project.type;
  card.querySelector("h3").textContent = project.title;

  const descriptionContainer = card.querySelector(".project-description");

  if (descriptionItems.length > 1) {
    const list = document.createElement("ul");
    descriptionItems.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item.endsWith(".") ? item : `${item}.`;
      list.appendChild(listItem);
    });
    descriptionContainer.appendChild(list);
  } else {
    const paragraph = document.createElement("p");
    paragraph.textContent = project.description || "Project details coming soon.";
    descriptionContainer.appendChild(paragraph);
  }

  const techStack = card.querySelector(".tech-stack");
  techItems.forEach((tech) => {
    const badge = document.createElement("span");
    badge.textContent = tech;
    techStack.appendChild(badge);
  });

  const [githubButton, liveButton] = card.querySelectorAll(".project-actions a");
  githubButton.href = project.githubUrl || "#";
  liveButton.href = project.liveUrl || "#";
  setLinkState(githubButton, project.githubUrl);
  setLinkState(liveButton, project.liveUrl);

  return card;
}

function renderProjects(projects) {
  const projectGrid = document.querySelector("#project-grid");

  if (!projectGrid) {
    return;
  }

  projectGrid.replaceChildren();
  projects.forEach((project, index) => {
    projectGrid.appendChild(createProjectCard(project, index));
  });
}

function createSkillCard(skillCategory) {
  const card = document.createElement("article");
  card.className = "skill-card reveal visible";
  card.innerHTML = `
    <h3></h3>
    <div class="skill-list"></div>
  `;

  card.querySelector("h3").textContent = skillCategory.category;

  const skillList = card.querySelector(".skill-list");
  skillCategory.items
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .forEach((skill) => {
      const badge = document.createElement("span");
      badge.textContent = skill;
      skillList.appendChild(badge);
    });

  return card;
}

function renderSkills(skills) {
  const skillsGrid = document.querySelector("#skills-grid");

  if (!skillsGrid) {
    return;
  }

  skillsGrid.replaceChildren();
  skills.forEach((skillCategory) => {
    skillsGrid.appendChild(createSkillCard(skillCategory));
  });
}

function createCertificateCard(certificate) {
  const card = document.createElement("article");
  card.className = "cert-card reveal visible";
  card.innerHTML = `
    <span>Certificate</span>
    <h3></h3>
    <p></p>
    <a target="_blank" rel="noopener noreferrer">View Certificate</a>
  `;

  card.querySelector("h3").textContent = certificate.title;
  card.querySelector("p").textContent = certificate.issuer || "Issuer and completion date coming soon.";

  const link = card.querySelector("a");
  link.href = certificate.url || "#";
  setLinkState(link, certificate.url);

  return card;
}

function renderCertificates(certificates) {
  const certGrid = document.querySelector("#cert-grid");

  if (!certGrid) {
    return;
  }

  certGrid.replaceChildren();
  certificates.forEach((certificate) => {
    certGrid.appendChild(createCertificateCard(certificate));
  });
}

function renderPortfolioData() {
  const data = getPortfolioData();
  const renderData = {
    ...data,
    profilePhoto: data.profilePhotoUrl || data.profilePhoto,
    githubLabel: formatLinkLabel(data.githubUrl, "Add GitHub profile"),
    linkedinLabel: formatLinkLabel(data.linkedinUrl, "Add LinkedIn profile")
  };

  document.querySelectorAll("[data-field]").forEach((element) => {
    const field = element.dataset.field;
    const attr = element.dataset.attr;
    const value = renderData[field] || "";

    if (attr === "href") {
      element.href = value || "#";
      setLinkState(element, value);
      return;
    }

    if (attr === "mailto") {
      element.href = value ? `mailto:${value}` : "#";
      setLinkState(element, value);
      return;
    }

    if (attr === "src") {
      element.src = value;
      element.closest(".avatar")?.classList.toggle("has-photo", Boolean(value));
      return;
    }

    element.textContent = value || element.textContent;
  });

  renderSkills(data.skills);
  renderProjects(data.projects);
  renderCertificates(data.certificates);
}

async function hashText(value) {
  const encodedValue = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedValue);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });
}

function downloadDeployData(data) {
  const fileContents = `window.PORTFOLIO_DATA = ${JSON.stringify(normalizeData(data), null, 2)};\n`;
  const blob = new Blob([fileContents], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "data.js";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function initPortfolioPage() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");
  const revealElements = document.querySelectorAll(".reveal");
  const backToTop = document.querySelector(".back-to-top");
  const typingText = document.querySelector("#typing-text");
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const year = document.querySelector("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  }

  if (typingText) {
    const typingWords = ["Java development.", "DSA problem solving.", "Linux workflows.", "web development."];
    let wordIndex = 0;
    let letterIndex = 0;
    let isDeleting = false;

    function typeLoop() {
      const currentWord = typingWords[wordIndex];
      typingText.textContent = currentWord.slice(0, letterIndex);

      if (!isDeleting && letterIndex < currentWord.length) {
        letterIndex += 1;
        setTimeout(typeLoop, 90);
        return;
      }

      if (isDeleting && letterIndex > 0) {
        letterIndex -= 1;
        setTimeout(typeLoop, 45);
        return;
      }

      if (!isDeleting) {
        isDeleting = true;
        setTimeout(typeLoop, 1200);
        return;
      }

      isDeleting = false;
      wordIndex = (wordIndex + 1) % typingWords.length;
      setTimeout(typeLoop, 250);
    }

    typeLoop();
  }

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", window.scrollY > 500);
    });
  }

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = String(formData.get("name")).trim();
      const email = String(formData.get("email")).trim();
      const message = String(formData.get("message")).trim();

      if (!name || !email || !message) {
        formStatus.textContent = "Please complete all fields before sending.";
        return;
      }

      formStatus.textContent = "Thanks for reaching out. This form is ready to connect to email or a backend.";
      contactForm.reset();
    });
  }

  document.querySelectorAll(".disabled-link").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });
}

function createProjectEditor(project, index) {
  const card = document.createElement("div");
  card.className = "project-editor-card";
  card.dataset.projectIndex = String(index);

  card.innerHTML = `
    <div class="project-editor-head">
      <h3>Project ${index + 1}</h3>
      <button class="btn btn-secondary remove-project" type="button">Remove</button>
    </div>
    <label>Title</label>
    <input type="text" data-project-field="title" required>
    <label>Category / Type</label>
    <input type="text" data-project-field="type" placeholder="Full-stack, AI, Web App">
    <label>Description</label>
    <textarea rows="4" data-project-field="description" placeholder="Use full sentences or separate points with new lines."></textarea>
    <label>Tech Stack</label>
    <input type="text" data-project-field="techStack" placeholder="Java, Spring Boot, MySQL">
    <label>GitHub URL</label>
    <input type="url" data-project-field="githubUrl">
    <label>Live Demo URL</label>
    <input type="url" data-project-field="liveUrl">
  `;

  card.querySelectorAll("[data-project-field]").forEach((input) => {
    input.value = project[input.dataset.projectField] || "";
  });

  card.querySelector(".remove-project").addEventListener("click", () => {
    card.remove();
    renumberProjectEditors();
  });

  return card;
}

function createCertificateEditor(certificate, index) {
  const card = document.createElement("div");
  card.className = "cert-editor-card";
  card.dataset.certificateIndex = String(index);

  card.innerHTML = `
    <div class="cert-editor-head">
      <h3>Certificate ${index + 1}</h3>
      <button class="btn btn-secondary remove-certificate" type="button">Remove</button>
    </div>
    <label>Title</label>
    <input type="text" data-certificate-field="title" required>
    <label>Issuer / Date</label>
    <input type="text" data-certificate-field="issuer" placeholder="Oracle / 2026">
    <label>Certificate Link</label>
    <input type="url" data-certificate-field="url">
  `;

  card.querySelectorAll("[data-certificate-field]").forEach((input) => {
    input.value = certificate[input.dataset.certificateField] || "";
  });

  card.querySelector(".remove-certificate").addEventListener("click", () => {
    card.remove();
    renumberCertificateEditors();
  });

  return card;
}

function createSkillEditor(skillCategory, index) {
  const card = document.createElement("div");
  card.className = "skill-editor-card";
  card.dataset.skillIndex = String(index);

  card.innerHTML = `
    <div class="skill-editor-head">
      <h3>Skill Category ${index + 1}</h3>
      <button class="btn btn-secondary remove-skill-category" type="button">Remove</button>
    </div>
    <label>Category Name</label>
    <input type="text" data-skill-field="category" required>
    <label>Skills</label>
    <textarea rows="3" data-skill-field="items" placeholder="Java, Python, Git"></textarea>
  `;

  card.querySelectorAll("[data-skill-field]").forEach((input) => {
    input.value = skillCategory[input.dataset.skillField] || "";
  });

  card.querySelector(".remove-skill-category").addEventListener("click", () => {
    card.remove();
    renumberSkillEditors();
  });

  return card;
}

function renumberProjectEditors() {
  document.querySelectorAll(".project-editor-card").forEach((card, index) => {
    card.dataset.projectIndex = String(index);
    card.querySelector("h3").textContent = `Project ${index + 1}`;
  });
}

function renumberSkillEditors() {
  document.querySelectorAll(".skill-editor-card").forEach((card, index) => {
    card.dataset.skillIndex = String(index);
    card.querySelector("h3").textContent = `Skill Category ${index + 1}`;
  });
}

function renumberCertificateEditors() {
  document.querySelectorAll(".cert-editor-card").forEach((card, index) => {
    card.dataset.certificateIndex = String(index);
    card.querySelector("h3").textContent = `Certificate ${index + 1}`;
  });
}

function renderSkillEditors(skills) {
  const skillEditorList = document.querySelector("#skill-editor-list");

  if (!skillEditorList) {
    return;
  }

  skillEditorList.replaceChildren();
  skills.forEach((skillCategory, index) => {
    skillEditorList.appendChild(createSkillEditor(skillCategory, index));
  });
}

function renderProjectEditors(projects) {
  const projectEditorList = document.querySelector("#project-editor-list");

  if (!projectEditorList) {
    return;
  }

  projectEditorList.replaceChildren();
  projects.forEach((project, index) => {
    projectEditorList.appendChild(createProjectEditor(project, index));
  });
}

function renderCertificateEditors(certificates) {
  const certEditorList = document.querySelector("#cert-editor-list");

  if (!certEditorList) {
    return;
  }

  certEditorList.replaceChildren();
  certificates.forEach((certificate, index) => {
    certEditorList.appendChild(createCertificateEditor(certificate, index));
  });
}

function collectSkillEditors() {
  return Array.from(document.querySelectorAll(".skill-editor-card"))
    .map((card) => {
      const skillCategory = {};

      card.querySelectorAll("[data-skill-field]").forEach((input) => {
        skillCategory[input.dataset.skillField] = input.value.trim();
      });

      return normalizeSkillCategory(skillCategory);
    })
    .filter((skillCategory) => skillCategory.category !== "New Skill Category" || skillCategory.items);
}

function collectProjectEditors() {
  return Array.from(document.querySelectorAll(".project-editor-card"))
    .map((card) => {
      const project = {};

      card.querySelectorAll("[data-project-field]").forEach((input) => {
        project[input.dataset.projectField] = input.value.trim();
      });

      return normalizeProject(project);
    })
    .filter((project) => project.title !== "New Project" || project.description || project.techStack || project.githubUrl || project.liveUrl);
}

function collectCertificateEditors() {
  return Array.from(document.querySelectorAll(".cert-editor-card"))
    .map((card) => {
      const certificate = {};

      card.querySelectorAll("[data-certificate-field]").forEach((input) => {
        certificate[input.dataset.certificateField] = input.value.trim();
      });

      return normalizeCertificate(certificate);
    })
    .filter((certificate) => certificate.title !== "New Certificate" || certificate.issuer || certificate.url);
}

function updatePhotoPreview(src) {
  const photoPreview = document.querySelector("#photo-preview");
  const previewImage = photoPreview?.querySelector("img");

  if (!photoPreview || !previewImage) {
    return;
  }

  previewImage.src = src || "";
  photoPreview.classList.toggle("has-photo", Boolean(src));
}

function populateEditorForm(form) {
  const data = getPortfolioData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      return;
    }

    const input = form.elements.namedItem(key);

    if (input) {
      input.value = value;
    }
  });

  renderSkillEditors(data.skills);
  renderProjectEditors(data.projects);
  renderCertificateEditors(data.certificates);
  updatePhotoPreview(data.profilePhotoUrl || data.profilePhoto);
}

function showEditor() {
  const login = document.querySelector("#admin-login");
  const editor = document.querySelector("#admin-editor");
  const form = document.querySelector("#editor-form");

  login.classList.add("hidden");
  editor.classList.remove("hidden");
  populateEditorForm(form);
}

function initAdminPage() {
  const loginForm = document.querySelector("#login-form");
  const loginStatus = document.querySelector("#login-status");
  const editorForm = document.querySelector("#editor-form");
  const editorStatus = document.querySelector("#editor-status");
  const resetButton = document.querySelector("#reset-data");
  const lockButton = document.querySelector("#lock-editor");
  const exportButton = document.querySelector("#export-data");
  const addSkillCategoryButton = document.querySelector("#add-skill-category");
  const addProjectButton = document.querySelector("#add-project");
  const addCertificateButton = document.querySelector("#add-certificate");
  const photoFileInput = document.querySelector("#profilePhotoFile");
  const photoUrlInput = document.querySelector("#profilePhotoUrl");
  const removePhotoButton = document.querySelector("#remove-photo");

  if (!loginForm || !editorForm) {
    return;
  }

  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "true") {
    showEditor();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = String(loginForm.elements.namedItem("admin-password").value);
    const passwordHash = await hashText(password);

    if (passwordHash !== ADMIN_PASSWORD_HASH) {
      loginStatus.textContent = "Incorrect password. Try again.";
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    loginForm.reset();
    showEditor();
  });

  addProjectButton.addEventListener("click", () => {
    const projectEditorList = document.querySelector("#project-editor-list");
    const newProject = normalizeProject({
      title: "New Project",
      type: "Software Project",
      description: "",
      techStack: "",
      githubUrl: "",
      liveUrl: ""
    });

    projectEditorList.appendChild(createProjectEditor(newProject, projectEditorList.children.length));
  });

  addSkillCategoryButton.addEventListener("click", () => {
    const skillEditorList = document.querySelector("#skill-editor-list");
    const newSkillCategory = normalizeSkillCategory({
      category: "New Skill Category",
      items: ""
    });

    skillEditorList.appendChild(createSkillEditor(newSkillCategory, skillEditorList.children.length));
  });

  addCertificateButton.addEventListener("click", () => {
    const certEditorList = document.querySelector("#cert-editor-list");
    const newCertificate = normalizeCertificate({
      title: "New Certificate",
      issuer: "",
      url: ""
    });

    certEditorList.appendChild(createCertificateEditor(newCertificate, certEditorList.children.length));
  });

  photoUrlInput.addEventListener("input", () => {
    updatePhotoPreview(photoUrlInput.value.trim() || getPortfolioData().profilePhoto);
  });

  photoFileInput.addEventListener("change", async () => {
    const selectedPhoto = photoFileInput.files[0];

    if (selectedPhoto) {
      updatePhotoPreview(await readImageFile(selectedPhoto));
    }
  });

  removePhotoButton.addEventListener("click", () => {
    const data = getPortfolioData();
    data.profilePhoto = "";
    data.profilePhotoUrl = "";
    savePortfolioData(data);
    photoUrlInput.value = "";
    photoFileInput.value = "";
    updatePhotoPreview("");
    editorStatus.textContent = "Profile photo removed.";
  });

  exportButton.addEventListener("click", () => {
    downloadDeployData(getPortfolioData());
    editorStatus.textContent = "Downloaded data.js. Replace the repo file with it and push to GitHub for Render.";
  });

  editorForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentData = getPortfolioData();
    const formData = new FormData(editorForm);
    const updatedData = {};

    Object.keys(defaultPortfolioData).forEach((key) => {
      if (key === "projects" || key === "certificates" || key === "skills" || key === "profilePhoto") {
        return;
      }

      updatedData[key] = String(formData.get(key) || "").trim();
    });

    const selectedPhoto = photoFileInput.files[0];
    updatedData.profilePhoto = selectedPhoto ? await readImageFile(selectedPhoto) : currentData.profilePhoto;
    updatedData.skills = collectSkillEditors();
    updatedData.projects = collectProjectEditors();
    updatedData.certificates = collectCertificateEditors();

    savePortfolioData(updatedData);
    photoFileInput.value = "";
    updatePhotoPreview(updatedData.profilePhotoUrl || updatedData.profilePhoto);
    editorStatus.textContent = "Saved. Open or refresh the portfolio page to see your updates.";
  });

  resetButton.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    populateEditorForm(editorForm);
    editorStatus.textContent = "Portfolio details reset to defaults.";
  });

  lockButton.addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.reload();
  });
}

renderPortfolioData();
initPortfolioPage();
initAdminPage();
