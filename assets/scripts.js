var CLIENT_ID = '493611924506-dcpheb2km05mqreg1bq4dajp9uunco9p.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBejCs5B1BO5mDADRtHhtUxqY6jLomKGR4';
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
var spreadsheetId = '19OjLYb5OdE_rcO1K7x0sU9OyXT8AYYj-srGbdCVw1hQ';


var rasterId = 'cjw4bb2dl1rts1cngczbgd0p4';
var vectorId = 'cjw8l18xj25s61cnmvc82zxbe';
var accessToken = 'pk.eyJ1IjoiY29yZXl0ZWdlbGVyIiwiYSI6ImNpd25xNjU0czAyeG0yb3A3cjdkc2NleHAifQ.EJAjj38qZXzIylzax3EMWg';

var rasterUrl = 'https://api.mapbox.com/styles/v1/coreytegeler/'+rasterId+'/tiles/{z}/{x}/{y}?access_token='+accessToken;
var vectorUrl = 'https://api.mapbox.com/styles/v1/coreytegeler/'+vectorId+'/tiles/{z}/{x}/{y}?access_token='+accessToken;

var map, rows, headers, entries;

// function clickMarker(e) {
// 	e.originalEvent.target.classList.toggle('active');
// }

function openPopup(e) {
	e.target._icon.classList.add('active');
}

function closePopup(e) {
	e.target._icon.classList.remove('active');
}

function plotPoint(pointObj) {
	var coordsArr = pointObj[6].split(',');
	var coords = [Number(coordsArr[0]), Number(coordsArr[1])];
	var popupHtml = `<div class="popup-label">${pointObj[0]}</div>`;
	var props = {};

	var markerHtml = `<div class="marker-label"><div class="marker-label-inner">${pointObj[0]}</div><div class="leaflet-popup-tip-container"><div class="leaflet-popup-tip"></div></div></div>`;
	var markerIcon = L.divIcon({
		className: 'marker',
		iconSize: 30,
		html: markerHtml
	});
	var marker = L.marker(coords, {
		icon: markerIcon
	});
	marker.addTo(map);
	pointObj.forEach(function(field, i) {
		if(i && field) {
			var header = headers[i];
			popupHtml += `<div class="popup-field"><div class="popup-field-label">${header}</div><div class="popup-field-value">${field}</div></div>`;
			props[header] = field;
			// marker._icon.attribu[slugify(header)] = field;
			marker._icon.setAttribute('data-'+slugify(header), slugify(field));
			// console.log(slugify(header), marker);
		}
	});

	var popup = marker.bindPopup(popupHtml);
	popup.on('popupopen', openPopup);
	popup.on('popupclose', closePopup);
}

function plotPoints() {
	rows.forEach(function(row) {
		plotPoint(row);
	});
}

function createMap() {
	map = L.map('map').setView([6.437879, 3.957112], 9);
	var rasterLayer = L.tileLayer(rasterUrl, {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	rasterLayer.setUrl(vectorUrl);


	// L.Path('https://api.mapbox.com/styles/v1/'+mapId+'/tiles/{z}/{x}/{y}?access_token='+accessToken, {
	// 		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	// }).addTo(map);

	plotPoints();
}

function createFilter() {
// 	// var fieldsets = document.querySelectAll('fieldset.options');
// 	headers.forEach(function(header, i) {
// 		// console.log(header, slugify(header));
// 		var slug = slugify(header);
// 		var fieldset = document.querySelector('fieldset[data-filter="'+slug+'"]');
// 		console.log(slug);
// 		console.log(rows[i]);
// 	});

	var inputs = document.querySelectorAll('input[type="radio"]');
	inputs.forEach(function(input) {
		input.addEventListener('change', function(e) {
			var value = e.target.value;
			var name = e.target.name;
			var markers = document.querySelectorAll('.marker');
			markers.forEach(function(marker) {
				if(marker.getAttribute('data-'+slugify(name)) == value || value == 'all') {
					marker.classList.remove('hide');
				} else {
					marker.classList.add('hide');
				}
			});
		});
	})
}

function handleData() {
	headers = rows[0];
	rows.shift();
	createMap();
	createFilter();
}

function makeApiCall() {
	var params = {
		spreadsheetId: spreadsheetId,
		range: 'A:Z',
		majorDimension: 'ROWS'
	};

	var request = gapi.client.sheets.spreadsheets.values.get(params);
	request.then(function(response) {
		rows = response.result.values;
		handleData();
	}, function(reason) {
		console.error('error: ' + reason.result.error.message);
	});
}


function initClient() {
	gapi.client.init({
		'apiKey': API_KEY,
		'clientId': CLIENT_ID,
		'scope': SCOPE,
		'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
	}).then(function() {
		makeApiCall();
	});
}

function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

function slugify(string) {
	return string
		.toLowerCase()
		.replace(/ /g,'-')
		.replace(/[^\w-]+/g,'-');
}