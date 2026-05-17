const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const quickLinks = document.querySelector("#quickLinks");
const articleGrid = document.querySelector("#articleGrid");
const pathGrid = document.querySelector("#pathGrid");
const mastersActions = document.querySelector("#mastersActions");
const usthadGrid = document.querySelector("#usthadGrid");
const filterButtons = document.querySelectorAll(".filter-button");

const settingsKey = "sulthaniya-site-settings";
const fallbackImage = "https://images.unsplash.com/photo-1528659432556-51419ce0c673?auto=format&fit=crop&w=900&q=80";

async function getJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

async function applySettings() {
  const fileSettings = await getJson("data/site.json", {});
  let localSettings = {};

  try {
    localSettings = JSON.parse(localStorage.getItem(settingsKey) || "{}");
  } catch {
    localSettings = {};
  }

  const settings = { ...localSettings, ...fileSettings };

  Object.entries(settings).forEach(([key, value]) => {
    document.querySelectorAll(`[data-edit="${key}"]`).forEach((item) => {
      item.textContent = value;
    });
  });

  applyBrand(settings);
  applyHeroImages(settings);
}

function applyBrand(settings) {
  const logoImage = document.querySelector("[data-logo-image]");
  const logoInitials = document.querySelector("[data-logo-initials]");

  if (logoInitials) {
    logoInitials.textContent = settings.logoInitials || "SF";
  }

  if (!logoImage) return;

  logoImage.onerror = () => {
    logoImage.removeAttribute("src");
    logoImage.hidden = true;
    logoInitials.hidden = false;
  };

  if (settings.logoImage) {
    logoImage.src = settings.logoImage;
    logoImage.alt = "";
    logoImage.hidden = false;
    logoInitials.hidden = true;
    return;
  }

  logoImage.removeAttribute("src");
  logoImage.hidden = true;
  logoInitials.hidden = false;
}

function cssImageUrl(path) {
  return `url("${String(path).replace(/"/g, "%22")}")`;
}

function applyHeroImages(settings) {
  const root = document.documentElement;

  if (settings.heroDesktopImage) {
    root.style.setProperty("--hero-desktop-image", cssImageUrl(settings.heroDesktopImage));
  }

  if (settings.heroMobileImage) {
    root.style.setProperty("--hero-mobile-image", cssImageUrl(settings.heroMobileImage));
  }
}

function createNavLink(tab) {
  const link = document.createElement("a");
  link.href = normalizeUrl(tab.url || "#home");
  link.textContent = tab.label || "Tab";

  if (tab.style === "button") {
    link.className = "nav-cta";
  }

  if (tab.newTab) {
    link.target = "_blank";
    link.rel = "noreferrer";
  }

  return link;
}

function normalizeUrl(url) {
  const isSubPage = !location.pathname.endsWith("/") && !location.pathname.endsWith("index.html");

  if (isSubPage && url.startsWith("#")) {
    return `index.html${url}`;
  }

  return url;
}

function applyLinkTarget(link, item) {
  if (item.newTab) {
    link.target = "_blank";
    link.rel = "noreferrer";
  } else {
    link.removeAttribute("target");
    link.removeAttribute("rel");
  }
}

function createQuickLink(item) {
  const link = document.createElement("a");
  const number = document.createElement("span");
  const title = document.createElement("strong");
  const subtitle = document.createElement("small");

  link.href = normalizeUrl(item.url || "#home");
  applyLinkTarget(link, item);

  number.textContent = item.number || "";
  title.textContent = item.title || "Link";
  subtitle.textContent = item.subtitle || "";

  link.append(number, title, subtitle);
  return link;
}

async function renderQuickLinks() {
  const data = await getJson("data/quick-links.json", { links: [] });
  const links = data.links || [];

  if (!quickLinks || !links.length) return;

  quickLinks.innerHTML = "";
  links.forEach((item, index) => {
    quickLinks.appendChild(createQuickLink({ number: String(index + 1).padStart(2, "0"), ...item }));
  });
}

function createDropdownItem(tab) {
  const wrapper = document.createElement("div");
  const button = document.createElement("button");
  const menu = document.createElement("div");
  const menuId = `dropdown-${tab.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  wrapper.className = "nav-dropdown";
  button.className = tab.style === "button" ? "nav-cta nav-dropdown-toggle" : "nav-dropdown-toggle";
  button.type = "button";
  button.textContent = tab.label || "Menu";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", menuId);

  menu.className = "nav-dropdown-menu";
  menu.id = menuId;

  tab.items.forEach((item) => {
    menu.appendChild(createNavLink(item));
  });

  button.addEventListener("click", () => {
    const isOpen = wrapper.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  wrapper.append(button, menu);
  return wrapper;
}

function createNavItem(tab) {
  if (Array.isArray(tab.items) && tab.items.length) {
    return createDropdownItem(tab);
  }

  return createNavLink(tab);
}

async function renderNavigation() {
  const data = await getJson("data/navigation.json", { tabs: [] });
  const tabs = data.tabs || [];

  if (!tabs.length) return;

  mainNav.innerHTML = "";
  tabs.forEach((tab) => {
    mainNav.appendChild(createNavItem(tab));
  });
}

function setMenu(open) {
  mainNav.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
}

function createArticleCard(post, isFeatured = false) {
  const article = document.createElement("article");
  article.className = isFeatured ? "article-card featured" : "article-card";
  article.dataset.category = post.category;
  article.innerHTML = `
    <img src="${post.image || fallbackImage}" alt="New article visual">
    <div>
      <span class="pill">${post.categoryLabel}</span>
      <h3>${post.title}</h3>
      <p>${post.summary}</p>
      ${post.link ? `<a href="${post.link}" target="_blank" rel="noreferrer">Open original</a>` : ""}
    </div>
  `;
  return article;
}

function createPathLink(item) {
  const link = document.createElement("a");
  link.href = normalizeUrl(item.url || "#home");
  link.textContent = item.title || "Path";
  applyLinkTarget(link, item);
  return link;
}

async function renderLearningPaths() {
  const data = await getJson("data/learning-paths.json", { paths: [] });
  const paths = data.paths || [];
  const kicker = document.querySelector("[data-learning-kicker]");
  const title = document.querySelector("[data-learning-title]");
  const sectionLink = document.querySelector("[data-learning-link]");

  if (kicker && data.sectionKicker) {
    kicker.textContent = data.sectionKicker;
  }

  if (title && data.sectionTitle) {
    title.textContent = data.sectionTitle;
  }

  if (sectionLink) {
    sectionLink.textContent = data.sectionLinkLabel || "Visit current site";
    sectionLink.href = normalizeUrl(data.sectionLinkUrl || "#home");
    applyLinkTarget(sectionLink, { newTab: data.sectionLinkNewTab });
  }

  if (!pathGrid || !paths.length) return;

  pathGrid.innerHTML = "";
  paths.forEach((item) => {
    pathGrid.appendChild(createPathLink(item));
  });
}

function createMastersAction(label, url, newTab) {
  const link = document.createElement("a");
  link.href = normalizeUrl(url || "#home");
  link.textContent = label || "Button";
  applyLinkTarget(link, { newTab });
  return link;
}

async function renderMastersActions() {
  const data = await getJson("data/masters-actions.json", {});

  if (!mastersActions) return;

  mastersActions.innerHTML = "";
  mastersActions.append(
    createMastersAction(data.buttonOneLabel, data.buttonOneUrl, data.buttonOneNewTab),
    createMastersAction(data.buttonTwoLabel, data.buttonTwoUrl, data.buttonTwoNewTab),
    createMastersAction(data.buttonThreeLabel, data.buttonThreeUrl, data.buttonThreeNewTab)
  );
}

async function renderPosts() {
  const data = await getJson("data/posts.json", { posts: [] });
  const posts = data.posts || [];

  if (!articleGrid || !posts.length) return;

  articleGrid.innerHTML = "";
  posts.forEach((post, index) => {
    articleGrid.appendChild(createArticleCard(post, index === 0));
  });
}

function createUsthadCard(post, isFeatured = false) {
  const article = document.createElement("article");
  const image = document.createElement("img");
  const body = document.createElement("div");
  const pill = document.createElement("span");
  const title = document.createElement("h2");
  const summary = document.createElement("p");

  article.className = isFeatured ? "post-card featured-post" : "post-card";
  image.src = post.image || fallbackImage;
  image.alt = "";
  pill.className = "pill";
  pill.textContent = post.categoryLabel || "Post";
  title.textContent = post.title || "Untitled";
  summary.textContent = post.summary || "";

  body.append(pill, title, summary);

  if (post.link) {
    const link = document.createElement("a");
    link.href = post.link;
    link.textContent = "Open original";
    link.target = "_blank";
    link.rel = "noreferrer";
    body.appendChild(link);
  }

  article.append(image, body);
  return article;
}

async function renderUsthadPosts() {
  const data = await getJson("data/usthad-posts.json", { posts: [] });
  const posts = data.posts || [];
  const kicker = document.querySelector("[data-usthad-kicker]");
  const title = document.querySelector("[data-usthad-title]");
  const intro = document.querySelector("[data-usthad-intro]");

  if (kicker && data.pageKicker) {
    kicker.textContent = data.pageKicker;
  }

  if (title && data.pageTitle) {
    title.textContent = data.pageTitle;
  }

  if (intro && data.pageIntro) {
    intro.textContent = data.pageIntro;
  }

  if (!usthadGrid || !posts.length) return;

  usthadGrid.innerHTML = "";
  posts.forEach((post, index) => {
    usthadGrid.appendChild(createUsthadCard(post, index === 0));
  });
}

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    setMenu(!mainNav.classList.contains("open"));
  });
}

if (mainNav) {
  mainNav.addEventListener("click", (event) => {
    if (!event.target.matches("a")) return;

    setMenu(false);
    document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => {
      dropdown.classList.remove("open");
      dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
  });
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".nav-dropdown")) return;

  document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => {
    dropdown.classList.remove("open");
    dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    document.querySelectorAll(".article-card").forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.style.display = shouldShow ? "" : "none";
    });
  });
});

applySettings();
renderNavigation();
renderQuickLinks();
renderPosts();
renderLearningPaths();
renderMastersActions();
renderUsthadPosts();
