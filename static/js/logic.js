// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});




function createFeatures(earthquakeData) {

  
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p> Magnitude : "
     + feature.properties.mag + "</p><p>" + new Date(feature.properties.time) + "</p>" )
      
  }

  function markeropt(feature){
    if (feature.properties.mag<=1){v_fillcolor="pink";}
    if (feature.properties.mag>1 && feature.properties.mag<=2){v_fillcolor="yellow";}
    if (feature.properties.mag>2 && feature.properties.mag<=3){v_fillcolor="lightblue";}
    if (feature.properties.mag>3 && feature.properties.mag<=4){v_fillcolor="gold";}
    if (feature.properties.mag>4 && feature.properties.mag<=5){v_fillcolor="yellowgreen";}
    if (feature.properties.mag.mag>5){v_fillcolor="darkorange3";}

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
var geojsonMarkerOptions = {
            radius: feature.properties.mag*3,
            fillColor: v_fillcolor,
            color: "#000",
            weight: .5,
            opacity: 1,
            fillOpacity: 0.8
        };
        return geojsonMarkerOptions; 
      
      }
    


  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature, pointToLayer: function (feature, latlng) {return L.circleMarker(latlng, markeropt(feature));}
  });


  //Initialize Plates
  


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes)  }


  

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });


  var tectonicPlates = new L.LayerGroup();
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function (plateData) {
    L.geoJSON(plateData,
      {
        color: 'orange',
        weight: 2
      })
      .addTo(tectonicPlates);
  });    


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Gray Scale": darkmap,
    "Outdoors": outdoor
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes" : earthquakes,
    "Fault Lines": tectonicPlates
  
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellite,tectonicPlates, earthquakes]
  });



  function addlegends(){
    var legend = L.control({position: 'bottomright'});
      legend.onAdd = function (myMap) {
          var div=L.DomUtil.create('div','legend');
          var grades = [0,1,2,3,4,5];
        
    
          var color="";
          var label="";
    
          div.innerHTML +="<h4 style='margin:4px'></h4>" ;
          for(var i=0; i <grades.length; i++)
          {
            if (grades[i]==0){color="pink";label="0-1"}
            if (grades[i]==1){color="yellow";label="1-2"}
            if (grades[i]==2){color="lightblue";label="2-3"}
            if (grades[i]==3){color="gold";label="3-4"}
            if (grades[i]==4){color="yellowgreen";label="4-5"}
            if (grades[i]==5){color="darkorange3";label="5+"}
            div.innerHTML += '<font size=2 style=background color="' + color + '">'+label+'</font>' + '<br>';
          }
          return div;
      }
    legend.addTo(myMap);
    
    };
    
    addlegends();



    // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
