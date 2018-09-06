import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResetPasswordService } from './reset-password.service';
import { AppConfiguration, Languages } from '../app.configuration';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [ResetPasswordService]
})
export class ResetPasswordComponent implements OnInit {
  public formGroup: FormGroup;
  public Languages = Languages;
  public authUrl = `${AppConfiguration.authUrl}/login`;
  public isInvalid = false;
  public isExpired = false;
  public invalidPassword = false;
  public inputType: String = 'password';
  private resetId: string;

  constructor(private resetPasswordService: ResetPasswordService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.resetId = params['resetId'];
    });
    this.buildForm();
    this.getResetUrlStatus();
  }

  buildForm(): void {
    this.formGroup = this.formBuilder.group({
      password: ['', Validators.required]
    });
  }
  showPassword(value) {
    if (value !== '') {
      this.inputType = this.inputType === 'password' ? 'text' : 'password';
    }
  }
  resetPassword(data) {
    this.resetPasswordService.resetPasswordService(data, this.resetId)
      .subscribe((response: Response) => {
        // if (response.status === 200) {
          this.openSuccessDialog();
        // }
        this.formGroup.reset();
      });
  }

  getResetUrlStatus() {
    this.resetPasswordService.getUrlStatusService(this.resetId)
      .subscribe((response: any) => {
        if (response.status === 200) {
          this.isInvalid = response.body.requestInvalid;
          this.isExpired = response.body.tokenExpired;
        }
      });
  }

  openSuccessDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.resetPasswordSuccessMessage', 'capitalize');
    dialogRef.componentInstance.messageContent += Languages.get('global.signInMessage', 'capitalize');
    dialogRef.componentInstance.isLogout = true;
  }
  passwordValueValidator(value: string) {
    if (value !== undefined) {
      if ((!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,100})/)) || (value.length < 8)) {
        this.invalidPassword = true;
    } else {
      this.invalidPassword = false;
    }
  }
}



}
