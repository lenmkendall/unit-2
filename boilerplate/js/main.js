// Map of GeoJSON data from MegaCities.geojson
//declare map var in global scope
//declare minValue in global scope

var map;
var minValue;

//function to instantiate the leaflet map
function createMap() {
    
    //create the map
    map = L.map('map', {
        center: [40,-100],
        zoom: 4
    });


    //add OSM base tilelayer
    var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, 
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

    //call getData function
    getData(map);

}


//function to calculate the minimum value in the dataset
function calculateMinValue(json) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each State
    for(var state of json.features){
        //loop through each year
        for(var year = 2013; year <= 2019; year+=1){
            //get commute time for current year
            var value = state.properties["commute"+ String(year)];
            //add value to array
            allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

//calculate the radius of each proportional sympbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5; 
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
}

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes) {
    //determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check
    console.log(attribute);

    //create marker options
    var options = {
        fillColor: "#ff7800", 
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //for each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]); 

    //give each feature's circle marker radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create a circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>State:</b> " + feature.properties.state + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "minutes.</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //Return the circle marker to the L.geoJson pointToLayer option
    return layer; 
}

//function to add circle markers for point features to the map
function createPropSymbols(json, map, attributes) {
    //create a Leaflet GeoJSON layer and add it to the map 
    L.geoJson(json, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//create new sequence controls
function createSequenceControls() {
    //create range input element (slider)
    var slider = "<input class = 'range-slider' type = 'range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);
    //pass new attribute to update symbols
    updatePropSymbols(attributes[index]);


    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //add step buttons
    document.querySelector("#panel").insertAdjacentHTML('beforeend','<button class ="step" id = "reverse">BACK</button>');
    document.querySelector("#panel").insertAdjacentHTML('beforeend','<button class = "step" id = "forward">FWD</button>');
    

    //click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;   
            
            // increment or decrement depending on button clicked
            if (step.id == 'forward') {
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                //if past the first attribute wrap around to the last attribute
                index = index < 0 ? 6 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index;
            //pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })

    })

};

//resize proportional symbols according to new attribute values
function updatePropSymbols(attribute) {
    map.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            //update the layer style and popup
        }
    })
}


//build an attributes array from the data
function processData(json) {
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = json.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties) {
        //only take attributes with population values
        if (attribute.indexOf("commute") > -1) {
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};


//import GeoJSON data
function getData(map) {
    //load the data
    fetch("data/CommuteTime.geojson")
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            //create an attributes array
            var attributes = processData(json);
            
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, map, attributes); //pass the map here
            createSequenceControls(attributes);
        })
};


//add event listener for DOMContentLoaded to create the map
document.addEventListener("DOMContentLoaded", createMap)