const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiZGlieWE0NTAiLCJhIjoiY20zNndudjhoMDlwazJzcHA0dzZjOW94NSJ9.OmAMvlS7lpC87PWK4938aQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/dibya450/cm36xm6nb01ck01pi2stk4aoo/draft',
  scrollZoom: false,
  //   projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
  //   zoom: 1,
  //   center: [30, 15],
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add popup
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHtml(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extends map bounds to include current location
  bounds.extends(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
