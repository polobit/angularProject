import { Languages } from './../app.configuration';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public Languages = Languages;
  public isLogin = false;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.isLogin = true;
    }
  }

  goToSignIn() {
    this.authService.intiflow();
  }
}
