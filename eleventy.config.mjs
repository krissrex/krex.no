import * as htmlmin from 'html-minifier';
import * as dateFns from 'date-fns';
import lazyImagesPlugin from 'eleventy-plugin-lazyimages';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import chalk from 'chalk';
import ejsPlugin from '@11ty/eleventy-plugin-ejs';
import markdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItAnchor from 'markdown-it-anchor';

const markdown = {
  /** Will add `target="_blank"` for links and convert http to https. */
  enhanceLinks(md) {
    // Remember old renderer, if overridden, or proxy to default renderer
    const defaultRender =
      md.renderer.rules.link_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const token = tokens[idx];
      const hrefAttributeIndex = token.attrIndex('href');
      if (hrefAttributeIndex != -1) {
        const href = token.attrs[hrefAttributeIndex][1];
        if (!href || href.startsWith('/') || href.startsWith('#')) {
          // Don't add target for internal links.
          return defaultRender(tokens, idx, options, env, self);
        }

        if (href && href.startsWith('http://')) {
          // If you really want http, this is case sensitive. Write HTTP and it should not be corrected
          const httpsHref = href.replace('http://', 'https://');
          token.attrs[hrefAttributeIndex][1] = httpsHref;
          console.log('Markdown - replaced http with https in ', href);
        } else if (href && href.toLowerCase().startsWith('http://')) {
          console.log(
            chalk.red(
              'Markdown - not replacing http with https because it is not lowercase on ' + href
            )
          );
        }

        console.log("Markdown - adding target='_blank' to ", href);
      }

      // If you are sure other plugins can't add `target` - drop check below
      const targetAttributeIndex = token.attrIndex('target');
      if (targetAttributeIndex < 0) {
        token.attrPush(['target', '_blank']);
      } else {
        token.attrs[targetAttributeIndex][1] = '_blank'; // replace value of existing attr
      }

      const relAttributeIndex = token.attrIndex('rel');
      if (relAttributeIndex < 0) {
        token.attrPush(['rel', 'noopener noreferrer']);
      } else {
        token.attrs[relAttributeIndex][1] = 'noopener noreferrer';
      }

      // pass token to default renderer.
      return defaultRender(tokens, idx, options, env, self);
    };
  },
};

export default function (eleventyConfig) {
  {
    eleventyConfig.addPlugin(ejsPlugin, {
      rmWhitespace: true,
      context: { dateFns },
    });
    eleventyConfig.addGlobalData('layout', 'layouts/base.ejs');

    const markdownLib = markdownIt({
      html: true,
    });
    markdown.enhanceLinks(markdownLib);

    // Allows style to be added with {.myClass #id attr=value attr2="some value"}
    markdownLib.use(markdownItAttrs, {
      allowedAttributes: ['id', 'class', 'width', 'height', /^data-.*$/],
    });

    markdownLib.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        class: 'header-anchor',
        symbol: '🔗',
        placement: 'before',
      }),
    });

    eleventyConfig.setLibrary('md', markdownLib);
  }

  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(lazyImagesPlugin, {
    transformImgPath: (imgPath) => `./src/${imgPath}`,
    imgSelector: 'img:not(.nolazy)',
  });

  eleventyConfig.setBrowserSyncConfig({
    files: './_site/assets/styles/main.css',
  });

  eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath.endsWith('.html')) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
      });
      return minified;
    }

    return content;
  });

  return {
    dir: { input: 'src', output: '_site', data: '_data' },
  };
}
