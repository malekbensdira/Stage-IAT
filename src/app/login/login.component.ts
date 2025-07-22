import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  motDePasse = '';
  error = '';

  constructor(private userService: UserService, private router: Router) {}

  login() {
    this.error = '';
    this.userService.login(this.email, this.motDePasse).subscribe(err => {
      if (!err) {
        const user = this.userService.getCurrentUser();
        if (user?.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      } else {
        this.error = err;
      }
    });
  }
}
