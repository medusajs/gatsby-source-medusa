import { NodeInput, SourceNodesArgs } from "gatsby";
import { createRemoteFileNode } from "gatsby-source-filesystem";

const downloadImageAndCreateFileNode = async (
  { url, nodeId }: { url: string; nodeId: string },
  {
    actions: { createNode },
    createNodeId,
    cache,
    store,
    reporter,
  }: SourceNodesArgs
): Promise<string> => {
  const fileNode = await createRemoteFileNode({
    url,
    cache,
    createNode,
    createNodeId,
    parentNodeId: nodeId,
    store,
    reporter,
  });

  return fileNode.id;
};

interface IImageData {
  id: string;
  url: string;
  localFile: string | undefined;
}

interface IProcessorMap {
  [remoteType: string]: (
    node: NodeInput,
    gatsbyApi: SourceNodesArgs,
    pluginOptions: MedusaPluginOptions
  ) => Promise<void>;
}

async function processChildImage(
  node: NodeInput,
  getImageData: (node: NodeInput) => IImageData | undefined,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: MedusaPluginOptions
): Promise<void> {
  if (pluginOptions.downloadImages) {
    const image = getImageData(node);

    if (image) {
      const { url } = image;
      const fileNodeId = await downloadImageAndCreateFileNode(
        {
          url,
          nodeId: node.id,
        },
        gatsbyApi
      );

      image.localFile = fileNodeId;
    }
  }
}

export const processorMap: IProcessorMap = {
  ProductImage: async (node, gatsbyApi, options) => {
    if (options.downloadImages) {
      const url = node.originalSrc as string;
      const fileNodeId = await downloadImageAndCreateFileNode(
        {
          url,
          nodeId: node.id,
        },
        gatsbyApi
      );

      node.localFile = fileNodeId;
    }
  },
  Product: async (node, gatsbyApi, options) => {
    await processChildImage(
      node,
      (node) => node.thumbnail as IImageData,
      gatsbyApi,
      options
    );
    await processChildImage(
      node,
      (node) => {
        const media = node.featuredMedia as
          | {
              preview?: {
                image?: IImageData;
              };
            }
          | undefined;

        return media?.preview?.image;
      },
      gatsbyApi,
      options
    );
  },
};

// export function nodeBuilder(
//   gatsbyApi: SourceNodesArgs,
//   pluginOptions: ShopifyPluginOptions
// ): NodeBuilder {
//   return {
//     async buildNode(result: BulkResult): Promise<NodeInput> {
//       if (!pattern.test(result.id)) {
//         throw new Error(
//           `Expected an ID in the format gid://shopify/<typename>/<id>`
//         );
//       }

//       const [, remoteType] = result.id.match(pattern) || [];

//       const processor =
//         processorMap[remoteType] || ((): Promise<void> => Promise.resolve());

//       attachParentId(result, gatsbyApi, pluginOptions);

//       const node = {
//         ...result,
//         shopifyId: result.id,
//         id: createNodeId(result.id, gatsbyApi, pluginOptions),
//         internal: {
//           type: `${pluginOptions.typePrefix || ``}Shopify${remoteType}`,
//           contentDigest: gatsbyApi.createContentDigest(result),
//         },
//       };

//       await processor(node, gatsbyApi, pluginOptions);

//       return node;
//     },
//   };
// }
