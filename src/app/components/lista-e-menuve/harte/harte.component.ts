import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CrudService } from 'src/app/crud.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { Coordinate } from 'ol/coordinate';
import { Pixel } from 'ol/pixel';

@Component({
 selector: 'app-harte',
 templateUrl: './harte.component.html',
 styleUrls: ['./harte.component.css']
})
export class HarteComponent implements OnInit {
 @ViewChild('mapContainer') mapContainer!: ElementRef;
 documents: any[] = [];
 customers: any[] = [];
 loggedInUser: any;
 currentDocument: any;
 center: any;
 zoom!: number;
 lastClickedFeature: Feature | null = null;

 constructor(private crudService: CrudService) { }

 ngOnInit() {
 this.zoom = 3;
 
 this.loggedInUser = this.crudService.getUser();
 if (this.loggedInUser) {
 this.crudService.getDocumentsByUserId(this.loggedInUser.id).subscribe(data => {
 this.documents = data;
 
 if (this.documents.length > 0) {
 let totalLat = this.documents.reduce((total, document) => total + document.latitude, 0);
 let totalLng = this.documents.reduce((total, document) => total + document.longitude, 0);
 
 this.center = {
 lat: totalLat / this.documents.length,
 lng: totalLng / this.documents.length
 };

 // krijon harten
 const map = new Map({
 target: this.mapContainer.nativeElement,
 layers: [
 new TileLayer({
 source: new OSM()
 })
 ],
 view: new View({
 center: fromLonLat([this.center.lng, this.center.lat]),
 zoom: this.zoom
 }),
 controls: [] // Heq të gjitha kontrollet e openlayers (zoom-in/out etj)
});

 // Ndryshon mausin në hartë
 map.on('pointermove', (evt) => {
    if (map.hasFeatureAtPixel(evt.pixel)) {
      map.getViewport().style.cursor = 'pointer';
    } else {
      map.getViewport().style.cursor = '';
    }
   });

 // Krijon një mbivendosje për dritaren e informacionit
 const overlay = new Overlay({
 element: document.getElementById('info-window')!,
 positioning: 'bottom-center',
 stopEvent: false,
 offset: [0, -50]
 });
 map.addOverlay(overlay);

map.on('singleclick', (evt: { pixel: Pixel; coordinate: Coordinate | undefined; }) => {
   map.forEachFeatureAtPixel(evt.pixel, (feature) => {
     if (feature === this.lastClickedFeature) {
       document.getElementById('info-window')!.style.display = 'none';
       this.lastClickedFeature = null;
       return;
     }
  
     const infoWindowName = document.getElementById('info-window-name')!;
     const infoWindowValue = document.getElementById('info-window-value')!;
     const infoWindowCustomerDescription = document.getElementById('info-window-customerDescription')!;
     const infoWindowCustomerCode = document.getElementById('info-window-customerCode')!;
     const infoWindowCustomerActiveStatus = document.getElementById('info-window-customerActiveStatus')!;
  
     // Merrni emrin e klientit dhe statusin aktiv nga customers[]
     const customer = this.getCustomer(feature.getProperties());
     const customerDescription = customer ? customer.customerDescription : 'Unknown'; 
     const customerActiveStatus = customer ? customer.active : 'Unknown';
  
     //Per ti shfaqur vlerat ne harte
     infoWindowName.innerHTML = `<h5>${feature.get('name')}</h5>`;
     infoWindowValue.innerHTML = `<p>Vlera: ${feature.get('value')}</p>`;
     infoWindowCustomerDescription.innerHTML = `<p>Përshkrimi i klientit: ${customerDescription}</p>`; 
     infoWindowCustomerCode.innerHTML = `<p>Kodi i klientit: ${feature.get('customerCode')}</p>`;
     infoWindowCustomerActiveStatus.innerHTML = `<p>Statusi Aktiv: ${customerActiveStatus}</p>`;
  
     overlay.setPosition(evt.coordinate);
     document.getElementById('info-window')!.style.display = 'block';
  
     this.lastClickedFeature = feature as Feature;
   });
});

 this.addMarkers(map, this.documents);
 }
 });
 }
 
 this.crudService.getAllCustomers().subscribe(data => {
 this.customers = data;
 });
 }

 getCustomer(document: any) {
 return this.customers.find(c => c.customerCode === document.customerCode);
 }

 private addMarkers(map: Map, documents: any[]) {
 const markerStyle = new Style({
 image: new Icon({
 anchor: [0.5, 1],
 anchorXUnits: 'fraction',
 anchorYUnits: 'fraction',
 src: 'https://freesvg.org/img/map-pin.png',
 scale: 0.1
}),
});

const markers = documents.map(document => {
  const marker = new Feature({
    geometry: new Point(fromLonLat([document.longitude, document.latitude]))
  });
  marker.setStyle(markerStyle);
  marker.setProperties(document);
  return marker;
});


const vectorSource = new VectorSource({
features: markers
});

const markerVectorLayer = new VectorLayer({
source: vectorSource
});

map.addLayer(markerVectorLayer);
}
}
