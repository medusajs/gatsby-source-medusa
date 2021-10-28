import { SourceNodesArgs } from "gatsby";
import { createClient } from "./client";

export function createOperations(
  options: MedusaPluginOptions,
  { reporter }: SourceNodesArgs
): IOperations {
  const client = createClient(options, reporter);

  function createOperation(
    name: "products" | "regions",
    queryString?: string
  ): IMedusaOperation {
    return {
      execute: (): Promise<any[]> => client[name](queryString),
      name: name,
    };
  }

  return {
    createProductsOperation: createOperation("products"),
    createRegionsOperation: createOperation("regions"),
    incrementalProductsOperation: (date: Date) =>
      createOperation("products", date.toISOString()),
    incrementalRegionsOperation: (date: Date) =>
      createOperation("products", date.toISOString()),
  };
}
