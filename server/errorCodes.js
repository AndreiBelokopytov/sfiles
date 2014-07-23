module.exports = function (app) {
  var errorCodes = {
    badRequest: 1,
    internalServerError: 2
  };

  app.errorCodes = errorCodes;
};