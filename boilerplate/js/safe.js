// Map of GeoJSON data from MegaCities.geojson
//declare map var in global scope

var map;

//function to instantiate the leaflet map
function createMap() {
    //create the map
    map = L.map('map', {
        center: [40,-100],
        zoom: 4
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(map);

    //call getData function
    getData();

};

//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent + "Commute Times in minutes.");
    };

};


//function to retreive the data and place it on the map
function getData() {
    //load the data
    fetch("data/CommuteTime.geojson")
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            //create a Leaflet GeoJSON layer and add it to the map
            //L.geoJson(json).addTo(map);
            
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }

            onEachFeature(json)
                //create a Leaflet GeoJSON layer and add it to the map
                L.geoJson(json, {
                    onEachFeature : onEachFeature
                }).addTo(map);
            
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);

        });
};

document.addEventListener("DOMContentLoaded", createMap)





/*
function createPropSymbols(json) {
    //determine which attribute to visualize with proportional symbols
    var attribute = "commute2013";
    
    //create marker options
    var geojsonMarkerOptions = {
        
        fillColor: "#ff7800",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        radius: 8
    
    };
    
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(json, {
        pointToLayer: function (feature, latlng) {
           
           //for each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            //give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);

};
*/


//function to convert markers to circle markers
function pointToLayer(feature, latlng) {
    //determine which attribute to visualize with proportional symbols
    var attribute = "commute2013"; 

    //create marker options
    var options = {
        fillColor: "ff7800",
        color: "#000",
        weight: 1,
        opacity: 1, 
        fillOpacity: 0.8
    }

    //for each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //give each feature's circle marker  radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>State:</b> " + feature.properties.state + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "minutes.</p>";

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Average commute time in " + year + ":</b> " + feature.properties[attribute] + " minutes</p>";
    //bind the popup to the circle marker
    layer.bindPopup(popupContent);
    
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//add circle markers for point features to the map
function createPropSymbols(json, map) {
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(json, {
        pointToLayer: pointToLayer
    }).addTo(map)
};