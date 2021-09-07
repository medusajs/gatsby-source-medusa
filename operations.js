"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOperations = void 0;
const client_1 = require("./client");
function createOperations(options, { reporter }) {
    const client = (0, client_1.createClient)(options, reporter);
    function createOperation(name) {
        return {
            execute: () => client[name](),
            name: name,
        };
    }
    return {
        createProductsOperation: createOperation("products"),
        createRegionsOperation: createOperation("regions"),
    };
}
exports.createOperations = createOperations;
//# sourceMappingURL=operations.js.map