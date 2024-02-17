import { Component} from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private router: Router) { }
  confirmLogout() {
    if (confirm("Jeni i sigurt që dëshironi të dilni? \nDo të ridrejtoheni tek faqja e Sign-Up!")) {
      this.router.navigate(['/']);
    }
}
}
