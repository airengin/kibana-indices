// This file contains all the logic for your app
// authentication and streaming data from your
// endpoint.
// **Configs:** Appname and Credentials

const DATA_SIZE = get_data_size();
var APPNAME, USERNAME, PASSWORD, URL;
var appbaseRef;
var getMapFlag = false;
var appAuth = true;
var exportJsonData = [];

var OperationFlag = false;
var input_state = {};
//If default = true then take it from config.js
var browse_url = window.location.href;
var flag_url = browse_url.split('?default=')[1] == "true";
if (!flag_url || decryptedData.hasOwnProperty('url')) {
  config = {
    url: window.localStorage.getItem('esurl'),
    appname: window.localStorage.getItem('appname')
  };
}
APPNAME = "customer_36v8tudu9z";

// Get data size according to window height
function get_data_size() {
  var mininum_data_size = 20;
  var winHeight = $(window).height() - 150;
  var rowHeight = 51;
  var min_rows = Math.ceil(winHeight / rowHeight);
  var rows = min_rows < mininum_data_size ? mininum_data_size : min_rows;
  return rows;
}


// vars for tracking current data and types
var sdata = {}; // data to be displayed in table
var headers = ["_type", "_id"];
var esTypes = []; // all the types in current 'app'
var subsetESTypes = []; // currently 'selected' types
window.subsetESTypes = subsetESTypes;
var feed = (function () {

  // applies a searchStream() query on a particular ``type``
  // to establish a continuous query connection.
  // use applyAppbaseSearch to get the data
  function applyStreamSearch(types, callback, queryBody, setTotal) {
    if (types !== null) {
      var defaultQueryBody = {
        query: {
          match_all: {}
        }
      }
      var queryBody = queryBody ? queryBody : defaultQueryBody;
      queryBody = "";
      var dataSize = Object.keys(sdata).length;
      sdata = {}; // we can't reliably keep state once type info changes, hence we fetch everything again.
      var typesString = types.join(',');
      var finalUrl = '/api/elasticsearch_status/' + APPNAME + '/' + typesString + '/' + 0 + '/' + Math.max(dataSize, DATA_SIZE);
      applyAppbaseSearch(finalUrl, queryBody, function (res) {
        try {
          if (res.hits.hits.length == 0) {
            callback(null, false, 0);
          } else {
            callback(res.hits.hits, false, res.hits.total);
          }
        } catch (err) {
          console.log(err);
        }
        allowOtherOperation();
      }, function () {
        allowOtherOperation();
      });

      // Counter stream
      // countStream(types, setTotal);


    }
  };

  //This function is built only to maintain the total number of records
  //It's hard to figure out correct total number of records while streaming and filtering is together
  function countStream(types, setTotal) {
    appbaseRef.search({
      type: types,
      body: {
        "query": {
          "match_all": {}
        }
      }
    }).on('data', function (res) {
      setTotal(res.hits.total);
    });

    //Stop old stream
    if (typeof counterStream != 'undefined')
      counterStream.stop();

    counterStream = appbaseRef.searchStream({
      type: types,
      body: {
        "query": {
          "match_all": {}
        }
      }
    }).on('data', function (res2) {
      //For update data
      if (res2._updated) {

      } else if (res2._deleted) {
        setTotal(0, true, 'delete');
      }
      //For Index data
      else {
        setTotal(0, true, 'index');
      }
      //callback(res, true);
    }).on('error', function (err) {
      //console.log("caught a stream error", err);
    });
  };

  function allowOtherOperation() {
    setTimeout(function () {
      OperationFlag = false;
    }, 500);
  };

  // ajax call instead of appbase search, to use preference in search query
  function applyAppbaseSearch(finalUrl, queryBody, cb_succes, cb_error) {
    $.ajax({
      type: 'GET',
      url: finalUrl,
      success: function (res) {
        cb_succes(res);
      },
      error: function (xhr) {
        if (cb_error) {
          cb_error();
        }
      }
    });
  }

  // paginate and show new results when user scrolls
  // to the bottom of the existing results.
  function paginationSearch(typeName, from, callback, queryBody) {
    if (typeName !== null)
      var defaultQueryBody = {
        query: {
          match_all: {}
        }
      }
    var queryBody = queryBody ? queryBody : defaultQueryBody;
    queryBody = "";
    var typesString = typeName.join(',');
    var finalUrl = '/api/elasticsearch_status/' + APPNAME + '/' + typesString + '/' + from + '/' + DATA_SIZE;
    applyAppbaseSearch(finalUrl, queryBody, function (res) {
      callback(res.hits.hits);
    });
  }

  return {
    countStream: function (types, setTotal) {
      countStream(types, setTotal);
    },
    // exposes ``applyStreamSearch()`` as ``getData()``
    getData: function (types, callback, setTotal) {
      applyStreamSearch(types, callback, false, setTotal);
    },
    // ``deleteData()`` deletes the data records when
    // a type is unchecked by the user.
    deleteData: function (typeName, callback) {
      localSdata = {};
      for (data in sdata) {
        if (sdata[data]._type !== typeName) {
          localSdata[data] = sdata[data];
        }
      }
      sdata = localSdata;
      callback(sdata);
    },
    // ``paginateData()`` scrolls new results using the
    // datatable's current length.
    paginateData: function (total, callback, queryBody) {
      paginationSearch(subsetESTypes, Object.keys(sdata).length, callback, (queryBody != null) ? queryBody : null);
    },
    // gets all the types of the current app;
    getTypes: function (callback) {
      if (typeof APPNAME != 'undefined') {
        this.filterType().done(function (data) {
          var buckets = data.aggregations.count_by_type.buckets;
          var types = buckets.filter(function (bucket) {
            return bucket.doc_count > 0;
          });
          var types = types.map(function (bucket) {
            return bucket.key;
          });
          if (types.length) {
            if (JSON.stringify(esTypes.sort()) !== JSON.stringify(types.sort())) {
              esTypes = types.slice();
              if (callback !== null)
                callback(types);
            }
          } else {
            if (callback !== null)
              callback(types);
          }
        }).error(function (xhr) {
          console.log(xhr);
          clearInterval(streamingInterval);
          console.log('error in retrieving types: ', xhr)
        });
      } else {
        var $this = this;
        setTimeout(function () {
          $this.getTypes(callback);
        }, 1000);
      }
    },
    indexData: function (recordObject, method, callback) {
      var self = this;
      if (method == 'index') {
        appbaseRef.index(recordObject).on('data', function (res) {
          if (esTypes.indexOf(res._type) === -1) {
            self.getTypes(function (newTypes) {
              if (callback)
                callback(newTypes);
            });
          } else {
            callback();
          }
        });
      } else {
        var doc = recordObject.body;
        recordObject.body = {
          doc: doc
        };
        console.log(recordObject);
        appbaseRef.update(recordObject).on('data', function (res) {
          if (callback)
            callback();
        });
      }

    },
    deleteRecord: function (selectedRows, callback) {
      var deleteArray = selectedRows.map(function (v) {
        return {"delete": v};
      });
      console.log(deleteArray);

      appbaseRef.bulk({
        body: deleteArray
      }).on('data', function (data) {
        for (data in sdata) {
          selectedRows.forEach(function (v) {
            if (typeof sdata[data] != 'undefined') {
              if (sdata[data]._type == v._type && sdata[data]._id == v._id) {
                delete sdata[data];
              }
            }
          });
        }
        callback(sdata);
      });
    },
    getSingleDoc: function (type, callback) {
      appbaseRef.search({
        type: type,
        from: 0,
        size: 1,
        body: {
          query: {
            match_all: {}
          }
        }
      }).on('data', function (data) {
        callback(data);
      });
    },
    getMapping: function () {
      var finalUrl = '/api/elasticsearch_status/' + APPNAME + '/mapping';
      return $.ajax({
        type: 'GET',
        url: finalUrl
      });
    },
    filterType: function () {
      //var createUrl = HOST + '/' + APPNAME + '/_search?search_type=count';
      //var queryBody = {
      //  "aggs": {
      //    "count_by_type": {
      //      "terms": {
      //        "field": "_type"
      //      }
      //    }
      //  }
      //};
      //return $.ajax({
      //  type: 'POST',
      //  beforeSend: function (request) {
      //    request.setRequestHeader("Authorization", "Basic " + btoa(USERNAME + ':' + PASSWORD));
      //  },
      //  url: createUrl,
      //  contentType: 'application/json; charset=utf-8',
      //  dataType: 'json',
      //  data: JSON.stringify(queryBody),
      //  xhrFields: {
      //    withCredentials: true
      //  }
      //});
    },
    scrollapi: function (types, queryBody, scroll, scroll_id) {
      var typesString = types.join(',');
      var createUrl = HOST + '/' + APPNAME + '/' + typesString + '/_search?scroll=5m';
      var scrollUrl = HOST + '/_search/scroll?scroll=5m&scroll_id=' + scroll_id;
      var finalUrl = scroll ? scrollUrl : createUrl;
      return $.ajax({
        type: 'POST',
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", "Basic " + btoa(USERNAME + ':' + PASSWORD));
        },
        url: finalUrl,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(queryBody),
        xhrFields: {
          withCredentials: true
        }
      });
    },
    testQuery: function (types, queryBody) {
      // get historical data
      return appbaseRef.search({
        type: types,
        from: 0,
        size: 0,
        body: queryBody
      });
    },
    getTotalRecord: function () {
      // get historical data
      return $.ajax({
        type: 'GET',
        url: '/api/elasticsearch_status/' + APPNAME + '/all',
      });
    },
    getIndices: function () {
      return $.ajax({
        type: 'GET',
        url: "/api/elasticsearch_status/indices"
      });
    },
    createIndex: function (url, appname) {

    },
    filterUrl: function (url) {
    },
    filterQuery: function (method, columnName, value, typeName, analyzed, callback, setTotal) {
      var queryBody = this.createFilterQuery(method, columnName, value, typeName, analyzed);
      applyStreamSearch(typeName, callback, queryBody, setTotal);
    },
    //Create Filter Query by passing attributes
    createFilterQuery: function (method, columnName, value, typeName, analyzed) {
      var queryBody = {};
      switch (method) {
        case 'has':
          var queryMaker = [];
          //If field is analyzed use MATCH else term
          var subQuery = analyzed ? 'match' : 'term';
          value.forEach(function (val) {
            var termObj = {};
            termObj[columnName] = val.trim();
            var obj = {}
            obj[subQuery] = termObj;
            queryMaker.push(obj);
          });
          queryBody = {
            "query": {
              "bool": {
                "must": queryMaker,
                "minimum_should_match": 1
              }
            }
          }
          break;

        case 'has not':
          var queryMaker = [];
          var subQuery = analyzed ? 'match' : 'term';

          value.forEach(function (val) {
            var termObj = {};
            termObj[columnName] = val.trim();
            var obj = {};
            obj[subQuery] = termObj;
            queryMaker.push(obj);
          });
          queryBody = {
            "query": {
              "bool": {
                "must_not": queryMaker,
                "minimum_should_match": 1
              }
            }
          }
          break;

        case 'search':
          var queryMaker = [];
          var termObj = {};
          termObj[columnName] = value[0].trim();
          queryBody = {
            "query": {
              "match": termObj
            }
          };
          break;

        case 'greater than':
          termObj = {};
          termObj[columnName] = {};
          termObj[columnName] = {
            "gte": value[0]
          };
          queryBody = {
            "query": {
              "range": termObj
            }
          };
          break;

        case 'less than':
          termObj = {};
          termObj[columnName] = {};
          termObj[columnName] = {
            "lte": value[0]
          };
          queryBody = {
            "query": {
              "range": termObj
            }
          };
          break;

        case 'range':
          rangeVal = value[0].split('@');
          termObj = {};
          termObj[columnName] = {};
          termObj[columnName] = {
            "gte": rangeVal[0],
            "lte": rangeVal[1]
          };
          queryBody = {
            "query": {
              "range": termObj
            }
          };
          break;

        case 'term':
          termObj = {};
          termObj[columnName] = value[0].trim();
          queryBody = {
            "query": {
              "term": termObj
            }
          };
          break;
      }
      return queryBody;
    }
  };

}());
