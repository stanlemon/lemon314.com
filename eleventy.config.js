import Image from "@11ty/eleventy-img";
import path from "path";

async function imageShortcode(src, alt, widths = [null], sizes = "100vw") {
  if (!Array.isArray(widths)) widths = [widths];
  // Resolve relative to the src input dir
  const inputPath = src.startsWith("/") ? `./src${src}` : `./src/${src}`;
  let metadata = await Image(inputPath, {
    widths,
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./_site/images/optimized/",
    urlPath: "/images/optimized/",
    filenameFormat: (id, src, width, format) => {
      const ext = path.extname(src);
      const name = path.basename(src, ext);
      return `${name}-${width}w.${format}`;
    },
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

export default function(eleventyConfig) {
  eleventyConfig.addAsyncShortcode("image", imageShortcode);
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/styles.css");
  // Preserve original .html filenames instead of clean URLs
  eleventyConfig.addGlobalData("permalink", "{{ page.filePathStem }}.html");
  return {
    dir: { input: "src", output: "_site", layouts: "_layouts" }
  };
};
