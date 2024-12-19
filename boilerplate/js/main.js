var map; // Declare a variable to hold the map instance
var dataStats = {}; // Declare an object to hold data statistics

function createMap() {
    // Initialize the map and set its view to a specific location and zoom level
    map = L.map('map', {
        center: [40, -100],
        zoom: 4
    });

    // Add OpenStreetMap tile layer to the map
    var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, 
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Load the data and add it to the map
    getData(map);
}

function calcStats(data) {
    var allValues = []; // Array to hold all attribute values

    // Loop through each feature in the data
    for (var state of data.features) {
        // Loop through each year from 2013 to 2019
        for (var year = 2013; year <= 2019; year += 1) {
            var value = state.properties["commute" + year]; // Get the attribute value for the year
            if (!isNaN(value)) {
                allValues.push(Number(value)); // Add the value to the array if it's a number
            }
        }
    }

    // Calculate min, max, and mean values if there are valid values
    if (allValues.length > 0) {
        dataStats.min = Math.min(...allValues);
        dataStats.max = Math.max(...allValues);
        var sum = allValues.reduce((a, b) => a + b, 0);
        dataStats.mean = sum / allValues.length;
    } else {
        // Set default values if no valid values are found
        console.error("No valid values found in data");
        dataStats.min = 0;
        dataStats.max = 100;
        dataStats.mean = 50;
    }

    console.log("Stats calculated:", dataStats); // Log the calculated statistics
}

function calcPropRadius(attValue) {
    var minRadius = 8; // Minimum radius size
    // Calculate the radius based on the attribute value
    var radius = 1.0083 * Math.pow(attValue / minRadius, 0.5715) * minRadius;
    return radius; // Return the calculated radius
}

function pointToLayer(feature, latlng, attributes) {
    var attribute = attributes[0]; // Get the first attribute

    // Define marker options
    var options = {
        fillColor: "#ff7800", 
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var attValue = Number(feature.properties[attribute]); // Get the attribute value
    options.radius = calcPropRadius(attValue); // Calculate the radius

    // Create a circle marker layer
    var layer = L.circleMarker(latlng, options);

    // Create popup content
    var popupContent = "<p><b>State:</b> " + feature.properties.state + "</p>";
    var year = attribute.split("commute")[1];
    popupContent += "<p><b>Commute time in " + year + ":</b> " + feature.properties[attribute] + " minutes</p>";

    // Bind the popup to the layer
    layer.bindPopup(popupContent, {  
        offset: new L.Point(0, -options.radius),
    });

    return layer; // Return the layer
}

function createPropSymbols(json, map, attributes) {
    // Create GeoJSON layer and add it to the map
    L.geoJson(json, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes); // Convert points to layers
        }
    }).addTo(map);
}

function getCircleValues(attribute) {
    var min = Infinity, // Initialize min value
        max = -Infinity; // Initialize max value

    // Loop through each layer on the map
    map.eachLayer(function (layer) {
        if (layer.feature) {
            var attributeValue = Number(layer.feature.properties[attribute]); // Get the attribute value
            if (!isNaN(attributeValue)) {
                min = Math.min(min, attributeValue); // Update min value
                max = Math.max(max, attributeValue); // Update max value
            }
        }
    });

    var mean = (max + min) / 2; // Calculate mean value

    return {
        max: max,
        mean: mean,
        min: min
    };
}

function updateLegend(attribute) {
    var year = attribute.split("commute")[1]; // Extract the year from the attribute
    document.querySelector("span.year").innerHTML = year; // Update the year in the legend

    var circleValues = getCircleValues(attribute); // Get circle values for the attribute

    // Update the legend circles and text
    for (var key in circleValues) {
        var radius = calcPropRadius(circleValues[key]); // Calculate the radius
        if (isNaN(radius) || radius <= 0) {
            radius = 8; // Set default radius if invalid
        }

        var cy = 59 - radius; // Calculate the y-coordinate
        document.querySelector("#" + key).setAttribute("cy", cy); // Update the circle's y-coordinate
        document.querySelector("#" + key).setAttribute("r", radius); // Update the circle's radius
        document.querySelector("#" + key + "-text").textContent = 
            Math.round(circleValues[key]) + " minutes"; // Update the text
    }
}

function updatePropSymbols(attribute) {
    // Loop through each layer on the map
    map.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            var props = layer.feature.properties; // Get the feature properties
            var radius = calcPropRadius(props[attribute]); // Calculate the radius
            layer.setRadius(radius); // Update the layer's radius

            // Create popup content
            var popupContent = "<p><b>State:</b> " + props.state + "</p>";
            var year = attribute.split("commute")[1];
            popupContent += "<p><b>Commute Time in " + year + ":</b> " + props[attribute] + " minutes</p>";

            var popup = layer.getPopup(); // Get the layer's popup
            popup.setContent(popupContent).update(); // Update the popup content
        }
    });

    updateLegend(attribute); // Update the legend
}

function processData(json) {
    var attributes = []; // Array to hold attribute names
    var properties = json.features[0].properties; // Get the properties of the first feature

    // Loop through each property
    for (var attribute in properties) {
        if (attribute.indexOf("commute") > -1) {
            attributes.push(attribute); // Add the attribute to the array if it contains "commute"
        }
    }

    return attributes; // Return the array of attributes
}

function createSequenceControls(attributes) {
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft' // Set the position of the control
        },

        onAdd: function() {
            var container = L.DomUtil.create('div', 'sequence-control-container'); // Create a container for the control
            container.insertAdjacentHTML('beforeend', 
                '<input class="range-slider" type="range">' +
                '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>' +
                '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>'
            );

            L.DomEvent.disableClickPropagation(container); // Disable click propagation
            return container; // Return the container
        }
    });

    map.addControl(new SequenceControl()); // Add the control to the map

    // Set the range slider attributes
    document.querySelector(".range-slider").max = attributes.length - 1;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    // Add event listeners to the step buttons
    document.querySelectorAll('.step').forEach(function(step) {
        step.addEventListener("click", function() {
            var index = parseInt(document.querySelector('.range-slider').value); // Get the current index

            if (step.id == 'forward') {
                index = index >= attributes.length - 1 ? 0 : index + 1; // Increment the index
            } else if (step.id == 'reverse') {
                index = index <= 0 ? attributes.length - 1 : index - 1; // Decrement the index
            }

            document.querySelector('.range-slider').value = index; // Update the range slider value
            updatePropSymbols(attributes[index]); // Update the proportional symbols
        });
    });

    // Add event listener to the range slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        updatePropSymbols(attributes[this.value]); // Update the proportional symbols
    });
}

function createLegend(attributes) {
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function() {
            var container = L.DomUtil.create('div', 'legend-control-container');
            container.innerHTML = '<p class="temporalLegend">Commute Time in <span class="year">2013</span></p>';

            var svg = '<svg id="attribute-legend" width="160px" height="120px">';
            var circles = ["max", "mean", "min"];

            circles.forEach(function(circle, i) {
                var radius = calcPropRadius(dataStats[circle]);
                if (isNaN(radius) || radius <= 0) radius = 8;

                var cy = 30 + (i * 40);
                var textY = cy + 5;

                svg += `
                    <circle id="${circle}"
                            cx="30"
                            cy="${cy}"
                            r="${radius}"
                            fill="#F47821"
                            fill-opacity="0.8"
                            stroke="#000000"
                            stroke-width="1"/>
                    <text id="${circle}-text"
                          x="65"
                          y="${textY}"
                          font-size="12px">${Math.round(dataStats[circle])} minutes</text>
                `;
            });

            svg += "</svg>";
            container.insertAdjacentHTML('beforeend', svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
}

function getData(map) {
    // Fetch the GeoJSON data
    fetch("data/CommuteTime.geojson")
        .then(response => response.json()) // Parse the JSON response
        .then(json => {
            console.log("Data loaded:", json); // Log the loaded data
            calcStats(json); // Calculate statistics
            var attributes = processData(json); // Process the data to get attributes
            createPropSymbols(json, map, attributes); // Create proportional symbols
            createSequenceControls(attributes); // Create sequence controls
            createLegend(attributes); // Create the legend
        })
        .catch(error => {
            console.error("Error loading data:", error); // Log any errors
        });
}

// Add an event listener to create the map when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", createMap);