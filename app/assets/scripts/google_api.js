import { Loader } from "@googlemaps/js-api-loader";
import API_KEY from "./apiKey";

let map;
let marker;
let infowindow;
const additionalOptions = {};

const loader = new Loader({
    apiKey: API_KEY,
    version: "weekly",
    ...additionalOptions,
});

let setCenter = { lat: 28.527582, lng: 77.0688966 };
loader.load().then(() => {
    map = new google.maps.Map(document.getElementById('google-map'), {
        center: setCenter,
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.HYBRID
        //disableDefaultUI: true
    });

    marker = new google.maps.Marker({
        position: setCenter,
        //animation: google.maps.Animation.BOUNCE
    });

    marker.setMap(map);

    infowindow = new google.maps.InfoWindow({
        content: "I am the Mareker, Yo!!!"
    });

    let zoom = map.getZoom();
    google.maps.event.addListener(marker, 'click', () => {
        map.setZoom(zoom++);
        map.setCenter(marker.getPosition());
        //infowindow.open(map, marker);
    });
});