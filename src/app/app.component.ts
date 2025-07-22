import { Component } from '@angular/core';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private userService: UserService, private router: Router) {}

  isAdmin(): boolean {
    const user = this.userService.getCurrentUser();
    return !!user && user.role === 'admin';
  }

  isAuthenticated(): boolean {
    return !!this.userService.getCurrentUser();
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  goToSettings() {
    this.router.navigate(['/parametres']);
  }
}
