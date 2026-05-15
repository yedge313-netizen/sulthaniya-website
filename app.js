const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const articleGrid = document.querySelector("#articleGrid");
const filterButtons = document.querySelectorAll(".filter-button");
const postForm = document.querySelector("#postForm");

const settingsKey = "sulthaniya-site-settings";
const demoPosts = JSON.parse(localStorage.getItem("sulthaniya-demo-posts") || "[]");
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
  const localSettings = JSON.parse(localStorage.getItem(settingsKey) || "{}");
  const settings = { ...fileSettings, ...localSettings };
  Object.entries(settings).forEach(([key, value]) => {
    document.querySelectorAll(`[data-edit="${key}"]`).forEach((item) => {
      item.textContent = value;
    });
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
  const posts = [...demoPosts, ...(data.posts || [])];

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
  }
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

postForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const category = document.querySelector("#postCategory").value;
  const categoryLabel = document.querySelector("#postCategory").selectedOptions[0].textContent;
  const post = {
    title: document.querySelector("#postTitle").value.trim(),
    category,
    categoryLabel,
    image: fallbackImage,
    summary: document.querySelector("#postSummary").value.trim(),
  };

  demoPosts.unshift(post);
  localStorage.setItem("sulthaniya-demo-posts", JSON.stringify(demoPosts));
  articleGrid.insertBefore(createArticleCard(post, true), articleGrid.firstChild);
  postForm.reset();
  document.querySelector('[data-filter="all"]').click();
});

applySettings();
renderPosts();
