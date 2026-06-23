import { createProductionServer } from "./server";

const productionServer = createProductionServer();

export const { app } = productionServer;

export default productionServer.defaultExport;
