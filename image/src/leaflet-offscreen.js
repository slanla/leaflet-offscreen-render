const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

global.window = new JSDOM('<html><head></head><body></body></html>', {
  features: {
    FetchExternalResources: ['img']
  }
}).window;
global.document = window.window.document;
global.window.navigator.userAgent = 'webkit';
global.navigator = global.window.navigator;

var CanvasImage = require('canvas').Image;
function stripQuerystring (url) {
  if (url.indexOf('?') !== -1) {
    url = url.substr(0, url.indexOf('?'));
  }
  return url;
}

const axios = require('axios');

var Image = function Image () {};
Image.prototype.__defineSetter__('src', function (src) {
  var self = this;
  function buffer2image (buffer) {
    var image = new CanvasImage();
    image.src = buffer;
    if (self.onload) {
      if( image.width &&  image.height){
        try{
          self.onload.apply(image);
        } catch (e){
          console.log('image apply error');
        }
      } else {
        console.log('image error');
      }
    }
  }
  switch (src.substr(0, 7)) {
    case 'https:/':
    case 'http://':
      axios({
        'url': src,
        'method': 'GET',
        'responseType': 'arraybuffer',
      }).then(res => {
        if(res.status==200){
          let buffer = Buffer.from(res.data, 'binary');
          buffer2image(buffer);
        } else {
          console.log('download error');  
        }
      }).catch(err => {
        console.log('download error');
      });
      break;
    case 'file://':
      // strip off file://
      src = src.substr(7);
    default: // fallthrough
      src = stripQuerystring(src);
      fs.exists(src, function (exists) {
        if (!exists) {
          console.error('Could not find image ', src);
          return;
        }
        fs.readFile(src, function (err, buffer) {
          if (err) {
            console.err(err);
            return;
          }
          buffer2image(buffer);
        });
      });
      break;
      // console.error('Image not implemented for url: ' + src);
    }
});

global.Image = Image;
global.L_DISABLE_3D = true;
global.L_NO_TOUCH = true;

const leafletPath = require.resolve('leaflet');
var L = require(leafletPath);

const path = require('path');
var scriptLength = leafletPath.split(path.sep).slice(-1)[0].length;
L.Icon.Default.imagePath = 'file://' + leafletPath.substring(0, leafletPath.length - scriptLength) + 'images/';

global.L = L;
var originalInit = L.Map.prototype.initialize;
L.Map.prototype.initialize = function (id, options) {
  options = L.extend(options || {}, {
      fadeAnimation: false,
      zoomAnimation: false,
      markerZoomAnimation: false,
      preferCanvas: true
  });

  return originalInit.call(this, id, options);
}
L.Map.prototype.getSize = function () {
  if (!this._size || this._sizeChanged) {
      this._size = new L.Point(1024, 1024);
      this._sizeChanged = false;
  }
  return this._size.clone();
};

L.Map.prototype.setSize = function (width, height) {
  this._size = new L.Point(width, height);
  this._resetView(this.getCenter(), this.getZoom());
  return this;
};

L.Map.prototype.saveImage = function (outfilename, callback) {
  const leafletImage = require('leaflet-image');
  leafletImage(this, function (err, canvas) {
    if(!err){
      var data = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(outfilename, Buffer.from(data, 'base64'));
      if (callback)
        callback(outfilename);
    }
  });  
};


module.exports = L;