"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceNodes = exports.pluginOptionsSchema = void 0;
const make_source_from_operation_1 = require("./make-source-from-operation");
const operations_1 = require("./operations");
function pluginOptionsSchema({ Joi }) {
    return Joi.object({
        storeUrl: Joi.string().required(),
    });
}
exports.pluginOptionsSchema = pluginOptionsSchema;
async function sourceAllNodes(gatsbyApi, pluginOptions) {
    const { createProductsOperation, createRegionsOperation } = (0, operations_1.createOperations)(pluginOptions, gatsbyApi);
    const operations = [createProductsOperation, createRegionsOperation];
    const sourceFromOperation = (0, make_source_from_operation_1.makeSourceFromOperation)(gatsbyApi);
    for (const op of operations) {
        await sourceFromOperation(op);
    }
}
async function sourceNodes(gatsbyApi, pluginOptions) {
    var _a;
    const pluginStatus = (_a = gatsbyApi.store.getState().status.plugins) === null || _a === void 0 ? void 0 : _a[`gatsby-source-medusa`];
    const lastBuildTime = pluginStatus === null || pluginStatus === void 0 ? void 0 : pluginStatus[`lastBuildTime`];
    if (lastBuildTime !== undefined) {
        /**
         * We should add a way to retrieve products and regions that have
         * been updated/created since last build time to support incremental builds.
         */
        gatsbyApi.reporter.info(`Cache is warm, but we do not currently support incremental build. Running a clean build`);
        await sourceAllNodes(gatsbyApi, pluginOptions);
    }
    else {
        gatsbyApi.reporter.info(`Cache is cold, running a clean build`);
        await sourceAllNodes(gatsbyApi, pluginOptions);
    }
    gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`);
    gatsbyApi.actions.setPluginStatus(pluginStatus !== undefined
        ? Object.assign(Object.assign({}, pluginStatus), { [`lastBuildTime`]: Date.now() }) : {
        [`lastBuildTime`]: Date.now(),
    });
}
exports.sourceNodes = sourceNodes;
//# sourceMappingURL=gatsby-node.js.map