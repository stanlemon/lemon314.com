export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/styles.css");
  // Preserve original .html filenames instead of clean URLs
  eleventyConfig.addGlobalData("permalink", "{{ page.filePathStem }}.html");
  return {
    dir: { input: "src", output: "_site", layouts: "_layouts" }
  };
};
