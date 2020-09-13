const path = require("path");
const { join } = path;
const { copySync } = require("fs-extra");
const { logTitle, logItem } = require("./logger");
const {
  NEXT_DIST_DIR,
  NETLIFY_FUNCTIONS_PATH,
  FUNCTION_TEMPLATE_PATH,
} = require("./config");
const allNextJsPages = require("./allNextJsPages");
const getNetlifyFunctionName = require("./getNetlifyFunctionName");

// Identify all pages that require server-side rendering and create a separate
// Netlify Function for every page.
const setupIsrPages = () => {
  logTitle(
    "💫 Setting up ISR pages",
    "as Netlify Functions in",
    NETLIFY_FUNCTIONS_PATH
  );

  const isrPages = allNextJsPages.filter((page) => page.isIsr());

  // Create Netlify Function
  isrPages.forEach(({ filePath }) => {
    logItem(filePath);

    // Set function name based on file path
    const functionName = getNetlifyFunctionName(filePath);
    const functionDirectory = join(NETLIFY_FUNCTIONS_PATH, functionName);

    // Copy function template
    copySync(
      FUNCTION_TEMPLATE_PATH,
      join(functionDirectory, `${functionName}.js`),
      {
        overwrite: false,
        errorOnExist: true,
      }
    );

    // Copy page
    copySync(
      join(NEXT_DIST_DIR, "serverless", filePath),
      join(functionDirectory, "nextJsPage.js"),
      {
        overwrite: false,
        errorOnExist: true,
      }
    );
  });
};

module.exports = setupIsrPages;
