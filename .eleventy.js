module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("global");
};
module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats(["njk", "html"]);
  eleventyConfig.setLibrary("html", require("nunjucks"));
  
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("global");
};
