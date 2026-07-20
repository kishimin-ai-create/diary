import { createProductionServer } from "../src/server";

let productionServer: ReturnType<typeof createProductionServer> | undefined;

export default {
  async fetch(request: Request): Promise<Response> {
    productionServer ??= createProductionServer();
    return productionServer.defaultExport.fetch(request);
  },
};
