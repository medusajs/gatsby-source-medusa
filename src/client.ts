import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import { Reporter } from "gatsby-cli/lib/reporter/reporter";

function medusaRequest(
  storeURL: string,
  path = "",
  payload = {}
): AxiosPromise {
  const options: AxiosRequestConfig = {
    method: "GET",
    withCredentials: true,
    url: path,
    data: payload,
  };

  const client = axios.create({ baseURL: storeURL });

  return client(options);
}

export const createClient = (
  options: MedusaPluginOptions,
  reporter: Reporter
) => {
  const { storeUrl } = options;

  /**
   *
   * @param date used fetch products updated since the specified date
   * @returns
   */
  async function products(date?: string) {
    let products: any[] = [];
    let offset = 0;
    let count = 1;
    do {
      await medusaRequest(storeUrl, `/store/products?offset=${offset}`)
        .then(({ data }) => {
          products = [...products, ...data.products];
          count = data.count;
          offset = data.products.length;
        })
        .catch((error) => {
          reporter.error(
            `"The following error status was produced while attempting to fetch products: ${error}`
          );
          return [];
        });
    } while (products.length < count);

    for (const product of products) {
      let { variants } = product;
      let completeVariants = [];

      for (const variant of variants) {
        const data = await medusaRequest(
          storeUrl,
          `/store//variants/${variant.id}`
        ).then(({ data }) => data.variant);
        completeVariants.push(data);
      }

      product.variants = completeVariants;
    }

    return products;
  }

  /**
   *
   * @param date used fetch regions updated since the specified date
   * @returns
   */
  async function regions(date?: string) {
    const regions = await medusaRequest(storeUrl, `/store/regions`)
      .then(({ data }) => {
        return data.regions;
      })
      .catch((error) => {
        console.warn(`
            "The following error status was produced while attempting to fetch regions: ${error}
      `);
        return [];
      });
    return regions;
  }

  return {
    products,
    regions,
  };
};
