// Example from Leaflet Quick Start Guide

var map = L.map('map').setView([51.505, -0.09], 13);

//add tile layer
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);
//creates marker at a specific location and adds to map
var marker = L.marker([51.5, -0.09]).addTo(map);
//creates a circle, tells it where to go and indicates color and opacity and size etc. adds to map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

//creates a polygon, tells it where to go
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//defines popups for the markers previously created and binds them to specific markers.
marker.bindPopup("<b>Hello world!</b><br> I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//creates a popup that stands alone, does not need to be clicked
var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

//creates a function for clicks anywhere on the map and returns a popup and new lat/long
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent('You clicked the map at ' + e.latlng.toString())
        .openOn(map);
}
//runs function 
map.on('click', onMapClick);
