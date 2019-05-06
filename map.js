var map;
var savedLocations;

var directionsService;
var directionsDisplay;

var bounds = new google.maps.LatLngBounds({lat: 38.6663272841066, lng: -77.69550512656093}, {lat: 39.13976204677378, lng: -76.43207739218593})
var startPoint = {lat: 38.903178, lng: -77.066168}

function clearMarkers() {
  savedLocations.forEach(function(location) {
    location.marker.setMap(null);
  });
}

function calculateDirections() {
  var waypoints = savedLocations.slice(1, savedLocations.length - 1).map(function(location) {
    return {
      location: location.location,
      stopover: true,
    }
  });

  var directionsRequest = {
    origin: savedLocations[0].location,
    destination: savedLocations[savedLocations.length - 1].location,
    travelMode: 'WALKING',
    waypoints: waypoints,
    optimizeWaypoints: true,
    avoidFerries: true
  };

  directionsService.route(directionsRequest, function(result, status) {
    if (status == 'OK') {
      clearMarkers();
      directionsDisplay.setDirections(result);
    } else {
      alert('Error getting directions: ' + status);
    }
  });

}

function init() {
  map = new google.maps.Map(document.getElementById('map'), {zoom: 16, center: startPoint});
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  var GeoMarker = new GeolocationMarker(map);

  var savedLocationsString = window.localStorage.getItem('savedLocations') || '[]';

  try {
    savedLocations = JSON.parse(savedLocationsString);
  } catch(error) {
    savedLocations = [];
  }

  var latlngbounds = new google.maps.LatLngBounds();

  savedLocations.forEach(function(location) {
    latlngbounds.extend(location.location);

    location.marker = new google.maps.Marker({
      position: location.location,
      map: map,
      title: location.name
    });
    location.infoWindow = new google.maps.InfoWindow({
      content: location.name,
    });
    location.marker.addListener('click', function() {
      location.infoWindow.open(map, location.marker);
    });
  });

  map.fitBounds(latlngbounds);
}


$(function() {
  init();
  $("#calculate_route").click(calculateDirections);

  $('#show_map').click(function() {
    $("#directionsPanel").hide();
    $("#map").show();
  });

  $('#show_directions').click(function() {
    $("#map").hide();
    $("#directionsPanel").show();
  });
})
