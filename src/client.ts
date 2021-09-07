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

  async function products() {
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

    return products;
  }

  async function regions(): Promise<any[]> {
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
