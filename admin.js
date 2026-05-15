const defaults = {
  siteTitle: "Sulthaniya Foundation",
  siteTagline: "Divine love and wisdom",
  heroTitle: "മനുഷ്യാത്മാവിൻ്റെ യാഥാർത്ഥ്യം തിരിച്ചറിയുന്നതിലൂടെ ദൈവിക സത്തയെ അറിയാനുള്ള മാർഗ്ഗം.",
  heroText: "സുൽത്വാനിയ ഫൗണ്ടേഷൻ ദിവ്യ സ്നേഹത്തിൻ്റെയും ജ്ഞാനത്തിൻ്റെയും ഉത്തമ വഴിയാണ് പ്രബോധനം ചെയ്യുന്നത്.",
};

const settingsKey = "sulthaniya-site-settings";
const postsKey = "sulthaniya-demo-posts";
const fallbackImage = "https://images.unsplash.com/photo-1528659432556-51419ce0c673?auto=format&fit=crop&w=900&q=80";

const settingsForm = document.querySelector("#settingsForm");
const adminPostForm = document.querySelector("#adminPostForm");
const managerList = document.querySelector("#managerList");
const resetSite = document.querySelector("#resetSite");

function getSettings() {
  return { ...defaults, ...JSON.parse(localStorage.getItem(settingsKey) || "{}") };
}

function getPosts() {
  return JSON.parse(localStorage.getItem(postsKey) || "[]");
}

function savePosts(posts) {
  localStorage.setItem(postsKey, JSON.stringify(posts));
}

function fillSettingsForm() {
  const settings = getSettings();
  document.querySelector("#siteTitleInput").value = settings.siteTitle;
  document.querySelector("#siteTaglineInput").value = settings.siteTagline;
  document.querySelector("#heroTitleInput").value = settings.heroTitle;
  document.querySelector("#heroTextInput").value = settings.heroText;
}

function renderManager() {
  const posts = getPosts();
  managerList.innerHTML = "";

  if (!posts.length) {
    managerList.innerHTML = '<p class="empty-state">No demo posts yet. Add one using the form above.</p>';
    return;
  }

  posts.forEach((post, index) => {
    const item = document.createElement("article");
    item.className = "manager-item";
    item.innerHTML = `
      <img src="${post.image || fallbackImage}" alt="">
      <div>
        <span class="pill">${post.categoryLabel}</span>
        <h3>${post.title}</h3>
        <p>${post.summary}</p>
      </div>
      <button class="delete-post" type="button" data-index="${index}">Delete</button>
    `;
    managerList.appendChild(item);
  });
}

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const settings = {
    siteTitle: document.querySelector("#siteTitleInput").value.trim(),
    siteTagline: document.querySelector("#siteTaglineInput").value.trim(),
    heroTitle: document.querySelector("#heroTitleInput").value.trim(),
    heroText: document.querySelector("#heroTextInput").value.trim(),
  };
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  alert("Saved. Open the website and refresh.");
});

adminPostForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const categorySelect = document.querySelector("#adminPostCategory");
  const posts = getPosts();
  posts.unshift({
    title: document.querySelector("#adminPostTitle").value.trim(),
    category: categorySelect.value,
    categoryLabel: categorySelect.selectedOptions[0].textContent,
    image: document.querySelector("#adminPostImage").value.trim() || fallbackImage,
    summary: document.querySelector("#adminPostSummary").value.trim(),
  });
  savePosts(posts);
  adminPostForm.reset();
  renderManager();
});

managerList.addEventListener("click", (event) => {
  if (!event.target.matches(".delete-post")) return;
  const posts = getPosts();
  posts.splice(Number(event.target.dataset.index), 1);
  savePosts(posts);
  renderManager();
});

resetSite.addEventListener("click", () => {
  if (!confirm("Reset all demo edits saved in this browser?")) return;
  localStorage.removeItem(settingsKey);
  localStorage.removeItem(postsKey);
  fillSettingsForm();
  renderManager();
});

fillSettingsForm();
renderManager();
