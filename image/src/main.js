const L = require('./leaflet-offscreen.js');

//center, zoom
const map = L.map(document.createElement('div')).setView([23.849, 121], 7);

//add marker
L.marker([25.041157,121.6143749]).addTo(map);

//draw polyline
L.polyline([[ 25.476,119.920],[ 21.766,119.920],[ 21.766,122.385],[ 25.476,122.385],[ 25.476,119.920]]).addTo(map);

//add tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

//set map size
map.setSize(1024,768);

//output
map.saveImage("/output/result.png");
