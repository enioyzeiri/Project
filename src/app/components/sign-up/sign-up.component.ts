import { Component } from '@angular/core';
import { CrudService } from 'src/app/crud.service';
import { NavigationService } from 'src/app/navigation.service';

@Component({
 selector: 'app-sign-up',
 templateUrl: './sign-up.component.html',
 styleUrls: ['./sign-up.component.css']
})

export class SignUpComponent {
 name: string = '';
 username: string = '';
 email: string = '';
 password: string = '';
 age!: number;

 showPassword: boolean = false;
 isFormValid: boolean = false;

 //per mesazhet poshte teksteve input
 nameFocused: boolean = false;
 nameInvalidFormat: boolean = false;
 nameMessage: string = '';
 nameInfoMessage: string = '';

 usernameFocused: boolean = false;
 usernameInvalidFormat: boolean = false;
 usernameMessage: string = '';
 usernameInfoMessage: string = '';

 emailFocused: boolean = false;
 emailInvalidFormat: boolean = false;
 emailMessage: string = '';

 passwordFocused: boolean = false;
 passwordInvalidFormat: boolean = false;
 passwordErrorMessage: string = '';
 passwordInfoMessage: string = '';

 ageFocused: boolean = false;
 ageInvalidFormat: boolean = false;
 ageMessage: string = '';

 validationMessage: string = '';

 constructor(private navigationService: NavigationService, private crudService: CrudService) { }

 sendToDashboard() {
   this.navigationService.sendToDashboard();
 }

 togglePassword() {
  this.showPassword = !this.showPassword;
 } 

 postUser() {
   const user = {
     id: '',
     name: this.name,
     username: this.username,
     email: this.email,
     password: this.password,
     age: this.age
   };

   this.crudService.getLastUserId().subscribe(lastId => {
     user.id = (lastId + 1).toString();

     this.checkValidity();
     if (this.nameInvalidFormat || this.usernameInvalidFormat 
      || this.emailInvalidFormat || this.passwordInvalidFormat
      || this.ageInvalidFormat) {
       this.validationMessage = 'Ju lutemi plotësoni saktë të gjitha fushat perkatesë';
       
       this.nameMessage = '';
       this.nameInfoMessage = '';
       this.usernameMessage = '';
       this.usernameInfoMessage = '';
       this.emailMessage = '';
       this.passwordErrorMessage = '';
       this.passwordInfoMessage = '';
       this.ageMessage = '';

       this.nameInvalidFormat = false;
       this.usernameInvalidFormat = false;
       this.emailInvalidFormat = false;
       this.passwordInvalidFormat = false;
       this.ageInvalidFormat = false;

       return;
     }

     this.crudService.getUserByEmail(user.email).subscribe(existingUser => {
       if (existingUser) {
         this.validationMessage = 'Ky email është rregjistruar më parë! Ju lutemi bëni Log-In!';
         return;
       } else {
         this.crudService.getUserByUsername(user.username).subscribe(existingUser => {
           if (existingUser) {
             this.validationMessage = 'Ky username është rregjistruar më parë! Ju lutemi bëni Log-In!';
             return;
           } else {
             this.crudService.createUser(user).subscribe(data => {
               this.crudService.setUser(data);
               this.sendToDashboard();
             });
           }
         });
       }
     });
   });
 }

 checkValidity(): {nameMessage: string, usernameMessage: string, 
  emailMessage: string, passwordErrorMessage: string, 
  passwordInfoMessage: string,ageMessage: string} {
    const namePattern = /^[A-Z]{1}[a-z]{3}(?!.*\s\s)(?!.*[@$!%*?&])[A-Za-z0-9\s]{0,14}$/;
   const usernamePattern = /^[a-zA-Z][a-zA-Z0-9@$!%*?&]{3,19}$/;
   const emailPattern = /^.+@gmail\.com{1,255}$/;
   const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

   this.nameInvalidFormat = !namePattern.test(this.name);
   if(this.nameInvalidFormat) {
    this.nameInfoMessage = 'Emri duhet të përmbajë 4 deri në 20 karaktere , mund të shtoni shkronja të mëdha (A-Z), shkronja të vogla (a-z), numra (0-9) edhe hapësira midis emrit por nuk mund të shtoni një karakter të veçantë (@$!%*?&)';
    if (!/[A-Z]/.test(this.name)) {
      this.nameMessage = 'Ju duhet të filloni emrin me një shkronjë kapitale (A-Z)';
     }  else if (this.name.slice(0, 4).includes(' ')) {
      this.nameMessage = 'Ju nuk mund të përdorni spacebar kur shkruani 4 vlerat e para të emrit tuaj';
      } else if (this.name.match(/[@$!%*?&]/)) {
        this.nameMessage = 'Ju nuk mund të përdorni një karakter të veçantë kur shkruani emrin tuaj';
      } else if (this.name.match(/\s\s/)) {
      this.nameMessage = 'Ju nuk mund të përdorni dy herë radhazi spacebar kur shkruani emrin tuaj';
      } else if (!/^[A-Z][a-z]{3}/.test(this.name)) {
        this.nameMessage = 'Ju duhet të vendosni të paktëm 3 shkronja të vogla mbas shkronjës së madhe që emri të jetë i vlefshëm për faqen tonë';
      } 
      else if (this.name.length > 20) {
      this.nameMessage = 'Emri nuk është i vlefshëm. Ju lutemi vendosni deri në 20 karaktere';
     } 
   }

   this.usernameInvalidFormat = !usernamePattern.test(this.username);
   if(this.usernameInvalidFormat) {
    this.usernameInfoMessage = 'Username duhet të përmbajë 4 deri në 20 karaktere , mund të shtoni shkronja të mëdha (A-Z), shkronja të vogla (a-z), numra (0-9) edhe karakter të veçantë (@$!%*?&) por nuk mund të shtoni hapësira midis username';
   if (!/[a-zA-Z]/.test(this.username)) {
     this.usernameMessage = 'Ju duhet të filloni username-in me një shkronjë (a-z/A-Z)';
   } else if (this.username.includes(' ')) {
    this.usernameMessage = 'Ju nuk mund të përdorni spacebar kur shkruani username-in';
   } else if (this.username.length < 4 || this.username.length > 20) {
     this.usernameMessage = 'Username nuk është i vlefshëm. Ju lutemi vendosni 4 deri në 20 karaktere';
   }
  }
  
   this.emailInvalidFormat = !emailPattern.test(this.email);
   if(this.emailInvalidFormat) {
   if (!/.{1,255}@gmail\.com$/.test(this.email)) {
     this.emailMessage = 'Emaili i shkruar nuk është i vlefshëm. Ju lutemi shkruani një email që përfundon me @gmail.com';
   } else if (this.email.length > 255) {
     this.emailMessage = 'Emaili i shkruar nuk është i vlefshëm. Ju lutemi shkruani një email më të shkurtër';
   }
   }

   this.passwordInvalidFormat = !passwordPattern.test(this.password);
   if(this.passwordInvalidFormat) {
    this.passwordInfoMessage = 'Fjalëkalimi duhet të përmbajë 8 deri në 20 karaktere , të paktën një shkronjë të vogël (a-z), një shkronjë të madhe (A-Z), një numër (0-9) dhe një karakter të veçantë (@$!%*?&)';
    if (this.password.length < 8 || this.password.length > 20) {
     this.passwordErrorMessage = 'Fjalëkalimi nuk është i vlefshëm. Ju lutemi vendosni 8 deri në 20 karaktere';
   } else if (!/[A-Z]/.test(this.password)) {
     this.passwordErrorMessage = 'Shtoni një shkronjë të madhe (A-Z)';
   } else if (!/[a-z]/.test(this.password)) {
     this.passwordErrorMessage = 'Shtoni një shkronjë të vogël (a-z)';
   } else if (!/[0-9]/.test(this.password)) {
     this.passwordErrorMessage = 'Shtoni një numër (0-9)';
   } else if (!/[@$!%*?&]/.test(this.password)) {
     this.passwordErrorMessage = 'Shtoni një karakter të veçantë (@$!%*?&)';
   }
  }

  this.ageInvalidFormat = this.age < 18 || this.age > 99;
  if (this.age < 18) {
    this.ageMessage = 'Mosha juaj e nuk është e vlefshëme. Ju duhet të jeni më i madh se 18 vjec për tu rregjistruar në këtë website';
  } else if (this.age > 99) {
    this.ageMessage = 'Mosha juaj e nuk është e vlefshëme. Ju lutemi shkruani një moshë tjetër (18-99)';
  }
  
   return {nameMessage: this.nameMessage, usernameMessage: this.usernameMessage, 
    emailMessage: this.emailMessage, passwordInfoMessage: this.passwordInfoMessage,
  passwordErrorMessage: this.passwordErrorMessage, ageMessage: this.ageMessage};
 }
}
