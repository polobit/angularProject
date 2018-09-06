import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForgotPasswordService } from './forgot-password.service';
import { AppConfiguration, Languages } from '../app.configuration';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [ForgotPasswordService]
})
export class ForgotPasswordComponent implements OnInit {
  public formGroup: FormGroup;
  public Languages = Languages;

  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.formGroup = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]]
    });
  }

  sendLink(data) {
    data.emailId = _.toLower(data.emailId);
    this.forgotPasswordService.sendLinkService(data.emailId)
      .subscribe((response: Response) => {
        if (response.status === 200) {
          this.openSuccessDialog();
        } else if (response.status === 204) {
          this.openErrorDialog(data.emailId);
        } else if (response.status === 422) {
          this.openErrorDialog(data.emailId);
        }
        this.formGroup.reset();
      });
  }

  openSuccessDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.forgotPasswordSuccessMessage', 'capitalize');
    dialogRef.componentInstance.isCloseDialog = true;
  }

  openErrorDialog(emailId): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.failTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.emailFailMessage', 'capitalize') + emailId;
    dialogRef.componentInstance.isSuccess = false;
    dialogRef.componentInstance.isCloseDialog = true;
  }


}
