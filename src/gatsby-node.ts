import {
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

export async function onCreateNode({
  actions: { createNode },
  cache,
  createNodeId,
  node,
  store,
  reporter
}: {
  actions: { createNode: Function }
  cache: GatsbyCache
  createNodeId: Function
  node: Node
  store: Store
  reporter: Reporter
}) {
  if (node.internal.type === `MedusaProducts`) {
    if (node.thumbnail !== null) {
      let thumbnailNode: Node | null = null
      try {
        thumbnailNode = await createRemoteFileNode({
          url: `${node.thumbnail}`,
          parentNodeId: node.id,
          createNode,
          createNodeId,
          cache,
          store,
          reporter
        })
      } catch (e) {
        reporter.warn(`Could not create thumbnail node for ${node.id}`)
        reporter.warn(`${e}`)
      }

      if (thumbnailNode) {
        node.thumbnail = thumbnailNode.id
      }
    }

    const images: any[] = node.images as any[]

    if (images?.length > 0) {
      for (let i = 0; i < images.length; i++) {
        let imageNode: Node | null = null

        try {
          imageNode = await createRemoteFileNode({
            url: `${images[i].url}`,
            cache,
            createNode,
            createNodeId,
            parentNodeId: node.id,
            store,
            reporter
          })
        } catch (e) {
          reporter.warn(`Could not create image node for ${node.id}`)
          reporter.warn(`${e}`)
        }

        if (imageNode) {
          images[i] = { image: imageNode.id }
        }
      }
    }
  }
}

export async function createSchemaCustomization({
  actions: { createTypes }
}: {
  actions: { createTypes: Function }
}) {
  createTypes(`
    type MedusaProducts implements Node {
      id: ID!
      # create a relationship between YourSourceType and the File nodes for optimized images
      thumbnail: File @link
      images: [MedusaImage]
    }
    type MedusaImage {
      image: File @link
    }`)
}
