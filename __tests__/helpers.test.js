const { processNode, fetchProducts, fetchRegions } = require("../helpers");
const axios = require("axios");

jest.mock("axios");

describe("processNode", () => {
  it("should return return a new node from data", () => {
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

describe("fetchProducts", () => {
  it("should fetch products from Medusa API", async () => {
    axios.get.mockResolvedValue({
      data: {
        products: [
          {
            id: "prod_01F8Q6A73RA6Z8HD44YQ9QHZVT",
            title: "Basic T-Shirt",
            description:
              "Reimagine the feeling of a classic T-shirt. With our men's Basic cotton T-shirts, everyday essentials no longer have to be ordinary.",
            handle: "basic-shirt",
            created_at: "2021-06-21T11:46:56.180Z",
            updated_at: "2021-06-21T11:46:56.180Z",
          },
        ],
        count: 1,
        offset: 0,
      },
    });

    const mockBaseURL = "http://localhost:4000";

    const expectedProductArray = [
      {
        id: "prod_01F8Q6A73RA6Z8HD44YQ9QHZVT",
        title: "Basic T-Shirt",
        description:
          "Reimagine the feeling of a classic T-shirt. With our men's Basic cotton T-shirts, everyday essentials no longer have to be ordinary.",
        handle: "basic-shirt",
        created_at: "2021-06-21T11:46:56.180Z",
        updated_at: "2021-06-21T11:46:56.180Z",
      },
    ];
    const actualProductArray = await fetchProducts(mockBaseURL);
    expect(actualProductArray).toEqual(expectedProductArray);
  });
});

describe("fetchRegions", () => {
  it("should fetch products from Medusa API", async () => {
    axios.get.mockResolvedValue({
      data: {
        regions: [
          {
            id: "reg_01F8Q6A73RA6Z8HD44YQ9QHZVT",
            countries: [
              {
                id: "country_1",
                display_name: "Denmark",
                iso_2: "dk",
              },
              {
                id: "country_2",
                display_name: "United States of America",
                iso_2: "us",
              },
            ],
            created_at: "2021-06-21T11:46:56.180Z",
            updated_at: "2021-06-21T11:46:56.180Z",
          },
        ],
      },
    });

    const mockBaseURL = "http://localhost:4000";

    const expectedRegionArray = [
      {
        id: "reg_01F8Q6A73RA6Z8HD44YQ9QHZVT",
        countries: [
          {
            id: "country_1",
            display_name: "Denmark",
            iso_2: "dk",
          },
          {
            id: "country_2",
            display_name: "United States of America",
            iso_2: "us",
          },
        ],
        created_at: "2021-06-21T11:46:56.180Z",
        updated_at: "2021-06-21T11:46:56.180Z",
      },
    ];
    const actualRegionArray = await fetchRegions(mockBaseURL);
    expect(actualRegionArray).toEqual(expectedRegionArray);
  });
});
