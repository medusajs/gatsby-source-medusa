const processNode = (node, fieldName, createContentDigest) => {
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

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

module.exports = { processNode };
