import { capitalize } from "./utils/capitalize";

export const processNode = (
  node: any,
  fieldName: string,
  createContentDigest: (this: void, input: string | object) => string
) => {
  const nodeId = node.id;
  const nodeContent = JSON.stringify(node);
  const nodeContentDigest = createContentDigest(nodeContent);

  const nodeData = Object.assign({}, node, {
    id: nodeId,
    parent: null,
    children: [],
    internal: {
      type: `Medusa${capitalize(fieldName)}`,
      content: nodeContent,
      contentDigest: nodeContentDigest,
    },
  });

  return nodeData;
};
