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

//PopupContent constructor function
function PopupContent(properties, attribute) {
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("commute")[1];
    this.commute = this.properties[attribute];
    this.formatted = "<p><b>state:</b> " + this.properties.state + "</p><p><b>Commmute in " + this.year + ": </b>" + this.commute + " minutes</p>"; 
};

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
    var minRadius = 7; 
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
    var popupContent = new PopupContent(feature.properties, attribute);
    
    //bind the popup to the circle marker
    layer.bindPopup(popupContent.formatted, {  offset: new L.Point(0,-options.radius)    });

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
function createSequenceControls(attributes) { //changed to accept the 'attributes' array as a parameter
    
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function() {
            
            //create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class = "range-slider" type = "range">') 
            
            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class = "step" id = "reverse" title = Reverse"><img src = "img/reverse.png"></button>');
            container.insertAdjacentHTML('beforeend', '<button class = "step" id = "forward" title = "Forward"><img src = "img/forward.png"></button>');

            
            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            //set

            //...initialize other DOM elements

            return container;

        }
    });

    map.addControl(new SequenceControl()); //add listeners after adding control}
    

    //pass new attribute to update symbols initially
    updatePropSymbols(attributes[0]); //start with the first attribute

    //set slider attributes dynamically based on number of attributes
    document.querySelector(".range-slider").max = attributes.length - 1;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;  

    //click listener for buttons
    document.querySelectorAll('.step').forEach(function(step) {
        step.addEventListener("click", function() {
            var index = document.querySelector('.range-slider').value;   
            
            // increment or decrement depending on button clicked
            if (step.id == 'forward') {
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > attributes.length - 1 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                //if past the first attribute wrap around to the last attribute
                index = index < 0 ? attributes.length - 1 : index;
            }

            //update slider
            document.querySelector('.range-slider').value = index;

            //pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        });

    });

}

//resize proportional symbols according to new attribute values
function updatePropSymbols(attribute) {
    map.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            
            var props = layer.feature.properties;

            //update each feature's radius based on the new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //update popup content
            var popupContent = createPopupContent(props, attribute);
            //update popup with new content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();

            layer.bindPopup(popupContent).openPopup();
        }
    
    });

    function createLegend(attributes) {
        var LegendControl = L.Control.extend( {
            options: {
                position: 'bottomright'
            },
    
            onAdd: function () {
                //create the control container with a particular class name
                var container = L.DomUtil.create('div', 'legend-control-container');
        
                //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
                var legendContent = "<p><b>Commute Time:</b> " + attributes + "</p>";

                return container;
            }
        });
    
        map.addControl(new LegendControl());
    };
     
}


//a consolidated popup-content-creation function 
function createPopupContent(properties, attribute) {
    //add state to popup content string
    var popupContent = "<p><b>State:</b> " + properties.state + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("commute")[1];
    popupContent += "<p><b>Average commute in " + year + ": </b>" + properties[attribute] + " minutes</p>";

    return popupContent;
};


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
        }
    }

    //check result
    //console.log(attributes);

    return attributes;
}


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
            createPropSymbols(json, map, attributes); //pass the map here and pass the attributes to createPropSymbols
            createSequenceControls(attributes);  //pass attributes to createSequenceControls
        });
}


//add event listener for DOMContentLoaded to create the map
document.addEventListener("DOMContentLoaded", createMap)