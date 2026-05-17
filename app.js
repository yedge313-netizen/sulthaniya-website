const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const articleGrid = document.querySelector("#articleGrid");
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

  const settings = { ...fileSettings, ...localSettings };

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

  if (settings.logoImage) {
    logoImage.src = settings.logoImage;
    logoImage.alt = settings.logoAlt || settings.siteTitle || "Sulthaniya logo";
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
  link.href = tab.url || "#home";
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

async function renderPosts() {
  const data = await getJson("data/posts.json", { posts: [] });
  const posts = data.posts || [];

  if (!posts.length) return;

  articleGrid.innerHTML = "";
  posts.forEach((post, index) => {
    articleGrid.appendChild(createArticleCard(post, index === 0));
  });
}

navToggle.addEventListener("click", () => {
  setMenu(!mainNav.classList.contains("open"));
});

mainNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    setMenu(false);
    document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => {
      dropdown.classList.remove("open");
      dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
  }
});

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
renderPosts();
