import { SourceNodesArgs } from "gatsby";
import { createClient } from "./client";

export function createOperations(
  options: MedusaPluginOptions,
  { reporter }: SourceNodesArgs
): IOperations {
  const client = createClient(options, reporter);

  function createOperation(name: "products" | "regions"): IMedusaOperation {
    return {
      execute: (): Promise<any[]> => client[name](),
      name: name,
    };
  }

  return {
    createProductsOperation: createOperation("products"),
    createRegionsOperation: createOperation("regions"),
  };
}
