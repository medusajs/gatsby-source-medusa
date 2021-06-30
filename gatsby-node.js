const { processNode, fetchProducts, fetchRegions } = require("./helpers");
const chalk = require("chalk");

exports.sourceNodes = async (
  { actions, createContentDigest },
  configOptions
) => {
  const { createNode } = actions;
  delete configOptions.plugins;

  const { baseUrl, fields } = configOptions;

  const fetchNodes = async (fieldName) => {
    switch (fieldName) {
      case "regions":
        return await fetchRegions(baseUrl);
      case "products":
        return await fetchProducts(baseUrl);
      default:
        console.warn(
          `${chalk.blueBright(
            "gatsby-source-medusa:"
          )} \"${fieldName}\" is not a supported field type. Visit https://www.github.com/medusajs/gatsby-source-medusa for more information.`
        );
        break;
    }
  };

  async function fetchNodesAndCreate(array) {
    for (const field of array) {
      const nodes = await fetchNodes(field);
      if (nodes)
        nodes.forEach((n) =>
          createNode(processNode(n, field, createContentDigest))
        );
    }
  }

  await fetchNodesAndCreate(fields);
  return;
};
