import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GpsService } from '../../services/gps.service';

// Fix for Leaflet marker icons using CDN to avoid broken images
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  
  statusMessage = '';
  isFetching = false;
  isSuccess = false;
  locationData: any = null;

  constructor(private gpsService: GpsService) {}

  ngOnInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Default location (e.g., center of India)
    this.map = L.map('map', {
      center: [ 20.5937, 78.9629 ],
      zoom: 5
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  fetchNewLocation(): void {
    this.isFetching = true;
    this.isSuccess = false;
    this.statusMessage = 'Fetching location from backend...';
    
    this.gpsService.fetchLocation().subscribe({
      next: (response) => {
        // ONLY fetch the location and show a success message. Do NOT plot.
        this.statusMessage = response.message || 'Location fetched successfully!';
        this.isSuccess = true;
        this.isFetching = false;
      },
      error: (err) => {
        this.statusMessage = 'Error fetching location: ' + (err.message || 'Unknown error');
        this.isSuccess = false;
        this.isFetching = false;
      }
    });
  }

  getLastKnownLocation(): void {
    this.isFetching = true;
    this.isSuccess = false;
    this.statusMessage = 'Getting last location...';
    
    this.gpsService.getLocation().subscribe({
      next: (response) => {
        if (response.location) {
          try {
            this.locationData = JSON.parse(response.location);
            this.updateMapWithLocation();
            this.statusMessage = 'Location successfully plotted on map.';
            this.isSuccess = true;
          } catch(e) {
            this.statusMessage = 'Failed to parse location data';
            this.isSuccess = false;
          }
        } else {
           this.statusMessage = 'No last location available';
           this.isSuccess = false;
        }
        this.isFetching = false;
      },
      error: (err) => {
        this.statusMessage = 'Error getting location: ' + (err.message || 'Unknown error');
        this.isSuccess = false;
        this.isFetching = false;
      }
    });
  }

  private updateMapWithLocation(): void {
    if (!this.map || !this.locationData) return;
    
    // The API might return an array of locations. If so, take the first one.
    const dataObj = Array.isArray(this.locationData) ? this.locationData[0] : this.locationData;
    
    if (!dataObj) return;

    const lat = dataObj.lat || dataObj.latitude;
    const lng = dataObj.lng || dataObj.longitude;

    if (lat !== undefined && lng !== undefined) {
      const position: L.LatLngExpression = [lat, lng];
      
      if (this.marker) {
        this.marker.setLatLng(position);
      } else {
        this.marker = L.marker(position).addTo(this.map);
      }
      
      // Add popup with details
      let popupContent = '<div style="font-family: Inter, sans-serif;">';
      popupContent += '<strong style="display: block; margin-bottom: 5px;">Location Details</strong>';
      if (dataObj.speed !== undefined) popupContent += `Speed: ${dataObj.speed} km/h<br>`;
      if (dataObj.address) popupContent += `Address: ${dataObj.address}<br>`;
      if (dataObj.isoDate) popupContent += `Time: ${new Date(dataObj.isoDate).toLocaleString()}<br>`;
      else if (dataObj.time) popupContent += `Time: ${dataObj.time}<br>`;
      if (dataObj.vehicleStatus) popupContent += `Status: ${dataObj.vehicleStatus}<br>`;
      popupContent += '</div>';

      this.marker.bindPopup(popupContent).openPopup();

      // Zoom in to the new location
      this.map.setView(position, 15);
    } else {
      this.statusMessage = 'Coordinates not found in the response data';
      this.isSuccess = false;
    }
  }
}
