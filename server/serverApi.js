module.exports = function (app) {
  var hat = require('hat'),
    _ = require('underscore')._,
    fs = require('fs'),
    gm = require('gm');

  function createUniqFileName (srcPath) {
    var 
      extensionIndex = srcPath.lastIndexOf('.'),
      fileName = srcPath.substr(srcPath.lastIndexOf('/')),
      extension = '',
      result = '';

    if (extensionIndex > 0) {
      extension += srcPath.substring(extensionIndex + 1);
      fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    }

    result = fileName + '_' + hat();

    if (extension) {
      result += '.' + extension;
    }

    return result;
  };

  function createLocalPath (fileName) {
    return __dirname + '/../public' + '/' + fileName;
  };

  function createPublicUrl (fileName) {
    return app.publicUrl + '/' + fileName;
  };

  function saveFile (src, callback) {
    var fileName = createUniqFileName(src),
      is = fs.createReadStream(src),
      os = fs.createWriteStream(createLocalPath(fileName));
    is.pipe(os);
    is.on('end', function (err) {
      if (fs.existsSync(src)) {
        fs.unlinkSync(src);
      }
      if (err) {
        return callback(err);
      } else {
        return callback(null, fileName);
      }
    });
  };

  function resizeImage (srcPath, width, height, callback) {
    if (width || height) {
      var image = gm(srcPath);

      image.size(function (error, values) {
        if (error) {
          callback(error);
        } else {
          var sourceWidth = values.width,
            sourceHeight = values.height,
            options = "";

          if (!height) {
            if (width > sourceWidth) {
              options = "^";
            }
            image.resize(width, null, options);
          } else if (!width) {
            if (height > sourceHeight) {
              options = "^";
            }
            image.resize(null, height, options);
          } else {
            image.resize(width, height, "!");
          }
          image.write(srcPath, function (err) {
            if (err) {
              callback(err);
            } else {
              callback(null);
            }
          });
        }
      });
    } else {
      callback(null);
    }

  };

  function cropImage (srcPath, width, height, cropX, cropY, callback) {
    if (width && height) {
      if (!cropX) {
        cropX = 0;
      }
      if (!cropY) {
        cropY = 0;
      }

      gm(srcPath)
      .crop(width, height, cropX, cropY)
      .write(srcPath, function (err) {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    } else {
      callback(null);
    }
  };

  var serverApi = {
    uploadFile: function (req, res, next) {
      req.files = _.toArray(req.files);
      if (req.files.length > 0) {
        var srcPath = req.files[0].path;
        saveFile(srcPath, function (err, fileName) {
          if (err) {
            console.log('ERROR: ' + err.message);
            return res.json({error: app.errorCodes.internalServerError});
          }
          return res.json({fileUrl: createPublicUrl(fileName)});
        });
      } else {
        return res.json({error: app.errorCodes.badRequest});
      }
    },
    uploadImage: function (req, res, next) {
      req.files = _.toArray(req.files);
      if (req.files.length > 0) {
        var image = req.files[0],
          imageTypeRegex = /image\/\w+/;
        if ( imageTypeRegex.test(image.type) ) {
          var 
            srcPath = image.path,
            cropW = req.body.cropW || null,
            cropH = req.body.cropH || null,
            cropX = req.body.cropX || null,
            cropY = req.body.cropY || null,
            resizeW = req.body.resizeW || null,
            resizeH = req.body.resizeH || null,
            quality = req.body.quality || app.get('quality');

          resizeImage(srcPath, resizeW, resizeH, function (err) {
            if (err) {
              console.log('ERROR: ' + err.message);
              return res.json({error: app.errorCodes.internalServerError});
            }
            cropImage(srcPath, cropW, cropH, cropX, cropY, function (err) {
              if (err) {
                console.log('ERROR: ' + err.message);
                return res.json({error: app.errorCodes.internalServerError});
              }
              saveFile(srcPath, function (err, fileName) {
                if (err) {
                  console.log('ERROR: ' + err.message);
                  return res.json({error: app.errorCodes.internalServerError});
                }
                return res.json({imageUrl: createPublicUrl(fileName)});
              });
            });
          });

        } else {
          return res.json({error: app.errorCodes.badRequest});
        }
      } else {
        return res.json({error: app.errorCodes.badRequest});
      }
    }
  };

  return serverApi;
};