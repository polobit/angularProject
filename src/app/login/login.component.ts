import { ClientService } from 'app/services/client.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { Languages } from './../app.configuration';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs/Observable';
import { LoginComponentService } from './login.component.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FilterService } from '../services/filter.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginComponentService]
})
export class LoginComponent implements OnInit {
  public Languages = Languages;
  public formGroup: FormGroup;
  constructor(private authService: AuthService,
    private router: Router,
    private loginComponentService: LoginComponentService,
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    public dialog: MatDialog) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      organisation: ['', [Validators.required]]
    });
  }

  goToSignIn() {
    if (!this.authService.isAuthenticated()) {
      this.authService.intiflow();
    }
  }

  goToGetAccess() {
    this.clientService.scrollToElement('accessSection');
  }

  openSuccessDialogOld(emailId): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.successRegister', 'capitalize') + emailId;
    dialogRef.componentInstance.isCloseDialog = true;
    dialogRef.afterClosed()
      .subscribe(each => {
        window.location.reload();
      });
  }

  openSuccessDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.successGetAccess', 'capitalize');
    dialogRef.componentInstance.isCloseDialog = true;
  }

  openErrorDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.failTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.failGetAccess', 'capitalize');
    dialogRef.componentInstance.isSuccess = false;
    dialogRef.componentInstance.isCloseDialog = true;
  }

  getAccessDetails(data) {
    this.loginComponentService.getAccessService(data)
      .subscribe((getServiceResponse: Response) => {
        if (getServiceResponse.status === 200) {
          this.formGroup.reset();
          this.openSuccessDialog();
        } else if (getServiceResponse.status === 409) {
          this.openErrorDialog();
        }
      }, getAccessStatus => {
        if (getAccessStatus.status === 200) {
          this.formGroup.reset();
          this.openSuccessDialog();
        } else if (getAccessStatus.status === 409) {
          this.openErrorDialog();
        }
      });
  }
}
