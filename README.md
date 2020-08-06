# Eleventy Starter Boilerplate

<p align="center">
  <a href="https://creativedesignsguru.com/demo/Eleventy-Starter-Boilerplate/eleventy-starter-boilerplate-presentation/"><img src="https://raw.githubusercontent.com/ixartz/Eleventy-Starter-Boilerplate/master/public/assets/images/Eleventy-js-Starter-Boilerplate.png"></a>
</p>

🚀 Eleventy Starter Boilerplate is production-ready with SEO-friendly for quickly starting a blog. ⚡️ Built with [Eleventy](https://www.11ty.dev), [ESLint](https://eslint.org), [Prettier](https://prettier.io), [Webpack](https://webpack.js.org), [PostCSS](https://postcss.org), [Tailwind CSS](https://tailwindcss.com).

### Features

Production-ready in mind:

- 🔥 [11ty](https://www.11ty.dev) for Static Site Generator
- 🎨 Integrate with [Tailwind CSS](https://tailwindcss.com) (with [PurgeCSS](https://purgecss.com), remove unused CSS)
- 💅 [PostCSS](https://postcss.org) for processing [Tailwind CSS](https://tailwindcss.com)
- ⚡️ Lazy load images with [lazysizes](https://github.com/aFarkas/lazysizes)
- ✨ Compress image with [Imagemin](https://github.com/imagemin/imagemin)
- 🎈 Syntax Highlighting with [Prism.js](https://prismjs.com)
- ☕ Minify HTML & CSS with [HTMLMinifier](https://www.npmjs.com/package/html-minifier) and [cssnano](https://cssnano.co)
- ✏️ Linter with [ESLint](https://eslint.org)
- 🛠 Code Formatter with [Prettier](https://prettier.io)
- 💨 Live reload
- 📦 Module Bundler with [Webpack](https://webpack.js.org)
- 🦊 Templating with [EJS](https://ejs.co)
- 🤖 SEO metadata and [Open Graph](https://ogp.me/) tags
- ⚙️ [JSON-LD](https://developers.google.com/search/docs/guides/intro-structured-data) for richer indexing
- 🗺 Sitemap.xml
- ⚠️ 404 page
- 📖 Pagination
- ✅ Cache busting
- 💯 Maximize lighthouse score

### Philosophy

- Minimal code (HTML, CSS & JS). Add what you need
- SEO-friendly
- 🚀 Production-ready

### Requirements

- Node.js and yarn

### Getting started

Run locally in development mode with live reload:

```
yarn dev
```

Open http://localhost:8080 with your favorite browser to see your blog.

### Project structure

```
.
├── public             # Static files
│   └── assets
│       └── images     # Images not needed by Webpack
└── src
    ├── _data          # Eleventy data folder
    ├── _includes
    │   └── layouts    # HTML layout files
    ├── assets         # Assets folder that needs to be processed by Webpack
    │   ├── images
    │   │   └── posts  # Images used in your blog posts (will be compressed by Webpack)
    │   └── styles     # Your blog CSS files
    └── posts          # Your blog posts
```

### Customization

- `src/_includes/layouts`: your blog HTML layout
- `src/assets/styles/main.css`: your blog CSS file using Tailwind CSS

### Deploy to production

You can see the results locally in production mode with:

```
yarn serve
```

The generated HTML and CSS files are minified. It will also removed unused CSS from [Tailwind CSS](https://tailwindcss.com).

You can create an optimized production build with:

```
yarn build
```

Now, your blog is ready to be deployed. All generated files are located at `_site` folder, which you can deploy with any hosting service.

### Deploy to Netlify

Clone this repository on own GitHub account and deploy to Netlify:

[![Netlify Deploy button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/krissrex/krex.no)

### Contributions

Feel free to open an issue if you have question or found a bug.

### License

Licensed under the Apache 2.0 License, Copyright © 2020

See [LICENSE](LICENSE) for more information.

---

Template made with ♥ by [Ixartz](https://github.com/ixartz)
