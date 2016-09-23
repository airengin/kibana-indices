var logger = require('./loggerUtil').getLogger("cheese");
var _ = require('lodash');
export default function (bundleDir, server) {

  // We can use this method, since we have set the require in the index.js to
  // elasticsearch. So we can access the elasticsearch plugins safely here.
  let call = server.plugins.elasticsearch.callWithRequest;

  // Register a GET API at /api/elasticsearch_status/indices that returns
  // an array of all indices in the elasticsearch. The server is actually an
  // HAPI server and the complete documentation of the "route" method can be
  // found in the official documentation: http://hapijs.com/api#serverrouteoptions
  server.route({
    path: '/api/elasticsearch_status/indices',
    method: 'GET',
    // The handler method will be called with the request that was made to this
    // API and a reply method as 2nd parameter, that must be called with the
    // content, that should be returned to the client.
    handler(req, reply) {

      // The call method that we just got from elasticsearch has the following
      // syntax: the first parameter should be the request that actually came
      // from the client. The callWithRequest method will take care about
      // passing authentication data from kibana to elasticsearch or return
      // authorization requests, etc.
      // Second parameter to the function is the name of the javascript method
      // you would like to call, as you can find it here in the documentation:
      // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/
      // The third parameter will be passed as a parameter to the javascript method
      // (it should contain the data you would have also passed to the client directly).
      // The method returns a promise, which will be resolved with the data returned
      // from Elasticsearch.
      call(req, 'cluster.state').then(function (response) {
        // Return just the names of all indices to the client.
        logger.debug("****************************\n");
        logger.debug("indices=" + JSON.stringify(response));
        logger.debug("indices\n");
        var res = response.metadata.indices;
        reply(
          Object.keys(res)
        );
      });
    }
  });
  server.route({
    path: '/api/elasticsearch_status/{index}/types',
    method: 'GET',
    handler(req, reply) {
      call(req, 'cluster.state').then(function (response) {
        // Return just the names of all indices to the client.
        logger.debug("****************************\n" + req.params.index);
        logger.debug("types=" + JSON.stringify(response.metadata.indices[req.params.index].mappings));
        logger.debug("types\n");
        var res = response.metadata.indices[req.params.index].mappings;
        reply(
          Object.keys(res)
        );
      });
    }
  });
  server.route({
    // We can use path variables in here, that can be accessed on the request
    // object in the handler.
    path: '/api/elasticsearch_status/{index}/all',
    method: 'GET',
    handler(req, reply) {
      call(req, 'count', {
        index: req.params.index
      }).then(function (response) {
        logger.debug("****************************\n" + req.params.index);
        logger.debug("count" + JSON.stringify(response));
        logger.debug("count\n");
        reply(response && response.count);
      });
    }
  });
  // Add a route to retrieve the status of an index by its index
  server.route({
    // We can use path variables in here, that can be accessed on the request
    // object in the handler.
    path: '/api/elasticsearch_status/{index}/{type}/{from}/{size}',
    method: 'GET',
    handler(req, reply) {
      call(req, 'search', {
        index: req.params.index,
        type: req.params.type,
        from: req.params.from,
        size: req.params.size
      }).then(function (response) {
        logger.debug("****************************\n"
          + req.params.index + ",type=" + req.params.type + ",from=" + req.params.from + ",size=" + req.params.size);
        logger.debug("searchData=" + JSON.stringify(response));
        logger.debug("searchData\n");
        reply(response);
      });
    }
  });
  server.route({
    // We can use path variables in here, that can be accessed on the request
    // object in the handler.
    path: '/api/elasticsearch_status/{index}/mapping',
    method: 'GET',
    handler(req, reply) {
      call(req, 'indices.getMapping', {
        index: req.params.index
      }).then(function (response) {
        logger.debug("****************************\n" + req.params.index);
        logger.debug("mapping=" + JSON.stringify(response));
        logger.debug("mapping\n");
        reply(response);
      });
    }
  });
  server.exposeStaticDir('/dejavu/{path*}', bundleDir + '/../dejavu');

};
