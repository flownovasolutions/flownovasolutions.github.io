module.exports = function(eleventyConfig) {

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // Copy global folder from _includes
  eleventyConfig.addPassthroughCopy("_includes/global");

  // Template formats
  eleventyConfig.setTemplateFormats(["njk", "html"]);

  // Use Nunjucks for HTML
  eleventyConfig.setLibrary("html", require("nunjucks"));

  return {
    dir: {
      input: ".",
      output: "docs",
      includes: "_includes",
      layouts: "_includes"
    }
  };
};

