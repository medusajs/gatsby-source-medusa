import { PluginOptionsSchemaArgs, SourceNodesArgs } from "gatsby";
import { makeSourceFromOperation } from "./make-source-from-operation";
import { createOperations } from "./operations";

export function pluginOptionsSchema({ Joi }: PluginOptionsSchemaArgs) {
  return Joi.object({
    storeUrl: Joi.string().required(),
  });
}

async function sourceAllNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: MedusaPluginOptions
): Promise<void> {
  const { createProductsOperation, createRegionsOperation } = createOperations(
    pluginOptions,
    gatsbyApi
  );

  const operations = [createProductsOperation, createRegionsOperation];

  const sourceFromOperation = makeSourceFromOperation(gatsbyApi);

  for (const op of operations) {
    await sourceFromOperation(op);
  }
}

export async function sourceNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: MedusaPluginOptions
): Promise<void> {
  const pluginStatus =
    gatsbyApi.store.getState().status.plugins?.[`gatsby-source-medusa`];

  const lastBuildTime = pluginStatus?.[`lastBuildTime`];

  if (lastBuildTime !== undefined) {
    /**
     * We should add a way to retrieve products and regions that have
     * been updated/created since last build time to support incremental builds.
     */
    gatsbyApi.reporter.info(
      `Cache is warm, but we do not currently support incremental build. Running a clean build`
    );
    await sourceAllNodes(gatsbyApi, pluginOptions);
  } else {
    gatsbyApi.reporter.info(`Cache is cold, running a clean build`);
    await sourceAllNodes(gatsbyApi, pluginOptions);
  }

  gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`);
  gatsbyApi.actions.setPluginStatus(
    pluginStatus !== undefined
      ? {
          ...pluginStatus,
          [`lastBuildTime`]: Date.now(),
        }
      : {
          [`lastBuildTime`]: Date.now(),
        }
  );
}
