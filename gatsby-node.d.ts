import { PluginOptionsSchemaArgs, SourceNodesArgs } from "gatsby";
export declare function pluginOptionsSchema({ Joi }: PluginOptionsSchemaArgs): import("gatsby-plugin-utils").ObjectSchema<any>;
export declare function sourceNodes(gatsbyApi: SourceNodesArgs, pluginOptions: MedusaPluginOptions): Promise<void>;
