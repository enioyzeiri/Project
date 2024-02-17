import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, QueryList } from '@angular/core';
import { CrudService } from 'src/app/crud.service';

import Map from 'ol/Map';
import View from 'ol/View';
import {Tile as TileLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import {fromLonLat, toLonLat} from 'ol/proj';import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';


@Component({
 selector: 'app-dokumenta',
 templateUrl: './dokumenta.component.html',
 styleUrls: ['./dokumenta.component.css']
})
export class DokumentaComponent implements OnInit, AfterViewInit {
 @ViewChild('addMapElement', { read: ElementRef }) addMapElement!: ElementRef;
 @ViewChild('updateMapElement', { read: ElementRef }) updateMapElement!: ElementRef;

 documents: any[] = [];
 newDocument: any = { active: false};
 updateDocumentForm: any = { active : false};
 userCustomers: any[] = [];

 showAddForm: boolean = false;
 showUpdateForm: boolean = false;

 documentValidationMessage: string = '';

 documentNameFocused: boolean = false;
 documentValueFocused: boolean = false;
 customerCodeFocused: boolean = false;
 latitudeFocused: boolean = false;
 longitudeFocused: boolean = false;

 updateDocumentNameFocused = false;
 updateDocumentValueFocused = false;
 updateCustomerCodeFocused = false;
 updateLatitudeFocused = false;
 updateLongitudeFocused = false; 

 documentNameInvalidFormat: boolean = false;
 documentValueInvalidFormat: boolean = false;

 addMap!: Map;
 updateMap!: Map;

 constructor(private crudService: CrudService) { }

 ngOnInit() {
   this.refreshDocumentList();
   this.refreshUserCustomers();
 }

 ngAfterViewInit() {
   if (this.addMapElement) {
     this.initializeMap(this.addMapElement, this.newDocument);
   }

   if (this.updateMapElement) {
     this.initializeMap(this.updateMapElement, this.updateDocumentForm);
   }
 }

 updateFormWithCoordinates(coordinates: {lat: number, lng: number}) {
   if (this.showAddForm) {
     this.newDocument.latitude = coordinates.lat;
     this.newDocument.longitude = coordinates.lng;
   } else if (this.showUpdateForm) {
     this.updateDocumentForm.latitude = coordinates.lat;
     this.updateDocumentForm.longitude = coordinates.lng;
   }
 }

 refreshUserCustomers() {
   const user = this.crudService.getUser();
   if (user) {
     this.crudService.getAllCustomers().subscribe(customers => {
       this.userCustomers = customers.filter(customer => customer.userId === user.id);
     });
   } else {
       this.userCustomers = [];
     }
   }
 
   toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newDocument = {};
      setTimeout(() => {
        this.initializeMap(this.addMapElement, this.newDocument);
      });
    }
  }
  
  toggleUpdateForm(document: any) {
    this.showUpdateForm = !this.showUpdateForm;
    if (this.showUpdateForm) {
      this.updateDocumentForm = { ...document };
      setTimeout(() => {
        this.initializeMap(this.updateMapElement, this.updateDocumentForm);
      });
    } else {
      this.updateDocumentForm = {};
    }
  }
   
  initializeMap(mapElement: ElementRef, document: any) {
    const marker = new Feature({
      geometry: new Point(fromLonLat([document.longitude || 19.8187, document.latitude || 41.3275])),
    });
  
    marker.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'https://freesvg.org/img/map-pin.png',
          scale: 0.1,
        }),
      })
    );
  
    const vectorSource = new VectorSource({
      features: [marker],
    });
  
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
  
    const map = new Map({
      target: mapElement.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: '',
          }),
        }),
        vectorLayer, // Add the vector layer to the map
      ],
      view: new View({
        center: fromLonLat([document.longitude || 19.8187, document.latitude || 41.3275]),
        zoom: 7,
      }),
      controls: [] //remove default controls
    });
  
    map.on('click', (event) => {
      const lonLat = toLonLat(event.coordinate);
      document.latitude = lonLat[1];
      document.longitude = lonLat[0];
      marker.getGeometry()?.setCoordinates(event.coordinate); // Update the marker's coordinates
    });
  }
  
  
  postDocument() {
    this.documentValidationMessage = '';
  
    const user = this.crudService.getUser();
    const lastId = Math.max(...this.documents.map(document => parseInt(document.id)));
    const createdDocument = {
      id: (lastId + 1).toString(),
      name: this.newDocument.name,
      value: Number(this.newDocument.value),
      customerCode: this.newDocument.customerCode,
      latitude: Number(this.newDocument.latitude),
      longitude: Number(this.newDocument.longitude),
      userId: user.id,
    };

    this.validateDocumentData(this.newDocument);
    if (this.newDocument.documentNameInvalidFormat || this.newDocument.documentValueInvalidFormat
      || !this.newDocument.customerCode || !this.newDocument.latitude || !this.newDocument.longitude) {
      // Reset the error messages
      this.validateDocumentData(this.newDocument).documentNameMessage = '';
      this.validateDocumentData(this.newDocument).documentValueMessage = '';
      this.validateDocumentData(this.newDocument).documentInfoMessage = ''; 
      // Set the invalid format flags to false
      this.newDocument.documentNameInvalidFormat = false;
      this.newDocument.documentValueInvalidFormat = false;
      this.documentValidationMessage = 'Ju lutemi plotësoni të gjitha fushat përkatëse!';
      return;
    }

    this.crudService.createDocument(createdDocument).subscribe(
      (data) => {
        this.refreshDocumentList();
        this.newDocument = { active: false};
        this.showAddForm = false;
        this.newDocument.resetForm();
      },
      (error) => {
        this.documentValidationMessage = error.message;
      }
    );
  }

  updateDocument() {
    this.documentValidationMessage = '';

    const updatedDocument = {
      id: this.updateDocumentForm.id,
      name: this.updateDocumentForm.name,
      value: Number(this.updateDocumentForm.value),
      customerCode: this.updateDocumentForm.customerCode,
      latitude: Number(this.updateDocumentForm.latitude),
      longitude: Number(this.updateDocumentForm.longitude),
    };

    this.validateDocumentData(this.updateDocumentForm);
    if (this.updateDocumentForm.documentNameInvalidFormat || this.updateDocumentForm.documentValueInvalidFormat
      || !this.updateDocumentForm.customerCode || !this.updateDocumentForm.latitude || !this.updateDocumentForm.longitude) {
      // Reset the error messages
      this.validateDocumentData(this.updateDocumentForm).documentNameMessage = '';
      this.validateDocumentData(this.updateDocumentForm).documentValueMessage = '';
      this.validateDocumentData(this.updateDocumentForm).documentInfoMessage = ''; 
      // Set the invalid format flags to false
      this.updateDocumentForm.documentNameInvalidFormat = false;
      this.updateDocumentForm.documentValueInvalidFormat = false;
      this.documentValidationMessage = 'Ju lutemi plotësoni të gjitha fushat përkatëse!';
      return;
    }

    this.crudService.updateDocument(updatedDocument).subscribe(
      data => {
        this.refreshDocumentList();
        this.updateDocumentForm = { active : false};
        this.showUpdateForm = false;
      },
      error => {
        this.documentValidationMessage = error.message;
      }
    );
  }
  

  deleteDocument(id: string) {
    let result = confirm('Jeni i sigurt që dëshironi ta fshini këtë dokument?\nTë gjitha të dhënat e këtij dokumenti do të fshihen!');
    if (result) {
      this.crudService.deleteDocument(id).subscribe(
        () => {
          this.refreshDocumentList();
        }
      );
    }
  }

  refreshDocumentList() {
    const user = this.crudService.getUser();
    if (user) {
      this.crudService.getAllDocuments().subscribe(documents => {
        this.documents = documents.filter(document => document.userId === user.id);
      });
    } else {
      this.documents = [];
    }
  }

  validateDocumentData(document: any): { documentNameMessage: string, documentValueMessage: string, documentInfoMessage: string} {
    const documentNamePattern = /^[A-Z]{1}[a-z]{3}(?!.*\s\s)(?!.*[@$!%*?&])[A-Za-z0-9\s]{0,6}$/;
    const documentValuePattern = /^\d{1,10}$/;
  
    document.documentNameInvalidFormat = !documentNamePattern.test(document.name);
    document.documentValueInvalidFormat = !documentValuePattern.test(document.value);
  
    let documentNameMessage = '';
    let documentValueMessage = '';
    let documentInfoMessage = '';
  
    if (document.documentNameInvalidFormat) {
      documentInfoMessage = 'Emri i dokumentit duhet të përmbajë 4 deri në 10 karaktere , mund të shtoni shkronja të mëdha (A-Z), shkronja të vogla (a-z), numra (0-9) edhe hapësira midis emrit të dokumentit por nuk mund të shtoni një karakter të veçantë (@$!%*?&)';
      if (!/^[A-Z]/.test(document.name)) {
        documentNameMessage = 'Ju duhet të filloni emrin e dokumentit me një shkronjë kapitale (A-Z)';
      } else if (document.name.slice(0, 4).includes(' ')) {
        documentNameMessage = 'Ju nuk mund të përdorni spacebar kur shkruani 4 vlerat e para të emrit te dokumentit tuaj';
      } else if (document.name.match(/[@$!%*?&]/)) {
        documentNameMessage = 'Ju nuk mund të përdorni një karakter të veçantë kur shkruani emrin te dokumentit tuaj';
      } else if (document.name.match(/\s\s/)) {
        documentNameMessage = 'Ju nuk mund të përdorni dy herë radhazi spacebar kur shkruani emrit te dokumentit tuaj';
      } else if (!/^[A-Z][a-z]{3}/.test(document.name)) {
        documentNameMessage = 'Ju duhet të vendosni të paktëm 3 shkronja të vogla mbas shkronjës së madhe që emrit te dokumentit  të jetë i vlefshëm për faqen tonë';
      }  else if (document.name.length > 10) {
        documentNameMessage = 'Emri i dokumentit nuk është i vlefshëm. Ju lutemi vendosni deri në 10 karaktere.';
      }
    }
  
    if (document.documentValueInvalidFormat) {
      if (!/\d{1}$/.test(document.value)) {
        documentValueMessage = 'Vlera e dokumentit duhet të jetë numër 1 deri ne 10 shifror';
      } else if (document.value.length > 10) {
        documentValueMessage = 'Vlera e dokumentit nuk është e vlefshme. Ju lutemi vendosni deri në 10 karaktere.'; 
      }
    }
  
    return { documentNameMessage, documentValueMessage, documentInfoMessage};
  }
  
   
}
