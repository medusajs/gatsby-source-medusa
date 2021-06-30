const { processNode } = require("../helpers");

describe("helper functions", () => {
  it("should return return a new node from processNode", () => {
    const fieldName = "product";
    const node = {
      id: "prod_test_1234",
      title: "Test Shirt",
      description: "A test product",
      unit_price: 2500,
    };

    const contentDigest = "digest_string";
    const createContentDigest = jest.fn(() => contentDigest);
    const processNodeResult = processNode(node, fieldName, createContentDigest);
    const expectedNodeContent = JSON.stringify(node);

    expect(createContentDigest).toBeCalled();

    expect(processNodeResult).toMatchSnapshot({
      ...node,
      parent: null,
      children: [],
      internal: {
        type: "MedusaProduct",
        content: expectedNodeContent,
        contentDigest,
      },
    });
  });
});
