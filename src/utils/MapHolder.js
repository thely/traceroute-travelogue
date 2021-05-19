import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-layervisibility";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

class MapHolder {
  constructor(coords, nodeClickCallback) {
    this.path = coords;
    this.origin = coords[0];
    this.destination = coords[coords.length - 1];
    this.layers = {};
    this.callback = nodeClickCallback;

    this.map = L.map("mapContainer").setView(
      coords[0],
      6
    );

    // tile attribution (required for Leaflet)
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    this.buildNodePath();
    this.buildEndpoints();
  }

  transitionAndEnlarge(cityIndex) {
    this.map.invalidateSize();
    let speed = 2;
    // let newCity = this.$store.getters["path/getCurrentCityInfo"].coords;
    const newCity = this.path[cityIndex];

    if (cityIndex > 0) {
      const oldCity = this.path[cityIndex - 1];
      this.map.setView(oldCity, 6);

      speed = L.latLng(oldCity).distanceTo(L.latLng(newCity)) / 500000;
    }

    this.map.flyTo(newCity, 6, {
      duration: speed,
    });
  }

  toMiniMap(cityIndex) {
    // document.querySelector("#mapContainer").classList.add("mini-map");
    this.map.invalidateSize();
    this.map.setView(this.path[cityIndex], 6);
  }

  buildNodePath() {
    const line = L.polyline(this.path, {
      color: "#3cb35f",
    }); // line between path markers

    let points = [];
    let index = 0;
    // generate path markers
    for (let marker of this.path) {
      const point = L.circle(marker, {
        color: "#3cb35f",
        fillColor: "#3cb35f",
        fillOpacity: 1,
        radius: 30000,
        customIndex: index,
      });

      points.push(point);
      point.on("click", this.callback);
      index++;
    }

    this.layers["travelPath"] = L.layerGroup(points).addLayer(line).addTo(this.map);
  }

  buildEndpoints() {
    const start = L.marker(this.origin);
    const end = L.marker(this.destination);
    start.bindPopup("Zak<br />Wellington, NZ").openPopup();
    end.bindPopup("Becky<br />Charlottesville, VA, US").openPopup();

    this.layers["endpoints"] = L.layerGroup([start, end]).addTo(this.map);
  }

  switchActiveLayer(layer) {
    let others = Object.keys(this.layers);
    others.forEach((val, i) => {
      this.layers[i].hide();
    });

    this.layers[layer].show();
  }

  remove() {
    if (this.map) {
      this.map.remove();
    }
  }
}

export default MapHolder;