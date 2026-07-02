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

const defaultPortfolioData = {
  resumeUrl: "resume.pdf",
  email: "",
  githubUrl: "https://github.com/BharathWaj-K-R",
  linkedinUrl: "",
  profilePhoto: "",
  profilePhotoUrl: "",
  cert1Title: "Java Programming",
  cert1Meta: "Add issuer and completion date.",
  cert1Url: "",
  cert2Title: "Web Development",
  cert2Meta: "Add issuer and completion date.",
  cert2Url: "",
  cert3Title: "Data Structures and Algorithms",
  cert3Meta: "Add issuer and completion date.",
  cert3Url: "",
  leetcodeUrl: "",
  leetcodeSolved: "--",
  leetcodeRating: "--",
  projects: defaultProjects
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

function normalizeData(data = {}) {
  const mergedData = { ...defaultPortfolioData, ...data };

  if (!Array.isArray(mergedData.projects)) {
    mergedData.projects = defaultProjects;
  }

  mergedData.projects = mergedData.projects.map(normalizeProject);
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

  renderProjects(data.projects);
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

function renumberProjectEditors() {
  document.querySelectorAll(".project-editor-card").forEach((card, index) => {
    card.dataset.projectIndex = String(index);
    card.querySelector("h3").textContent = `Project ${index + 1}`;
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

  renderProjectEditors(data.projects);
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
  const addProjectButton = document.querySelector("#add-project");
  const photoFileInput = document.querySelector("#profilePhotoFile");

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

  editorForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentData = getPortfolioData();
    const formData = new FormData(editorForm);
    const updatedData = {};

    Object.keys(defaultPortfolioData).forEach((key) => {
      if (key === "projects" || key === "profilePhoto") {
        return;
      }

      updatedData[key] = String(formData.get(key) || "").trim();
    });

    const selectedPhoto = photoFileInput.files[0];
    updatedData.profilePhoto = selectedPhoto ? await readImageFile(selectedPhoto) : currentData.profilePhoto;
    updatedData.projects = collectProjectEditors();

    savePortfolioData(updatedData);
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
