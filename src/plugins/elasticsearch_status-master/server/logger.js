var DEFAULT_MAX_LOG_SIZE = 2048000,
  DEFAULT_LOG_BACKUP = process.env.LOGFILE_COUNT || 10,
  DEFAULT_LOG_LEVEL = "ALL";

var path = require("path"),
  fs = require("fs");

var logDir = path.resolve(__dirname, "../../../../data/");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
function getLogFilePath(fileName) {
  return path.resolve(logDir, fileName);
}

//包括Log4js的配置还有morgan的配置
module.exports = {
  //log4js的配置文件
  "log4js": {
    //其中，logLevel是为logger配置的level，省去了手动调用log.setLevel(level)的麻烦;
    //see https://github.com/nomiddlename/log4js-node/wiki/Appenders
    "appenders": [
      {type: "console"},
      //access.log是morgan做express访问日志用的
      {
        type: "file",
        filename: getLogFilePath("access.log"),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: "access",
        logLevel: DEFAULT_LOG_LEVEL
      },
      //错误日志
      {
        type: "file",
        filename: getLogFilePath("error.log"),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: "error",
        logLevel: DEFAULT_LOG_LEVEL
      },
      //rest请求代理日志
      {
        type: "file",
        filename: getLogFilePath("cheese.log"),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: "cheese",
        logLevel: DEFAULT_LOG_LEVEL
      }
    ]
  },
  morgan: {
    //这个是morgan的配置记录哪些http访问日志内容
    tokenParams: 'IP::remote-addr method::method url::url status::status responseTime::response-time contentLength::res[content-length] referrer::referrer userAgent::user-agent'
  }
};
