import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject } from '@angular/core';
import MarkerClusterer from "@google/markerclustererplus";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-location-agency',
  templateUrl: './location-agency.component.html',
  styleUrls: ['./location-agency.component.scss']
})
export class LocationAgencyComponent implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;
  dataLocation: any;
  map: google.maps.Map;
  center: any;
  mapOptions: google.maps.MapOptions;
  marker: google.maps.Marker;
  mapMarkers: any = [];
  infoWindow: google.maps.InfoWindow;
  locations: any[];
  markerCluster: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.dataLocation = data.data.record;
   }
  ngAfterViewInit(): void {
    this.mapInit();
  }

  ngOnInit() {
    this.center = new google.maps.LatLng(this.dataLocation.latitude, this.dataLocation.longitude);
    this.mapOptions = {
      center: this.center,
      zoom: 15
    };
  }

  mapInit() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, this.mapOptions);
    this.marker = new google.maps.Marker({ position: this.center, map: this.map });
    this.infoWindow = new google.maps.InfoWindow();
    this.markerCluster = new MarkerClusterer(this.map,
      this.mapMarkers,
      { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
  }

}
