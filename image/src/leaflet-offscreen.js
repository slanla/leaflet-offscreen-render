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
global.Image = require('./image.js');
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