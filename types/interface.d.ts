interface MedusaPluginOptions {
  storeUrl: string;
  medusaFields?: string[];
  downloadImages?: boolean;
}

interface IMedusaOperation {
  execute: () => Promise<any[]>;
  name: string;
}

interface IOperations {
  createProductsOperation: IMedusaOperation;
  createRegionsOperation: IMedusaOperation;
  incrementalProductsOperation: (date: Date) => IMedusaOperation;
  incrementalRegionsOperation: (date: Date) => IMedusaOperation;
}
