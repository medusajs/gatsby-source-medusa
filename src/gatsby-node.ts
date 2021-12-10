import {
  CreateResolversArgs,
  GatsbyCache,
  Node,
  PluginOptionsSchemaArgs,
  Reporter,
  SourceNodesArgs,
  Store
} from "gatsby"
import { createRemoteFileNode } from "gatsby-source-filesystem"
import { makeSourceFromOperation } from "./make-source-from-operation"
import { createOperations } from "./operations"

export function pluginOptionsSchema({ Joi }: PluginOptionsSchemaArgs) {
  return Joi.object({
    storeUrl: Joi.string().required(),
    authToken: Joi.string().optional()
  })
}

async function sourceAllNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: MedusaPluginOptions
): Promise<void> {
  const {
    createProductsOperation,
    createRegionsOperation,
    createOrdersOperation,
    createCollectionsOperation
  } = createOperations(pluginOptions, gatsbyApi)

  const operations = [
    createProductsOperation,
    createRegionsOperation,
    createCollectionsOperation
  ]

  // if auth token is provided then source orders
  if (pluginOptions.authToken) {
    operations.push(createOrdersOperation)
  }

  const sourceFromOperation = makeSourceFromOperation(gatsbyApi)

  for (const op of operations) {
    await sourceFromOperation(op)
  }
}

const medusaNodeTypes = [
  "MedusaRegions",
  "MedusaProducts",
  "MedusaOrders",
  "MedusaCollections"
]

async function sourceUpdatedNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: MedusaPluginOptions
): Promise<void> {
  const {
    incrementalProductsOperation,
    incrementalRegionsOperation,
    incrementalOrdersOperation,
    incrementalCollectionsOperation
  } = createOperations(pluginOptions, gatsbyApi)

  const lastBuildTime = new Date(
    gatsbyApi.store.getState().status.plugins?.[`gatsby-source-medusa`]?.[
      `lastBuildTime`
    ]
  )

  for (const nodeType of medusaNodeTypes) {
    gatsbyApi
      .getNodesByType(nodeType)
      .forEach((node) => gatsbyApi.actions.touchNode(node))
  }

  const operations = [
    incrementalProductsOperation(lastBuildTime),
    incrementalRegionsOperation(lastBuildTime),
    incrementalCollectionsOperation(lastBuildTime)
  ]

  if (pluginOptions.authToken) {
    operations.push(incrementalOrdersOperation(lastBuildTime))
  }

  const sourceFromOperation = makeSourceFromOperation(gatsbyApi)

  for (const op of operations) {
    await sourceFromOperation(op)
  }
}

export async function sourceNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: MedusaPluginOptions
): Promise<void> {
  const pluginStatus =
    gatsbyApi.store.getState().status.plugins?.[`gatsby-source-medusa`]

  const lastBuildTime = pluginStatus?.[`lastBuildTime`]

  if (lastBuildTime !== undefined) {
    gatsbyApi.reporter.info(
      `Cache is warm, but incremental builds are currently not supported. Running a clean build.`
    )
    await sourceAllNodes(gatsbyApi, pluginOptions)
  } else {
    gatsbyApi.reporter.info(`Cache is cold, running a clean build.`)
    await sourceAllNodes(gatsbyApi, pluginOptions)
  }

  gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`)
  gatsbyApi.actions.setPluginStatus(
    pluginStatus !== undefined
      ? {
          ...pluginStatus,
          [`lastBuildTime`]: Date.now()
        }
      : {
          [`lastBuildTime`]: Date.now()
        }
  )
}

export function createResolvers({ createResolvers }: CreateResolversArgs) {
  const resolvers = {
    MedusaProducts: {
      images: {
        type: ["MedusaImages"],
        resolve: async (source: any, _args: any, context: any, _info: any) => {
          const { entries } = await context.nodeModel.findAll({
            query: {
              filter: { parent: { id: { eq: source.id } } }
            },
            type: "MedusaImages"
          })
          return entries
        }
      }
    }
  }
  createResolvers(resolvers)
}

export async function createSchemaCustomization({
  actions: { createTypes }
}: {
  actions: { createTypes: Function }
  schema: any
}) {
  createTypes(`
    type MedusaProducts implements Node {
      thumbnail: File @link(from: "fields.localThumbnail")
    }

    type MedusaImages implements Node {
      image: File @link(from: "fields.localImage")
    }
  `)
}

export async function onCreateNode({
  actions: { createNode, createNodeField },
  cache,
  createNodeId,
  node,
  store,
  reporter
}: {
  actions: { createNode: Function; createNodeField: Function }
  cache: GatsbyCache
  createNodeId: Function
  node: Node
  store: Store
  reporter: Reporter
}) {
  if (node.internal.type === `MedusaProducts`) {
    if (node.thumbnail !== null) {
      let thumbnailNode: Node | null = await createRemoteFileNode({
        url: `${node.thumbnail}`,
        parentNodeId: node.id,
        createNode,
        createNodeId,
        cache,
        store,
        reporter
      })

      if (thumbnailNode) {
        createNodeField({
          node,
          name: `localThumbnail`,
          value: thumbnailNode.id
        })
      }
    }
  }

  if (node.internal.type === `MedusaImages`) {
    let imageNode: Node | null = await createRemoteFileNode({
      url: `${node.url}`,
      parentNodeId: node.id,
      createNode,
      createNodeId,
      cache,
      store,
      reporter
    })

    if (imageNode) {
      reporter.warn(`creating ${node.url}`)
      createNodeField({
        node,
        name: `localImage`,
        value: imageNode.id
      })
    }
  }
}
