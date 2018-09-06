import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AuthService } from './../auth/auth.service';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  @Input('messageTitle') messageTitle: string;
  @Input('confirmTitle') confirmTitle: string;
  @Input('messageContent') messageContent: string;
  @Input('isSuccess') isSuccess = true;
  @Input('isConfirm') isConfirm = false;
  @Input('isDeleteConfirm') isDeleteConfirm = false;
  @Input('isLoginRedirect') isLoginRedirect = false;
  @Input('isLogout') isLogout = false;
  @Input('isCloseDialog') isCloseDialog = false;
  @Input('showLogo') showLogo = true;
  @Input('userName') userName: string;
  @Input('userEmail') userEmail: string;
//   @Input('isClose') isClose = false;
  @Output() success: EventEmitter<boolean> = new EventEmitter();

  public authUrl = `${AppConfiguration.authUrl}/login`;

  constructor(
    public authService: AuthService,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.success.emit(true);
  }

  LogOut(): void {
    this.authService.logout();
  }
}
