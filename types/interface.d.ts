interface MedusaPluginOptions {
  storeUrl: string;
  authToken: string;
}

interface IMedusaOperation {
  execute: () => Promise<any[]>;
  name: string;
}

interface IOperations {
  createProductsOperation: IMedusaOperation;
  createRegionsOperation: IMedusaOperation;
  createOrdersOperation: IMedusaOperation;
  incrementalProductsOperation: (date: Date) => IMedusaOperation;
  incrementalRegionsOperation: (date: Date) => IMedusaOperation;
  incrementalOrdersOperation: (date: Date) => IMedusaOperation;
}
