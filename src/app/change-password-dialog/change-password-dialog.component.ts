import { Component, Inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfileService } from '../user-profile/user-profile.service';
import { ChangePasswordService } from '../change-password-dialog/change-password-service';
@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  providers: [ChangePasswordService]
})
export class ChangePasswordDialogComponent implements OnInit {
  public newPassword: String = 'password';
  public oldPassword: String = 'password';
  public formGroup: FormGroup;
  public errorStatus = false;
  public invalidPassword = false;
  public Languages = Languages;
  @Input('messageTitle') messageTitle: string;
  @Input('messageContent') messageContent: string;
  @Input('isSuccess') isSuccess = true;
  @Input('isConfirm') isConfirm = false;
  @Input('isLoginRedirect') isLoginRedirect = false;
  @Input('isCloseDialog') isCloseDialog = false;
  @Input('showLogo') showLogo = true;
  // @Output() success: EventEmitter<boolean> = new EventEmitter();


  constructor(public dialog: MatDialog,
    private formBuilder: FormBuilder,
    public changePasswordService: ChangePasswordService,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.formGroup = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // onConfirm(): void {
  //   this.success.emit(true);
  // }
  showOldPassword(value) {
    if (value !== '') {
      this.oldPassword = this.oldPassword === 'password' ? 'text' : 'password';
    }
  }

  showNewPassword(value) {
    if (value !== '') {
      this.newPassword = this.newPassword === 'password' ? 'text' : 'password';
    }
  }
  successMessage() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.changePasswordMessage', 'capitalize');
     dialogRef.componentInstance.isLogout = true;
  }
  changePassword(data) {
    this.changePasswordService.updatePasswordService(data)
      .subscribe((registeredUserResponse) => {
        this.formGroup.reset();
        this.onNoClick();
        this.successMessage();
      }, (sendEmailStatus) => {
        if (sendEmailStatus.status === 409) {
          this.errorStatus = true;
        }
      });
  }

  onSearchChange(searchValue: string) {
    this.errorStatus = false;
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
