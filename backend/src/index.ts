import { createProductionServer } from "./server";

const productionServer = await createProductionServer();

export const { app } = productionServer;

export default productionServer.defaultExport;
