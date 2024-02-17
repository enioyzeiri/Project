import { Component, OnInit } from '@angular/core';
import { CrudService } from 'src/app/crud.service';

@Component({
  selector: 'app-klient',
  templateUrl: './klient.component.html',
  styleUrls: ['./klient.component.css']
})
export class KlientComponent implements OnInit {
  customers: any[] = [];
  newCustomer: any = { active: false };
  updateCustomerForm: any = { active: false };
  showAddForm: boolean = false;
  showUpdateForm: boolean = false;

  customerValidationMessage: string = '';

  customerCodeFocused: boolean = false;
  customerDescriptionFocused: boolean = false;

  customerCodeInvalidFormat: boolean = false;
  customerDescriptionInvalidFormat: boolean = false;


  constructor(private crudService: CrudService) { }

  ngOnInit() {
    this.refreshCustomerList();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.newCustomer = { active: false };
    }
   }
   
   toggleUpdateForm(customer: any) {
    this.showUpdateForm = !this.showUpdateForm;
    if (!this.showUpdateForm) {
      this.updateCustomerForm = { active: false };
    }
    if (this.showUpdateForm) {
      // Create a copy of the customer object
      this.updateCustomerForm = { ...customer };
    }
   }   
  

  postCustomer() {
    this.customerValidationMessage = '';
  
    const user = this.crudService.getUser();
  
    const customer = {
      customerCode: this.newCustomer.customerCode,
      customerDescription: this.newCustomer.customerDescription,
      active: this.newCustomer.active,
      userId: user.id,
    };
  
    this.validateCustomerData(this.newCustomer);
    if (this.newCustomer.customerCodeInvalidFormat || this.newCustomer.customerDescriptionInvalidFormat) {
            // Reset the error messages
        this.validateCustomerData(this.newCustomer).customerCodeMessage = '';
        this.validateCustomerData(this.newCustomer).customerDescriptionMessage = '';
        this.validateCustomerData(this.newCustomer).customerInfoMessage = '';
            // Set the invalid format flags to false
        this.newCustomer.customerCodeInvalidFormat = false;
        this.newCustomer.customerDescriptionInvalidFormat = false;
      this.customerValidationMessage = 'Ju lutemi plotësoni të gjitha fushat përkatëse!';
      return;
    }

    this.crudService.createCustomer(customer).subscribe(
      (data) => {
        this.refreshCustomerList();
        this.newCustomer = { active: false };
        this.showAddForm = false;
        this.newCustomer.resetForm();
      },
      (error) => {
        this.customerValidationMessage = error.message;
      }
    );
  }

  updateCustomer(updatedCustomer: any) {
    this.customerValidationMessage = '';
   
    if (!this.updateCustomerForm.customerCode || !this.updateCustomerForm.customerDescription) {
      this.customerValidationMessage = 'Ju lutemi plotësoni të gjitha fushat përkatëse!';
      return;
    }

    this.validateCustomerData(this.updateCustomerForm);
    if ( this.updateCustomerForm.customerCodeInvalidFormat || this.updateCustomerForm.customerDescriptionInvalidFormat) {
          // Reset the error messages
          this.validateCustomerData(this.updateCustomerForm).customerCodeMessage = '';
          this.validateCustomerData(this.updateCustomerForm).customerDescriptionMessage = '';
          this.validateCustomerData(this.updateCustomerForm).customerInfoMessage = '';
          // Set the invalid format flags to false
          this.updateCustomerForm.customerCodeInvalidFormat = false;
          this.updateCustomerForm.customerDescriptionInvalidFormat = false;
      this.customerValidationMessage = 'Ju lutemi plotësoni të gjitha fushat përkatëse!';
      return;
    }

    const updatedCustomerData = {
      customerCode: this.updateCustomerForm.customerCode,
      customerDescription: this.updateCustomerForm.customerDescription,
      active: this.updateCustomerForm.active,
      userId: this.updateCustomerForm.userId,
      id: this.updateCustomerForm.id
    };
  
    this.crudService.updateCustomer(updatedCustomerData).subscribe(
      data => {
        const index = this.customers.findIndex(customer => customer.id === updatedCustomerData.id);
        if (index !== -1) {
          this.customers[index] = updatedCustomerData;
        }
        this.updateCustomerForm = { active: false };
        this.showUpdateForm = false;
      },
      error => {
        this.customerValidationMessage = error.message;
      }
    );
}

  

deleteCustomer(customerCode: string) {
  let result = confirm('Jeni i sigurt që dëshironi të fshini këtë klient?\nTë gjitha të dhënat e këtij klienti së bashku me dokumentat e tij përkatës do të fshihen!');
  if (result) {
    this.crudService.deleteCustomer(customerCode).subscribe(
      () => {
        this.refreshCustomerList();
      }
    );
  }
} 
  

  refreshCustomerList() {
    const user = this.crudService.getUser();
    if (user) {
      this.crudService.getAllCustomers().subscribe(customers => {
        this.customers = customers.filter(customer => customer.userId === user.id);
      });
    } else {
      this.customers = [];
    }
  }

  validateCustomerData(customer: any): { customerCodeMessage: string, customerDescriptionMessage: string , customerInfoMessage: string} {
    const customerCodePattern = /^[A-Z]{2}\d{3}$/;
    const customerDescriptionPattern = /^[A-Z]{1}[a-z]{3}(?!.*\s\s)(?!.*[@$!%*?&])[A-Za-z0-9\s]{0,6}$/;
  
    customer.customerCodeInvalidFormat = !customerCodePattern.test(customer.customerCode);
    customer.customerDescriptionInvalidFormat = !customerDescriptionPattern.test(customer.customerDescription);
  
    let customerCodeMessage = '';
    let customerDescriptionMessage = '';
    let customerInfoMessage = '';

    if (customer.customerCodeInvalidFormat) {
       if (!/^[A-Z]{2}/.test(customer.customerCode)) {
        customerCodeMessage = 'Ju duhet të filloni kodin e klientit me dy shkronja të barabarta të njëpasnjëshme kapitale (Shembull : "KK" ose "PP")';
      } else if (!/\d{3}$/.test(customer.customerCode)) {
        customerCodeMessage = 'Ju duhet të shkruani te pakten 3 numra nga 0 deri ne 9 (Shembull : "001" ose "002")';
      } else {
        customerCodeMessage = 'Kodi i klientit nuk është i vlefshëm. Ju lutemi vendosni deri në 5 karaktere.';
      }
    }
  
    if (customer.customerDescriptionInvalidFormat) {
      customerInfoMessage = "Përshkrimi i klientit duhet të përmbajë 4 deri në 10 karaktere , mund të shtoni shkronja të mëdha (A-Z), shkronja të vogla (a-z), numra (0-9) edhe hapësira midis përshkrimit të klientit por nuk mund të shtoni një karakter të veçantë (@$!%*?&)";
      if (!/^[A-Z]/.test(customer.customerDescription)) {
        customerDescriptionMessage = 'Ju duhet të filloni përshkrimin e klientit me një shkronjë kapitale (A-Z)';
      } else if (customer.customerDescription.slice(0, 4).includes(' ')) {
        customerDescriptionMessage = 'Ju nuk mund të përdorni spacebar kur shkruani 4 vlerat e para të përshkrimit të klientit tuaj';
      } else if (customer.customerDescription.match(/[@$!%*?&]/)) {
        customerDescriptionMessage = 'Ju nuk mund të përdorni një karakter të veçantë kur shkruani përshkrimin e klientit tuaj';
      } else if (customer.customerDescription.match(/\s\s/)) {
        customerDescriptionMessage = 'Ju nuk mund të përdorni dy herë radhazi spacebar kur shkruani përshkrimin e klientit tuaj';
      } else if (!/^[A-Z][a-z]{3}/.test(customer.customerDescription)) {
        customerDescriptionMessage = 'Ju duhet të vendosni të paktëm 3 shkronja të vogla mbas shkronjës së madhe që përshkrimi i klientit të jetë i vlefshëm për faqen tonë';
      }  else if (customer.customerDescription.length > 10) {
        customerDescriptionMessage = 'Përshkrimi i klientit nuk është i vlefshëm. Ju lutemi vendosni deri në 10 karaktere.';
      }
    }
  
    return { customerCodeMessage, customerDescriptionMessage , customerInfoMessage};
  }
  
}
