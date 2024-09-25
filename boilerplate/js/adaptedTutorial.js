// Map of GeoJSON data from MegaCities.geojson
//declare map var in global scope

var map;

//function to instantiate the leaflet map
function createMap() {
    //create the map
    map = L.map('map', {
        center: [20,0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(map);

    //call getData function
    getData();

};
//added function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };

};

//function to retreive the data and place it on the map
function getData(map) {
    //load the data
    fetch("data/MegaCities.geojson")
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                onEachFeature: onEachFeature
            }).addTo(map);
    
        })
};

document.addEventListener("DOMContentLoaded", createMap)


/*
//creates geojsonFeature variable
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball stadium",
        "popupContent": "This is where the Rockies play!"
    }, 
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
//adds feature to map
L.geoJSON(geojsonFeature).addTo(map);
//creates myLines variable 
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
//creates style for myLines
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
//adds myLines with style to map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

var myLines = [{
    "type": "LineString",
    "coordinates": [[-100,40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
//adds variable for states 
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
//creates style for state color dependent on whether republican or democrat and adds to map
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);
//creates a variable for markers of the style of the states. 
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
}
//creates a circle where geojsonFeature is located and adds to map
L.geoJSON(geojsonFeature, {
    pointToLayer: function (geojsonFeature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);
//should open popup for each feature that has popupContent property
function onEachFeature(geojsonFeature, layer) {
    // does this feature have a property named popupContent?
    if (geojsonFeature.properties && geojsonFeature.properties.popupContent) {
        layer.bindPopup(geojsonFeature.properties.popupContent);
    }
}
//creates variable for geojsonFeature 
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
//adds to map the feature and popupContent
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);

//only shows some features if true 
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

//only shows some features on the map and adds to the map
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map); */