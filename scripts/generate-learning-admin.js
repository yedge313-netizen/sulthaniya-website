const topics = [
  ["quran", "Quran"],
  ["hadith", "Hadith"],
  ["kalima", "Kalima Thawyib"],
  ["tasawwuf", "Tasawwuf"],
  ["padanangal", "Padanangal"],
  ["history", "History"],
  ["sufi-stories", "Sufi Stories"],
  ["videos", "Videos"],
];

const postFields = `          - { label: "Small Heading", name: "pageKicker", widget: "string", required: false }
          - { label: "Page Title", name: "pageTitle", widget: "string" }
          - { label: "Intro Text", name: "pageIntro", widget: "text", required: false }
          - { label: "Disable Read More pages", name: "readMoreDisabled", widget: "boolean", default: true }
          - label: "Posts"
            name: "posts"
            widget: "list"
            summary: "{{fields.title}}"
            fields:
              - { label: "Card Title", name: "title", widget: "string" }
              - { label: "Category Label", name: "categoryLabel", widget: "string", required: false }
              - { label: "Card Image - first post 900 x 1200 px; other posts 1200 x 800 px", name: "image", widget: "image", required: false, hint: "Use this exact ratio for best fit. First/featured post: 900 x 1200 px portrait. Other posts: 1200 x 800 px landscape. Images with different ratios will be cropped to keep cards level." }
              - { label: "Card Summary", name: "summary", widget: "text" }
              - { label: "Auto Page URL Slug", name: "slug", widget: "hidden", required: false }
              - label: "Enable Read More Page"
                name: "readMoreEnabled"
                widget: "boolean"
                default: false
                required: false
                condition:
                  field: readMoreDisabled
                  value: false
              - label: "Read More Page"
                name: "readMore"
                widget: "object"
                collapsed: true
                summary: "{{fields.heading}}"
                required: false
                condition:
                  - field: readMoreDisabled
                    value: false
                  - field: readMoreEnabled
                    value: true
                fields:
                  - { label: "Heading", name: "heading", widget: "string", required: false }
                  - { label: "Heading Font Size (px)", name: "headingPx", widget: "string", required: false, hint: "Example: 58" }
                  - { label: "Quote Under Photo", name: "quote", widget: "text", required: false }
                  - { label: "Quote Source", name: "quoteSource", widget: "string", required: false }
                  - label: "Content Paragraphs"
                    name: "body"
                    widget: "list"
                    summary: "{{fields.paragraph}}"
                    required: false
                    field:
                      label: Paragraph
                      name: paragraph
                      widget: text`;

const chunks = topics.map(([slug, label]) => {
  const name = slug.replace(/-/g, "_");
  return `      - name: "learning_${name}_posts"
        label: "Learning: ${label} Posts"
        file: "data/learning-${slug}-posts.json"
        format: "json"
        fields:
${postFields}`;
});

const fs = require("fs");
const path = require("path");
const output = chunks.join("\n") + "\n";
const target = path.join(__dirname, "..", "admin", "_learning-collections-snippet.yml");
fs.writeFileSync(target, output, "utf8");
console.log(`Wrote ${target}`);
