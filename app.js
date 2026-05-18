const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const quickLinks = document.querySelector("#quickLinks");
const articleGrid = document.querySelector("#articleGrid");
const pathGrid = document.querySelector("#pathGrid");
const mastersActions = document.querySelector("#mastersActions");
const topicGrid = document.querySelector("[data-topic-grid]");
const filterButtons = document.querySelectorAll(".filter-button");

const settingsKey = "sulthaniya-site-settings";
const fallbackImage = "https://images.unsplash.com/photo-1528659432556-51419ce0c673?auto=format&fit=crop&w=900&q=80";

function normalizeAssetUrl(path) {
  if (!path) return "";

  const value = String(path).trim();

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  return encodeURI(value.replace(/^\/+/, ""));
}

function topicFromPostsFile(file) {
  const name = (file || "").split("/").pop() || "";
  if (name === "posts.json") return "articles";
  return name.replace(/-posts\.json$/, "");
}

function topicPostsPath(topic) {
  if (topic === "articles") return "data/posts.json";
  return `data/${topic}-posts.json`;
}

function topicBackUrl(topic) {
  if (topic === "articles") return "index.html#articles";
  if (topic.startsWith("learning-")) return "index.html#learning";
  return `${topic}.html`;
}

function typographyPx(value, fallback) {
  const raw = String(value ?? "").trim();
  if (!raw) return `${fallback}px`;
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`;
  return raw;
}

async function applyTypography() {
  const data = await getJson("data/typography.json", {});
  const root = document.documentElement.style;
  const entries = [
    ["--font-hero-heading", "heroMainHeadingPx", 50],
    ["--font-hero-subtext", "heroSubTextPx", 19],
    ["--font-learning-kicker", "learningKickerPx", 12],
    ["--font-learning-title", "learningTitlePx", 50],
    ["--font-path-card", "pathCardTextPx", 18],
    ["--font-intro-kicker", "introKickerPx", 12],
    ["--font-intro-heading", "introHeadingPx", 56],
    ["--font-intro-body", "introBodyPx", 18],
    ["--font-quote-text", "quoteTextPx", 21],
    ["--font-quote-source", "quoteSourcePx", 12],
    ["--font-masters-kicker", "mastersKickerPx", 12],
    ["--font-masters-title", "mastersTitlePx", 56],
    ["--font-masters-body", "mastersBodyPx", 18],
    ["--font-stat-number", "statNumberPx", 34],
    ["--font-stat-label", "statLabelPx", 14],
  ];

  entries.forEach(([cssVar, key, fallback]) => {
    if (data[key] != null && data[key] !== "") {
      root.setProperty(cssVar, typographyPx(data[key], fallback));
    }
  });
}

async function renderAboutSection() {
  const data = await getJson("data/about-section.json", {});
  const kicker = document.querySelector("[data-about-kicker]");
  const heading = document.querySelector("[data-about-heading]");
  const paragraphs = document.querySelector("[data-about-paragraphs]");
  const quote = document.querySelector("[data-about-quote]");
  const quoteSource = document.querySelector("[data-about-quote-source]");

  if (kicker && data.sectionKicker) kicker.textContent = data.sectionKicker;
  if (heading && data.heading) heading.textContent = data.heading;

  if (paragraphs) {
    paragraphs.innerHTML = "";
    (data.paragraphs || []).forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      paragraphs.appendChild(paragraph);
    });
  }

  if (quote && data.quoteText) quote.textContent = data.quoteText;
  if (quoteSource && data.quoteSource) quoteSource.textContent = data.quoteSource;
}

function topicBackLabel(topic, topicData = {}) {
  if (topic === "articles") return "Articles";
  return topicData.pageKicker || topic;
}

function buildPostDetailUrl(topic, slug) {
  if (!topic || !slug) return "";

  const params = new URLSearchParams({ topic, slug });
  return `post.html?${params.toString()}`;
}

function normalizeBody(body) {
  if (!Array.isArray(body)) return [];

  return body
    .map((item) => {
      if (typeof item === "string") return item;
      return item.paragraph || item.text || "";
    })
    .filter(Boolean);
}

function getReadMoreSettings(data = {}) {
  return {
    readMoreDisabled: data.readMoreDisabled === true,
  };
}

function isReadMoreEnabled(post) {
  if (post.readMoreEnabled === true) return true;
  if (post.readMoreEnabled === false) return false;
  return post.readMore?.enabled === true;
}

function hasReadMorePage(post, settings = {}) {
  if (settings.readMoreDisabled) return false;
  if (!post?.slug) return false;
  if (!isReadMoreEnabled(post)) return false;
  if (!post.readMore) return false;

  return Boolean(
    post.readMore.heading ||
      post.readMore.quote ||
      normalizeBody(post.readMore.body).length
  );
}

function appendReadMoreLink(container, post, topic, settings = {}) {
  const link = document.createElement("a");
  link.className = "read-more-link";
  link.textContent = "Read More";

  const detailUrl = hasReadMorePage(post, settings) ? buildPostDetailUrl(topic, post.slug) : "";

  if (detailUrl) {
    link.href = detailUrl;
    container.appendChild(link);
    return;
  }

  link.href = "#";
  link.classList.add("read-more-link--soon");
  link.setAttribute("aria-disabled", "true");
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });

  container.appendChild(link);
}

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
    logoImage.src = normalizeAssetUrl(settings.logoImage);
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
  return `url("${normalizeAssetUrl(path).replace(/"/g, "%22")}")`;
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

  if (!mainNav || !tabs.length) return;

  mainNav.innerHTML = "";
  tabs.forEach((tab) => {
    mainNav.appendChild(createNavItem(tab));
  });
  await renderSocialLinks();
}

function socialIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const paths = {
    instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5.5-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z",
    facebook: "M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1Z",
    youtube: "M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"
  };

  path.setAttribute("d", paths[name]);
  svg.appendChild(path);
  return svg;
}

function createSocialLink(label, url, icon) {
  const link = document.createElement("a");
  link.className = "social-link";
  link.href = url || "#home";
  link.target = "_blank";
  link.rel = "noreferrer";
  link.setAttribute("aria-label", label);
  link.appendChild(socialIcon(icon));
  return link;
}

async function renderSocialLinks() {
  const data = await getJson("data/social-links.json", {});
  const group = document.createElement("div");

  if (!mainNav || mainNav.querySelector(".social-links")) return;

  const contact = mainNav.querySelector(".nav-cta");

  group.className = "social-links";
  group.append(
    createSocialLink("Instagram", data.instagramUrl, "instagram"),
    createSocialLink("Facebook", data.facebookUrl, "facebook"),
    createSocialLink("YouTube", data.youtubeUrl, "youtube")
  );

  if (contact) {
    mainNav.insertBefore(group, contact);
    return;
  }

  mainNav.appendChild(group);
}

function setMenu(open) {
  mainNav.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
}

function createArticleCard(post, isFeatured = false, settings = {}) {
  const article = document.createElement("article");
  article.className = isFeatured ? "article-card featured" : "article-card";
  article.dataset.category = post.category;
  const image = document.createElement("img");
  const body = document.createElement("div");
  const pill = document.createElement("span");
  const title = document.createElement("h3");
  const summary = document.createElement("p");

  image.src = normalizeAssetUrl(post.image) || fallbackImage;
  image.alt = post.title || "";
  pill.className = "pill";
  pill.textContent = post.categoryLabel || "Post";
  title.textContent = post.title || "Untitled";
  summary.textContent = post.summary || "";

  body.append(pill, title, summary);
  appendReadMoreLink(body, post, "articles", settings);

  article.append(image, body);
  return article;
}

function createPathLink(item) {
  const link = document.createElement("a");
  if (item.slug) {
    link.href = normalizeUrl(`learning.html?topic=${encodeURIComponent(item.slug)}`);
  } else {
    link.href = normalizeUrl(item.url || "#learning");
    applyLinkTarget(link, item);
  }
  link.textContent = item.title || "Path";
  return link;
}

async function renderLearningPaths() {
  const data = await getJson("data/learning-paths.json", { paths: [] });
  const paths = data.paths || [];
  const kicker = document.querySelector("[data-learning-kicker]");
  const title = document.querySelector("[data-learning-title]");

  if (kicker && data.sectionKicker) {
    kicker.textContent = data.sectionKicker;
  }

  if (title && data.sectionTitle) {
    title.textContent = data.sectionTitle;
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

function applyMastersSectionImage(settings) {
  const mastersImage = document.querySelector(".masters-image");

  if (!mastersImage) return;

  if (settings.sectionImage) {
    mastersImage.style.backgroundImage = cssImageUrl(settings.sectionImage);
    return;
  }

  mastersImage.style.removeProperty("background-image");
}

async function renderMastersActions() {
  const data = await getJson("data/masters-actions.json", {});

  applyMastersSectionImage(data);

  const kicker = document.querySelector("[data-masters-kicker]");
  const title = document.querySelector("[data-masters-title]");
  const body = document.querySelector("[data-masters-body]");
  const stats = document.querySelector("[data-masters-stats]");

  if (kicker && data.sectionKicker) kicker.textContent = data.sectionKicker;
  if (title && data.sectionTitle) title.textContent = data.sectionTitle;
  if (body && data.sectionBody) body.textContent = data.sectionBody;

  if (stats) {
    stats.innerHTML = "";
    (data.stats || []).forEach((item) => {
      const block = document.createElement("div");
      const number = document.createElement("strong");
      const label = document.createElement("span");
      number.textContent = item.number || "";
      label.textContent = item.label || "";
      block.append(number, label);
      stats.appendChild(block);
    });
  }

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
  const readMoreSettings = getReadMoreSettings(data);

  if (!articleGrid || !posts.length) return;

  articleGrid.innerHTML = "";
  posts.forEach((post, index) => {
    articleGrid.appendChild(createArticleCard(post, index === 0, readMoreSettings));
  });
}

function createUsthadCard(post, isFeatured = false, topic = "", settings = {}) {
  const article = document.createElement("article");
  const image = document.createElement("img");
  const body = document.createElement("div");
  const pill = document.createElement("span");
  const title = document.createElement("h2");
  const summary = document.createElement("p");

  article.className = isFeatured ? "post-card featured-post" : "post-card";
  image.src = normalizeAssetUrl(post.image) || fallbackImage;
  image.alt = post.title || "";
  pill.className = "pill";
  pill.textContent = post.categoryLabel || "Post";
  title.textContent = post.title || "Untitled";
  summary.textContent = post.summary || "";

  body.append(pill, title, summary);
  appendReadMoreLink(body, post, topic, settings);

  article.append(image, body);
  return article;
}

async function renderTopicPosts() {
  if (document.body.dataset.page === "learning") {
    const slug = new URLSearchParams(window.location.search).get("topic");
    const grid = document.querySelector("[data-topic-grid]");
    if (!grid || !slug) return;
    grid.dataset.postsFile = `data/learning-${slug}-posts.json`;
  }

  if (!topicGrid) return;

  const data = await getJson(topicGrid.dataset.postsFile || "data/usthad-posts.json", { posts: [] });
  const posts = data.posts || [];
  const kicker = document.querySelector("[data-topic-kicker]");
  const title = document.querySelector("[data-topic-title]");
  const intro = document.querySelector("[data-topic-intro]");

  if (kicker && data.pageKicker) {
    kicker.textContent = data.pageKicker;
  }

  if (title && data.pageTitle) {
    title.textContent = data.pageTitle;
  }

  if (intro && data.pageIntro) {
    intro.textContent = data.pageIntro;
  }

  if (!posts.length) return;

  const topic = topicFromPostsFile(topicGrid.dataset.postsFile);
  const readMoreSettings = getReadMoreSettings(data);
  topicGrid.innerHTML = "";
  posts.forEach((post, index) => {
    topicGrid.appendChild(createUsthadCard(post, index === 0, topic, readMoreSettings));
  });
}

async function loadPostDetail(topic, slug) {
  const topicData = await getJson(topicPostsPath(topic), { posts: [] });
  const post = (topicData.posts || []).find((item) => item.slug === slug);
  const readMoreSettings = getReadMoreSettings(topicData);

  if (isReadMoreEnabled(post) && post?.readMore && hasReadMorePage(post, readMoreSettings)) {
    return {
      topic,
      topicLabel: topicBackLabel(topic, topicData),
      backUrl: topicBackUrl(topic),
      title: post.readMore.heading || post.title,
      categoryLabel: post.categoryLabel,
      image: post.readMore.image || post.image,
      quote: post.readMore.quote || "",
      quoteSource: post.readMore.quoteSource || "",
      body: normalizeBody(post.readMore.body),
    };
  }

  const legacyDetail = await getJson(`data/post-details/${slug}.json`, null);
  if (!legacyDetail) return null;

  return {
    ...legacyDetail,
    topic: legacyDetail.topic || topic,
    topicLabel: legacyDetail.topicLabel || topicBackLabel(topic, topicData),
    backUrl: legacyDetail.backUrl || topicBackUrl(topic),
  };
}

async function renderPostDetail() {
  if (document.body.dataset.page !== "post") return;

  const articleDetail = document.getElementById("articleDetail");
  const articleEmpty = document.getElementById("articleDetailEmpty");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const topic = params.get("topic") || "usthad";

  if (!slug || !articleDetail || !articleEmpty) {
    if (articleEmpty) articleEmpty.hidden = false;
    return;
  }

  const detail = await loadPostDetail(topic, slug);

  if (!detail) {
    articleEmpty.hidden = false;
    return;
  }

  document.title = `${detail.title} | Sulthaniya Foundation`;

  const kicker = document.querySelector("[data-article-kicker]");
  const title = document.querySelector("[data-article-title]");
  const image = document.querySelector("[data-article-image]");
  const back = document.querySelector("[data-article-back]");
  const quoteBlock = document.querySelector("[data-article-quote]");
  const quoteText = document.querySelector("[data-article-quote-text]");
  const quoteSource = document.querySelector("[data-article-quote-source]");
  const body = document.querySelector("[data-article-body]");

  if (kicker) kicker.textContent = detail.categoryLabel || detail.topicLabel || "";
  if (title) title.textContent = detail.title || "";
  if (image) {
    image.src = normalizeAssetUrl(detail.image) || fallbackImage;
    image.alt = detail.title || "";
  }
  if (back) {
    back.href = normalizeUrl(detail.backUrl || topicBackUrl(detail.topic || topic));
    const label = detail.topicLabel || detail.topic || "posts";
    back.textContent = detail.topic === "articles" ? `Back to ${label}` : `Back to ${label} posts`;
  }

  if (detail.quote && quoteBlock && quoteText) {
    quoteText.textContent = detail.quote;
    quoteBlock.hidden = false;

    if (detail.quoteSource && quoteSource) {
      quoteSource.textContent = detail.quoteSource;
      quoteSource.hidden = false;
    }
  }

  if (body) {
    body.innerHTML = "";
    normalizeBody(detail.body).forEach((paragraph) => {
      const paragraphNode = document.createElement("p");
      paragraphNode.textContent = paragraph;
      body.appendChild(paragraphNode);
    });
  }

  articleDetail.hidden = false;
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

async function boot() {
  await Promise.all([applySettings(), applyTypography(), renderAboutSection()]);
  renderNavigation();
  renderQuickLinks();
  await renderPosts();
  await renderLearningPaths();
  await renderMastersActions();
  await renderTopicPosts();
  await renderPostDetail();
}

boot();
