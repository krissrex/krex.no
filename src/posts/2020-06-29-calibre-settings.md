---
title: Calibre settings
description: CSS tweaks to make Calibre Ebook Reader better
date: 2020-06-29 23:14:00
---

For reading e-books, I manage the files with 
[Calibre](http://calibre-ebook.com/).
Calibre can open epub books with its built in reader.
However, I don't like the default settings.

Here are my settings:

* Font: [EB Garamond Medium](https://fonts.google.com/specimen/EB+Garamond?sidebar.open&selection.family=EB+Garamond:wght@500).
* Standard font: Serif.
* Font size: 22px.
* Color scheme - Background: #f0f0e8.
* Color scheme - Foreground: #333333.

An important part is also the custom styles CSS:
```css
body {
  text-align:justify !important;
  line-spacing: 1.4 !important;
  line-height: 1.4 !important;
  counter-reset: section;      
}

p {
  color: #333;
  line-height: 1.25em;
  padding: 0 0 1em 0;
  text-align: left;
  -webkit-font-smoothing: antialiased !important;
  text-rendering: optimizelegibility !important;
  letter-spacing: .03em;
}
p:before {
  counter-increment: section;        
  content: "" counter(section) ":  "; 
  position: relative;
  top: 0;
  left: 0;
  text-align: right;
  opacity: 0.2;
}
p:nth-child(2n) {
  background-color: rgba(0,0,0, 0.03);
}

h1, h2, h3, h4, h5, h6
{
  color:black !important;
  text-align:center !important;
  font-style:italic !important;
  font-weight:bold !important;
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 5px;
  letter-spacing: .05em
}
```

## The result
![What the settings look like](/assets/images/posts/calibre-text-preview.png){width=450}
