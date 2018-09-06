import { Component } from '@angular/core';
import { Languages } from '../app.configuration';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent {
  Languages = Languages;

  constructor(private location: Location) { }

  onBackButton() {
    this.location.back();
  }
}
