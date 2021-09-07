"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNode = void 0;
const capitalize_1 = require("./utils/capitalize");
const processNode = (node, fieldName, createContentDigest) => {
    const nodeId = node.id;
    const nodeContent = JSON.stringify(node);
    const nodeContentDigest = createContentDigest(nodeContent);
    const nodeData = Object.assign({}, node, {
        id: nodeId,
        parent: null,
        children: [],
        internal: {
            type: `Medusa${(0, capitalize_1.capitalize)(fieldName)}`,
            content: nodeContent,
            contentDigest: nodeContentDigest,
        },
    });
    return nodeData;
};
exports.processNode = processNode;
//# sourceMappingURL=process-node.js.map