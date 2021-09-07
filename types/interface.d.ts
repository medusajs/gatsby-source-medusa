interface MedusaPluginOptions {
  storeUrl: string;
  medusaFields?: string[];
}

interface IMedusaOperation {
  execute: () => Promise<any[]>;
  name: string;
}

interface IOperations {
  createProductsOperation: IMedusaOperation;
  createRegionsOperation: IMedusaOperation;
}
