import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CrudService {
    private apiServer = "http://localhost:4000"
    private currentUser: any;
    constructor(private httpClient: HttpClient) { }
    
    getAllUsers() {
      return this.httpClient.get<any[]>(`${this.apiServer}/users`);
    }
        
    setUser(user: any) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    getUser() {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    
    getUserByEmail(email: string) {
      return this.getAllUsers().pipe(
        map((users: any[]) => users.find((user: any) => user.email === email))
      );
    }

    getUserByUsername(username: string) {
      return this.getAllUsers().pipe(
        map((users: any[]) => users.find((user: any) => user.username === username))
      );
     }

    getLastUserId() {
      return this.getAllUsers().pipe(
        map((users: any[]) => Math.max(...users.map(user => parseInt(user.id))))
      );
    } 
      
    createUser(user: any): Observable<any> {
      return this.httpClient.post<any>(`${this.apiServer}/users`, user);
    }

    getUserByEmailAndPassword(email: string, password: string) {
      return this.getAllUsers().pipe(
        map(users => users.find(user => user.email === email && user.password === password))
      );
    }

    // klient component crud operations
    getAllCustomers(): Observable<any[]> {
      return this.httpClient.get<any[]>(`${this.apiServer}/customers`);
    }
        
    createCustomer(customer: any): Observable<any> {
      return this.getAllCustomers().pipe(
        switchMap((customers: any[]) => {
          const existingCustomerCode = customers.find(c => c.customerCode === customer.customerCode);
          const existingCustomerDescription = customers.find(c => c.customerDescription === customer.customerDescription);
          if (existingCustomerCode) {
            throw new Error('Një klient me këtë kod klienti ekziston në këtë website!\nJu lutemi vendosni një kod klienti tjetër');
          } else if (existingCustomerDescription) {
            throw new Error('Një klient me këtë përshkrim klienti ekziston në këtë website!\nJu lutemi vendosni një përshkrim klienti tjetër');
          } else {
            return this.httpClient.post<any>(`${this.apiServer}/customers`, customer);
          }
        })
      );
    }

    updateCustomer(customer: any): Observable<any> {
      return this.getAllCustomers().pipe(
        switchMap((customers: any[]) => {
          const existingCustomerCode = customers.find(c => c.customerCode === customer.customerCode && c.id !== customer.id);
          const existingCustomerDescription = customers.find(c => c.customerDescription === customer.customerDescription && c.id !== customer.id);
          if (existingCustomerCode) {
            throw new Error('Një klient me këtë kod klienti ekziston në këtë website!\nJu lutemi vendosni një kod klienti tjetër');
          } else if (existingCustomerDescription) {
            throw new Error('Një klient me këtë përshkrim klienti ekziston në këtë website!\nJu lutemi vendosni një përshkrim klienti tjetër');
          } else {
            return this.httpClient.put<any>(`${this.apiServer}/customers/${customer.id}`, customer);
          }
        })
      );
    }
    
    getCustomerByCode(customerCode: string) {
      return this.getAllCustomers().pipe(
        map((customers: any[]) => customers.find((customer: any) => customer.customerCode === customerCode))
      );
    }

    deleteCustomer(customerCode: string): Observable<any> {
      return this.getCustomerByCode(customerCode).pipe(
        switchMap((customer: any) => {
          const customerId = customer.id;
          return this.getAllDocuments().pipe(
            switchMap((documents: any[]) => {
              const documentsToDelete = documents.filter(document => document.customerCode === customer.customerCode);
              if (documentsToDelete.length === 0) {
                return of(null);
              }

              const deleteDocumentObservables = documentsToDelete.map(
                document => this.deleteDocument(document.id)
              );
              return forkJoin(deleteDocumentObservables);
            }),

            switchMap(() => this.httpClient.delete<any>(`${this.apiServer}/customers/${customerId}`))
          );
        })
      );
    }
    
     
    
    // dokumenta component crud operations
    getAllDocuments(): Observable<any[]> {
      return this.httpClient.get<any[]>(`${this.apiServer}/documents`);
    }
    
    getDocumentsByUserId(userId: string): Observable<any[]> {
      return this.getAllDocuments().pipe(
        map((documents: any[]) => documents.filter(document => document.userId === userId))
      );
    }
    
    createDocument(document: any): Observable<any> {
    const user = this.getUser();
    document.userId = user.id;
    return this.getAllDocuments().pipe(
      switchMap((documents: any[]) => {
        const existingDocumentName = documents.find(d => d.name === document.name);
        const existingDocumentValue = documents.find(d => d.value === document.value);
        const existingDocumentLocation = documents.find(d => d.latitude === document.latitude && d.longitude === document.longitude);
          if (existingDocumentName) {
            throw new Error('Një dokument me këtë emër ekziston në këtë website!\nJu lutemi, vendosni një emër tjetër dokumenti');
          } else if (existingDocumentValue) {
            throw new Error('Një dokument me këtë vlerë ekziston në këtë website!\nJu lutemi, vendosni një vlerë tjetër dokumenti');
          } else if (existingDocumentLocation) {
            throw new Error('Një dokument me këtë latitude dhe longtitude ekziston në këtë website!\nJu lutemi, vendosni vlera të tjera');
          } else {
            return this.httpClient.post<any>(`${this.apiServer}/documents`, document);
          }
         })
        );
    }

    updateDocument(document: any): Observable<any> {
      const user = this.getUser();
      document.userId = user.id;
      return this.getAllDocuments().pipe(
        switchMap((documents: any[]) => {
          const existingDocumentName = documents.find(d => d.name === document.name && d.id !== document.id);
          const existingDocumentValue = documents.find(d => d.value === document.value && d.id !== document.id);
          const existingDocumentLocation = documents.find(d => d.latitude === document.latitude && d.longitude === document.longitude && d.id !== document.id);
            if (existingDocumentName) {
              throw new Error('Një dokument me këtë emër ekziston në këtë website!\nJu lutemi, vendosni një emër tjetër dokumenti');
            } else if (existingDocumentValue) {
              throw new Error('Një dokument me këtë vlerë ekziston në këtë website!\nJu lutemi, vendosni një vlerë tjetër dokumenti');
            } else if (existingDocumentLocation) {
              throw new Error('Një dokument me këtë latitude dhe longtitude ekziston në këtë website!\nJu lutemi, vendosni vlera të tjera');
            } else {
              return this.httpClient.put<any>(`${this.apiServer}/documents/${document.id}`, document);
            }
          })
        );
      }

      deleteDocument(id: string): Observable<any> {
      return this.httpClient.delete<any>(`${this.apiServer}/documents/${id}`);
      }

}