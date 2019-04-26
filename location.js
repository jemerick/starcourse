var map;
var autocomplete;
var marker;
var place;

var bounds = new google.maps.LatLngBounds({lat: 38.6663272841066, lng: -77.69550512656093}, {lat: 39.13976204677378, lng: -76.43207739218593})
var startPoint = {lat: 38.903178, lng: -77.066168}

var autocompleteOptions = {
  bounds: bounds,
  strictBounds: true,
}


function init() {
  map = new google.maps.Map(document.getElementById('map'), {zoom: 16, center: startPoint});

  var marker = new google.maps.Marker({
          map: map,
          anchorPoint: startPoint,
          draggable:true,
        });

  autocomplete = new google.maps.places.Autocomplete(document.getElementById("address_input"), autocompleteOptions);
  autocomplete.setFields(['geometry', 'name']);

  autocomplete.addListener('place_changed', function() {
    marker.setVisible(false);

    place = autocomplete.getPlace();
    console.log(place);

    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    console.log(place.geometry.location.lat());
    console.log(place.geometry.location.lng());

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

  });

  loadFromShareUrl();

  displayLocations(getSavedLocations());

  $('#button_clear').click(function() {
    var clear = confirm("Are you sure you want to clear all saved locations?");
    if (clear) {
      saveSavedLocations([]);
      displayLocations(getSavedLocations());
    }
  });

  $('#button_add').click(function() {
    var savedLocations = getSavedLocations();
    if (savedLocations.length === 0) {
      savedLocations.push({name: 'Start Point', location: startPoint});
    }
    savedLocations.push({name: place.name, location: {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}});

    saveSavedLocations(savedLocations);
    displayLocations(savedLocations);
  });

  $('#locations').on('click', 'a', function(e) {
    e.preventDefault();
    console.log(e.target)
    var removeLink = $(e.target);
    var index = removeLink.data('index');
    console.log(index);

    var savedLocations = getSavedLocations();
    savedLocations.splice(index, 1);
    saveSavedLocations(savedLocations);
    displayLocations(savedLocations);
  })
}

function saveSavedLocations(savedLocations) {
  window.localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
}

function getSavedLocations() {
  var savedLocationsString = window.localStorage.getItem('savedLocations') || '[]';
  var savedLocations;
  try {
    savedLocations = JSON.parse(savedLocationsString);
    if (!Array.isArray(savedLocations)) {
      savedLocations = [];
    }
  } catch(error) {
    savedLocations = [];
  }
  return savedLocations;
}

function displayLocations(savedLocations) {
  var $locations = $("#locations");
  $locations.empty();
  savedLocations.forEach(function(location, index) {
    $locations.append(
      $("<li>").append(location.name + '  ').append(
        $("<a>").data('index', index).attr('class', 'remove').attr('href', '#').append('remove')));
  });

  updateShareURL(savedLocations);
}

function updateShareURL(savedLocations) {
  var locationsArray = savedLocations.map(function(location) {
    return [location.name, location.location.lat, location.location.lng];
  });

  var encoded = Base64.encodeURI(JSON.stringify(locationsArray));
  console.log(encoded);
  var shareUrl = "/locations.html#" + encoded;
  $("#share_link").attr("href", shareUrl);
}

function loadFromShareUrl() {
  if(window.location.hash) {
    var load = confirm("do you want to load from this URL?");
    if (load) {
      try {
        var decoded = Base64.decode(window.location.hash);
        var locationArray = JSON.parse(decoded);
        var savedLocations = locationArray.map(function(location) {
          return {
            name: location[0],
            location: {
              lat: location[1],
              lng: location[2]
            }
          }
        });
        saveSavedLocations(savedLocations);
        displayLocations(savedLocations);
      } catch(error) {

      }
    }
  }
}

$(function() {
  init();
})
