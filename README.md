# Sulthaniya Foundation Website Prototype

This is a free static website prototype inspired by modern spiritual/wellness websites, using Sulthaniya Foundation content from the current website.

## Files

- `index.html` - the website structure and content
- `styles.css` - the full modern design
- `app.js` - menu, article filters, and admin demo post form
- `server.mjs` - tiny local preview server

## How to open it

Run this command inside this folder:

```powershell
node server.mjs
```

Then open:

```text
http://127.0.0.1:5174
```

## Real admin portal

Open:

```text
http://127.0.0.1:5174/admin/
```

This is the Decap CMS admin portal. After the site is connected to GitHub and Netlify, from there you can:

- change the website name
- change the hero headline
- change the hero description
- add posts
- delete demo posts

The changes will save into the GitHub repository and Netlify will publish the updated website.

## Important note about the admin form

The real admin portal is `/admin/`. It saves content through Decap CMS after the site is connected to GitHub and Netlify.

For a real free admin portal, use:

```text
GitHub + Netlify + Decap CMS
```

That will give you:

- free hosting
- `/admin` login page
- add/edit/delete posts
- image uploads
- automatic website updates

## Next upgrade steps

1. Import all old Blogspot article content into Markdown files.
2. Add Decap CMS config.
3. Deploy to Netlify.
4. Connect a domain later when budget is available.
5. Replace demo images with original Sulthaniya-approved images.
