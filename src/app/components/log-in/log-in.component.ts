import { Component} from '@angular/core';
import { NavigationService } from 'src/app/navigation.service';
import { CrudService } from 'src/app/crud.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent{
  email: string = '';
  password: string = '';

  showPassword: boolean = false;
  isFormValid: boolean = false;
  
  //per mesazhet poshte teksteve input
  emailFocused: boolean = false;
  emailInvalidFormat: boolean = false;
  passwordFocused: boolean = false;
  passwordInvalidFormat: boolean = false;
  
  emailMessage: string = '';
  passwordMessage: string = '';
  validationMessage: string = '';

  constructor(private navigationService: NavigationService , private crudService: CrudService) { }

  sendToDashboard() {
    this.navigationService.sendToDashboard();
  }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
   } 
  
   getUser() {
    const user = {
      email: this.email,
      password: this.password
    };

    this.validateEmailAndPassword();
    if (this.emailInvalidFormat || this.passwordInvalidFormat) {
      this.validationMessage = "Ju lutemi plotësoni saktë të gjitha fushat përkatese";
      
      this.emailMessage = '';
      this.passwordMessage = '';  

      this.emailInvalidFormat = false;
      this.passwordInvalidFormat = false;
      return;
    }
  
    this.crudService.getUserByEmailAndPassword(user.email, user.password).subscribe(existingUser => {
      if (existingUser) {
        this.crudService.setUser(existingUser);
        this.sendToDashboard();
      } else {
        this.validationMessage = "Email ose fjalëkalimi i gabuar! Ju lutemi provoni përsëri";
      }
    });
  }
  
 
  validateEmailAndPassword(): {emailMessage: string, passwordMessage: string } {
    const emailPattern = /^.+@gmail\.com$/;
    const passwordPattern = /^.{8,20}$/;
    
    this.emailInvalidFormat = !emailPattern.test(this.email);
    if (this.emailInvalidFormat) {
      this.emailMessage = "Emaili nuk është i vlefshëm! Ju lutemi shkruani një email që përfundon me @gmail.com";
    }

    this.passwordInvalidFormat = !passwordPattern.test(this.password);
    if (this.passwordInvalidFormat) {
      this.passwordMessage = "Fjalëkalimi nuk është i vlefshëm! Ju duhet të vendosni 8 deri në 20 karaktere";
    }

    return {emailMessage: this.emailMessage , passwordMessage: this.passwordMessage};
  }

}