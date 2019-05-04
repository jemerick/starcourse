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

function arrayMove(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};


function init() {
  map = new google.maps.Map(document.getElementById('map'), {zoom: 16, center: startPoint});

  marker = new google.maps.Marker({
          map: map,
          anchorPoint: startPoint,
          draggable:true,
        });

  autocomplete = new google.maps.places.Autocomplete(document.getElementById("address_input"), autocompleteOptions);
  autocomplete.setFields(['geometry', 'name']);

  autocomplete.addListener('place_changed', function() {
    marker.setVisible(false);

    place = autocomplete.getPlace();

    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

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

    savedLocations.push({name: place.name, location: {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}});

    saveSavedLocations(savedLocations);
    displayLocations(savedLocations);

    $("#address_input").val('');
  });

  $('#button_marker').click(function() {
    var savedLocations = getSavedLocations();

    var name = $("#address_input").val();

    savedLocations.push({name: name, location: {lat: marker.getPosition().lat(), lng: marker.getPosition().lng()}});

    saveSavedLocations(savedLocations);
    displayLocations(savedLocations);

    $("#address_input").val('');
  });

  $('#button_lat_lng').click(function() {
    var savedLocations = getSavedLocations();

    var data = $("#address_input").val().split(',');
    var name = data[0];
    var lat = parseFloat(data[1]);
    var lng = parseFloat(data[2]);

    savedLocations.push({name: name, location: {lat: lat, lng: lng}});

    saveSavedLocations(savedLocations);
    displayLocations(savedLocations);

    $("#address_input").val('');
  });

  function addCurrentPosition(position) {
    var savedLocations = getSavedLocations();

    var name = 'Current Location';
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    savedLocations.push({name: name, location: {lat: lat, lng: lng}});

    saveSavedLocations(savedLocations);
    displayLocations(savedLocations);

    $("#address_input").val('');
  }

  $('#button_current_location').click(function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(addCurrentPosition);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });

  $('#locations').on('click', 'a', function(e) {
    e.preventDefault();

    var targetLink = $(e.target);
    var index = targetLink.data('index');
    var savedLocations = getSavedLocations();

    if (targetLink.hasClass('remove')) {
      savedLocations.splice(index, 1);
    } else if (targetLink.hasClass('start')) {
      arrayMove(savedLocations, index, 0);
    } else if (targetLink.hasClass('end')) {
      arrayMove(savedLocations, index, savedLocations.length - 1);
    }

    saveSavedLocations(savedLocations);
    displayLocations(savedLocations);
  });

  var clipboard = new ClipboardJS('#share_link', {
    text: function(trigger) {
        return $(trigger).data('href');
    }
  });

  clipboard.on('success', function(e) {
      alert("Copied to your clipboard");
  });
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
    var $li = $("<li>").attr('class', 'my-2').append(location.name + '<br>');
    $li.append($("<a>").data('index', index).attr('class', 'remove').attr('href', '#').append('remove'));
    $li.append('&nbsp;&nbsp;&nbsp;');
    $li.append($("<a>").data('index', index).attr('class', 'start text-success').attr('href', '#').append('start'));
    $li.append('&nbsp;&nbsp;&nbsp;');
    $li.append($("<a>").data('index', index).attr('class', 'end text-danger').attr('href', '#').append('end'));
    $locations.append($li);
  });

  updateShareURL(savedLocations);
}

function updateShareURL(savedLocations) {
  var locationsArray = savedLocations.map(function(location) {
    return [location.name, location.location.lat, location.location.lng];
  });
  var compressed = LZString.compressToEncodedURIComponent(JSON.stringify(locationsArray));

  var shareUrl = window.location.href + (window.location.href.endsWith("#") ? "" : "#") + compressed;
  $("#share_link").data("href", shareUrl);
}



function loadFromShareUrl() {
  if(window.location.hash) {
    var load = confirm("do you want to load from this URL?");
    if (load) {
      try {
        var decoded = LZString.decompressFromEncodedURIComponent(window.location.hash.substr(1));
        console.log(decoded)
        var locationArray = JSON.parse(decoded);
        console.log(locationArray)
        var savedLocations = locationArray.map(function(location) {
          console.log(location);
          return {
            name: location[0],
            location: {
              lat: location[1],
              lng: location[2]
            }
          }
        });
        console.log(savedLocations);
        saveSavedLocations(savedLocations);
        displayLocations(savedLocations);
      } catch(error) {

      }
    }
  }
  window.location.hash = '';
}

$(function() {
  init();
})
