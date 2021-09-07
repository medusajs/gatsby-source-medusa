import { Reporter } from "gatsby-cli/lib/reporter/reporter";
export declare const createClient: (options: MedusaPluginOptions, reporter: Reporter) => {
    products: () => Promise<any[]>;
    regions: () => Promise<any[]>;
};
