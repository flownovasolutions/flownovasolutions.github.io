module.exports = function(eleventyConfig) {

  // --- Passthrough Copy ---
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("global");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // --- Template Formats ---
  eleventyConfig.setTemplateFormats(["njk", "html"]);

  // --- Use Nunjucks for HTML files ---
  eleventyConfig.setLibrary("html", require("nunjucks"));

  // --- Directory Structure ---
  return {
    dir: {
      input: ".",
      output: "docs",
      includes: "_includes",
      layouts: "_includes"
    }
  };
};
