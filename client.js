"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = void 0;
const axios_1 = __importDefault(require("axios"));
function medusaRequest(storeURL, path = "", payload = {}) {
    const options = {
        method: "GET",
        withCredentials: true,
        url: path,
        data: payload,
    };
    const client = axios_1.default.create({ baseURL: storeURL });
    return client(options);
}
const createClient = (options, reporter) => {
    const { storeUrl } = options;
    async function products() {
        let products = [];
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
                reporter.error(`"The following error status was produced while attempting to fetch products: ${error}`);
                return [];
            });
        } while (products.length < count);
        return products;
    }
    async function regions() {
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
exports.createClient = createClient;
//# sourceMappingURL=client.js.map