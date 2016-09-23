/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/9/9.
 */
var log4js = require('log4js')
  , loggerConfig = require("./logger").log4js;

log4js.configure(loggerConfig);

//获取logger的方法
function getLogger(logId) {
  var logger = log4js.getLogger(logId);
  if (logger != null) {
    var logConfig;
    for(var index  in loggerConfig.appenders){
      logConfig=loggerConfig.appenders[index];
      if(logConfig&&logConfig.category&&logConfig.category===logId){
        break;
      }
    }
    if (logConfig != null) {
      logger.setLevel(logConfig.logLevel);
    } else {
      throw 'no logger with logId : ' + logId + ' found';
    }
    return logger;
  } else {
    throw 'no logger with logId : ' + logId + ' found';
  }
}
exports.getLogger = getLogger;
