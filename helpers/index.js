const axios = require("axios").default;

const processNode = (node, fieldName, createContentDigest) => {
  const nodeId = node.id;
  const nodeContent = JSON.stringify(node);
  const nodeContentDigest = createContentDigest(nodeContent);

  const nodeData = Object.assign({}, node, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Medusa${capitalize(fieldName)}`,
      content: nodeContent,
      contentDigest: nodeContentDigest,
    },
  });

  return nodeData;
};

//API Calls
const medusaRequest = (storeURL, method, path = "", payload = {}) => {
  const options = {
    method,
    withCredentials: true,
    url: path,
    data: payload,
    json: true,
  };

  const client = axios.create({
    baseURL: storeURL,
  });

  return client(options);
};

const fetchProducts = async (baseURL) => {
  let products = [];
  let offset = 0;
  let count;
  do {
    await medusaRequest(baseURL, "GET", `/store/products?offset=${offset}`)
      .then(({ data }) => {
        products = [...products, ...data.products];
        count = data.count;
        offset = data.products.length;
      })
      .catch((error) => {
        console.warn(`
              ${chalk.yellow(
                "The following error status was produced while attempting to fetch products:"
              )} ${error}
          `);
        return [];
      });
  } while (products.length < count);

  return products;
};

const fetchRegions = async (baseURL) => {
  const regions = await medusaRequest(baseURL, "GET", `/store/regions`)
    .then(({ data }) => {
      return data.regions;
    })
    .catch((error) => {
      console.warn(`
          ${chalk.yellow(
            "The following error status was produced while attempting to fetch regions:"
          )} ${error}
      `);
      return [];
    });
  return regions;
};

module.exports = { processNode, fetchProducts, fetchRegions };

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}
