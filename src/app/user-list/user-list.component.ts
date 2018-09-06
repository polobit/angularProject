import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from './user-list.service';
import { ClientService } from '../services/client.service';
import { IUserList, ICustListDetails } from '../app.interface';
import * as _ from 'lodash';
import { EmailInviteComponent } from '../email-invite/email-invite.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { Languages } from '../app.configuration';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [UserListService]
})
export class UserListComponent implements OnInit {
  public userList: IUserList;
  public userType: string;
  public loginType: string;
  public custListDetails: ICustListDetails;

  constructor(
    private clientService: ClientService,
    private userListService: UserListService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {

    this.activatedRoute.params.map(params => params)
      .subscribe(params => {
        this.userType = params.userType;
        this.loginType = params.loginType;
        if (this.loginType === 'super-admin' || this.loginType === 'admin') {
          this.getUserList(params.userType);
        } else if (this.loginType === 'customer-admin') {
          this.getCustomerAdminList();
        }
      });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(EmailInviteComponent);
    dialogRef.componentInstance.userType = this.userType;
    dialogRef.componentInstance.loginType = this.loginType;
    if (this.loginType === 'admin' || this.loginType === 'super-admin') {
      dialogRef.componentInstance.messageTitle = Languages.get('global.inviteTitle', 'capitalizeFirst');
      dialogRef.componentInstance.messageContent = Languages.get('global.inviteTitle');
    }  else {
      dialogRef.componentInstance.messageTitle = Languages.get('global.customerInviteTitle', 'capitalizeFirst');
      dialogRef.componentInstance.messageContent = Languages.get('global.customerInviteContent');
    }

    dialogRef.componentInstance.isCloseDialog = true;
  }

  getUserList(userType) {
    this.userListService.getUserListService(userType)
      .subscribe((userListResponse) => {
        this.userList = userListResponse;
      });
  }

  deleteUser(id) {
    this.userListService.deleteUserService(id)
      .subscribe((deleteUserResponse) => { location.reload(); }, error => {
        // temporary fix
        window.location.reload();
      });
  }
  // deleteCustomer(id) {
  //   this.userListService.deleteCustomerService(id)
  //     .subscribe((deleteCustResponse) => {
  //       location.reload();
  //     }, error => {
  //       // temporary fix
  //       location.reload();
  //     });
  // }
  getCustomerAdminList() {
    this.userListService.getCustomerListInfoService()
      .subscribe((selectedCustomerStoreResponse) => {
        this.custListDetails = selectedCustomerStoreResponse;
      });
  }

  getUserDetails(userDetails) {
    this.route.navigate(['/user', this.loginType, userDetails.userId, userDetails.permissionId]);
  }

  getCustomerDetails(userDetails) {
    this.route.navigate(['/user', this.loginType, userDetails.userId, userDetails.permissionId]);
  }
  openConfirmDialog(user): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px'
    });
    dialogRef.componentInstance.confirmTitle = Languages.get('global.confirmDeleteTitle', 'capitalize');
    dialogRef.componentInstance.userName = `${user.firstName} ${user.lastName}`;
    dialogRef.componentInstance.userEmail = user.emailId;
    dialogRef.componentInstance.isCloseDialog = false;
    dialogRef.componentInstance.isDeleteConfirm = true;
    dialogRef.componentInstance.isSuccess = false;
    dialogRef.componentInstance.showLogo = false;
    dialogRef.componentInstance.success.subscribe((eventResponse) => {
      this.deleteUser(user.userId);
      // if (this.loginType === 'super-admin') {
      //   this.deleteUser(user.userId);
      // } else if (this.loginType === 'customer-admin') {
      //   this.deleteCustomer(user.permissionId);
      // }

    });
  }
}
