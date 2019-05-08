var map;
var savedLocations;

var directionsService;
var directionsDisplay;
var geoMarker;

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

function buildGoToCurrentLocationControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginLeft = '10px';
  controlUI.style.marginBottom = '10px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Go To Currrent Location';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Go To';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    map.setCenter(geoMarker.getPosition());
    map.setZoom(18);
  });
}

function buildZoomOutControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginLeft = '10px';
  controlUI.style.marginBottom = '10px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Fit All Locations';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Fit All';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    var latlngbounds = new google.maps.LatLngBounds();

    savedLocations.forEach(function(location) {
      latlngbounds.extend(location.location);
    });

    map.fitBounds(latlngbounds);
  });
}

function init() {
  map = new google.maps.Map(document.getElementById('map'), {zoom: 16, center: startPoint});
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  geoMarker = new GeolocationMarker(map);

  var controlDiv = document.createElement('div');
  buildGoToCurrentLocationControl(controlDiv, map);
  controlDiv.index = 1;
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlDiv);

  controlDiv = document.createElement('div');
  buildZoomOutControl(controlDiv, map);
  controlDiv.index = 2;
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlDiv);

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
