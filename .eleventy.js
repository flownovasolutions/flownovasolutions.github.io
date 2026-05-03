module.exports = function(eleventyConfig) {
  // Passthrough copy
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // Copy global folder from _includes
  eleventyConfig.addPassthroughCopy("_includes/global");

  // Date filter for blog posts
  eleventyConfig.addFilter("dateFormat", function(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  });

  // Date filter for sitemap
  eleventyConfig.addFilter("dateToRfc3339", (date) => {
    return new Date(date).toISOString();
  });

  // Template formats
  eleventyConfig.setTemplateFormats(["njk", "html"]);

  return {
    dir: {
      input: ".",
      output: "docs",
      includes: "_includes",
      layouts: "_includes"
    }
  };
};
