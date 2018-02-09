let projectConfig = {
    url: {
      //http://data.abash76-hasura/
      data: "https://data." + process.env.CLUSTER_NAME + ".hasura-app.io/v1/query",
      auth: "https://auth." + process.env.CLUSTER_NAME + ".hasura-app.io/v1",
    }
}

module.exports = {
  projectConfig
};
