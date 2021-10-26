import { PluginOptionsSchemaArgs, SourceNodesArgs } from "gatsby";
import { createRemoteFileNode } from "gatsby-source-filesystem";
import { makeSourceFromOperation } from "./make-source-from-operation";
import { createOperations } from "./operations";

/**
 * TODO: MedusaCollections are not currently availible through the storefront API.
 * Add once endpoint is ready!
 */

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

const medusaNodeTypes = [`MedusaProduct`, `MedusaRegion`];

// @TODO: Add once query by updated_since has been added
// async function sourceUpdatedNodes(
//   gatsbyApi: SourceNodesArgs,
//   pluginOptions: MedusaPluginOptions
// ): Promise<void> {
//   const { incrementalProductsOperation, incrementalRegionsOperation } =
//     createOperations(pluginOptions, gatsbyApi);

//   const lastBuildTime = new Date(
//     gatsbyApi.store.getState().status.plugins?.[`gatsby-source-medusa`]?.[
//       `lastBuildTime`
//     ]
//   );

//   for (const nodeType of medusaNodeTypes) {
//     gatsbyApi
//       .getNodesByType(nodeType)
//       .forEach((node) => gatsbyApi.actions.touchNode(node));
//   }

//   const operations = [
//     incrementalProductsOperation(lastBuildTime),
//     incrementalRegionsOperation(lastBuildTime),
//   ];

//   const sourceFromOperation = makeSourceFromOperation(gatsbyApi);

//   for (const op of operations) {
//     await sourceFromOperation(op);
//   }
// }

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

export async function onCreateNode({
  actions: { createNode },
  cache,
  createNodeId,
  node,
  store,
  reporter,
}: any) {
  if (node.internal.type === `MedusaProducts`) {
    // create a FileNode in Gatsby that gatsby-transformer-sharp will create optimized images for
    const thumbnailNode = await createRemoteFileNode({
      // the url of the remote image to generate a node for
      url: node.thumbnail,
      cache,
      createNode,
      createNodeId,
      parentNodeId: node.id,
      store,
      reporter,
    });
    if (thumbnailNode) {
      node.thumbnail = thumbnailNode.id;
    }

    if (node.images) {
      for (let i = 0; i < node.images.length; i++) {
        const imageNode = await createRemoteFileNode({
          url: node.images[i].url,
          cache,
          createNode,
          createNodeId,
          parentNodeId: node.id,
          store,
          reporter,
        });

        if (imageNode) {
          node.images[i] = { ...node.images[i], gatsbyImage: imageNode.id };
        }
      }
    }
  }
}

export async function createSchemaCustomization({ actions }: any) {
  const { createTypes } = actions;
  createTypes(`
    type MedusaProducts implements Node {
      id: ID!
      # create a relationship between YourSourceType and the File nodes for optimized images
      thumbnail: File @link
      images: [MedusaImage]
    }
    type MedusaImage {
      gatsbyImage: File @link
    }`);
}
