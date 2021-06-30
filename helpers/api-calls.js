const chalk = require("chalk");
const axios = require("axios").default;

const fetchProducts = async (baseURL) => {
  let products = [];
  let offset = 0;
  let count;
  do {
    await axios
      .get(`${baseURL}/store/products?offset=${offset}`, { json: true })
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
  const regions = axios
    .get(`${baseURL}/store/regions`, { json: true })
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

module.exports = { fetchProducts, fetchRegions };
