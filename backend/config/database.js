const normalizeDatabaseName = (databaseName = "") =>
  databaseName.replace(/^\/+|\/+$/g, "");

export const buildMongoUri = () => {
  const baseUri = process.env.MONGO_URI?.replace(/\/+$/g, "");
  const databaseName = normalizeDatabaseName(process.env.DB_NAME || "");

  if (!baseUri) {
    return "";
  }

  return databaseName ? `${baseUri}/${databaseName}` : baseUri;
};
