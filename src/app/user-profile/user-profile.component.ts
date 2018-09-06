import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UserProfileService } from './user-profile.service';
import { AppConfiguration, Languages } from '../app.configuration';
import { ClientService } from '../services/client.service';
import {
  ICustomerList, IUserInfo, IUserCount, IUserPermission, ICustStoreDetails,
  ICustListDetails, ICustomerPermission
} from '../app.interface';
import * as _ from 'lodash';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  providers: [UserProfileService]
})
export class UserProfileComponent implements OnInit {
  public customerList: ICustomerList[];
  public anotherUserCustomerList: ICustomerList[];
  public kpiList = AppConfiguration.kpiList;
  public userInfo: IUserInfo;
  public selectedUserInfo: IUserInfo;
  public userCount: IUserCount;
  public userPermission: IUserPermission;
  public customerPermission: ICustomerPermission;
  public selectedUserPermission: IUserPermission;
  public currentRoute;
  public userId: string;
  public permissionId: string;
  public adminUser = false;
  public customerUser = false;
  public customerAdmin = false;
  public viewer = false;
  public loginType: string;
  public anotherUser = false;
  public userEmailId: string;
  public userType: string;
  public combinedStoreNumber: string;
  public custStoreDetails: ICustStoreDetails;
  public savePermissionCheck = false;
  public rolePermissionCheck = false;
  public loginTypeCheck = false;
  public kpiHandlingCheck = false;
  public custHandlingCheck = false;
  public conditionVar;
  constructor(
    private clientService: ClientService,
    private userProfileService: UserProfileService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = {
          full: router.url,
          base: `/${router.url.split('/')[1]}`
        };
        if (this.currentRoute.base === '/user') {
          this.activatedRoute.params.map(params => params)
            .subscribe(params => {
              this.userId = params.userId;
              this.permissionId = params.permissionId;
              this.anotherUser = true;
              this.loginType = params.loginType;
            });
          if (this.loginType === 'customer-admin') {
            this.getSelectedCustomerInfo();
          } else if (this.loginType === 'super-admin' || this.loginType === 'admin') {
            this.getSelectedUserInfo();
          }
        } else {
          this.getUserInfo();

        }
      }
    });

    if (this.anotherUser ) {
      this.clientService.getCustomerList()
      .subscribe((customerList: ICustomerList[]) => {
        this.customerList = _.sortBy(customerList, data => data.customerName);
      });
      this.clientService.getCustomerList()
      .subscribe((customerList: ICustomerList[]) => {
        this.anotherUserCustomerList = _.sortBy(customerList, data => data.customerName);
      });
    } else {
      this.clientService.getAllCustomersList()
      .subscribe((customerList: ICustomerList[]) => {
        this.customerList = _.sortBy(customerList, data => data.customerName);
      });
    }
  }

  ngOnInit() {
  }

  doRoleCheck(userInfoResponse) {
    this.userInfo = userInfoResponse;
    this.adminUser = this.userInfo.userType === 'admin' || this.userInfo.userType === 'super-admin' ? true : false;
    this.customerUser = this.userInfo.userType === 'customer' ? true : false;
    this.customerAdmin = this.userInfo.userType === 'customer-admin' ? true : false;
    this.viewer = this.userInfo.userType === 'viewer' ? true : false;
    this.loginType = this.loginType ? this.loginType : this.userInfo.userType;
    if (this.loginType === 'customer-admin') {
      this.getCustomerStoreDetails();
    } else if (this.loginType === 'super-admin' && this.userInfo.userType === 'super-admin' ||
     this.loginType === 'admin' && this.userInfo.userType === 'admin') {
      this.getUserPermission();
    } else if (this.loginType === 'customer' || this.loginType === 'viewer') {
      this.getLoginPermission();
    }
    if (this.loginType !== 'customer-admin') {
      this.getUserCount();
    }
    this.conditionVar = {
      editProfile: this.isEditEnable(),
      kpiHandling: this.kpiHandlingCondition(),
      savePermission: this.isAllowedToeditPermission(),
      rolePermission: this.rolePermissionCondition(),
      customerHandling: this.custHandlingCondition(),
      adminSuperAdminRole: this.isAdminandSuperAdmin(),
      allPermissionSection: this.isAllPermissionSectionEnable(),
      countVisible: this.isCountBoxVisible(),
      custCount: this.isCustomerCountAvailable(),
      manageKPI: this.isManageKPICondition(),
      adminCount: this.isAdminCountVisible()
    };
  }
  getUserInfo() {
    this.anotherUser = false;
    this.userProfileService.getUserInfoService()
      .subscribe((userInfoResponse) => {
        this.doRoleCheck(userInfoResponse);
      });
  }

  getUserPermission() {
    this.userProfileService.getUserPermissionService(this.userInfo.userType)
      .subscribe((userInfoResponse) => {
        this.userPermission = userInfoResponse;
      });
  }
  getLoginPermission() {
    this.userProfileService.getLoginPermissionService()
      .subscribe((userInfoResponse) => {
        this.userPermission = userInfoResponse;
      });
  }

  getUserCount() {
    this.userProfileService.getUserCountService()
      .subscribe((userCountResponse) => {
        this.userCount = userCountResponse;

      });
  }


  goToUserList(selectedUserType) {
    this.router.navigate(['/user-list', this.loginType, selectedUserType]);
  }

  getSelectedUserInfo() {
    this.userProfileService.getSelectedUserInfoService(this.userId)
      .subscribe((selectedUserInfoResponse) => {
        this.userInfo = selectedUserInfoResponse;
        this.getSelectedUserPermission();
        this.doRoleCheck(selectedUserInfoResponse);
      });
  }
  /**getSelectedCustomerInfo can be included in getSelectedUserInfo --> refractoring can be possible */
  getSelectedCustomerInfo() {
    this.userProfileService.getSelectedUserInfoService(this.userId)
      .subscribe((selectedCustomerInfoResponse) => {
        this.userInfo = selectedCustomerInfoResponse;
        this.doRoleCheck(selectedCustomerInfoResponse);
        this.getSelectedCustomerPermission();
        this.getCustomerStoreDetails();
      });
  }

  getSelectedUserPermission() {
    this.userProfileService.getSelectedUserPermissionService(this.permissionId)
      .subscribe((userPermissionResponse) => {
        this.userPermission = userPermissionResponse;
        this.anotherUserCustomerList = userPermissionResponse.customers;
        this.userEmailId = this.userPermission.userMailId;
      });
  }
  getSelectedCustomerPermission() {
    this.userProfileService.getSelectedCustomerPermissionService(this.permissionId)
      .subscribe((userPermissionResponse) => {
        this.customerPermission = userPermissionResponse;
        this.anotherUserCustomerList = this.customerPermission.customers;
      });
  }

  isCustomerAvailable(value) {
    if (this.anotherUser) {
      return this.userPermission ? _.includes(this.anotherUserCustomerList, value) : false;
    } else {
      return this.userPermission ? _.includes(this.userPermission.activeCustomerList, value) : false;
    }
  }

  isRevolutionAvailable(value) {
    if (this.customerPermission) {
    return this.customerPermission ? _.includes(this.customerPermission.revolutions, value) : false;
    } else if (this.userPermission) {
      return this.userPermission ? _.includes(this.userPermission, value) : false;
    }
  }

  isKpiAvailable(value) {
    return this.userPermission && this.userPermission[value];
  }
  isCustKpiAvailable(value) {
    return this.customerPermission && this.customerPermission[value];
  }

  getSelectedCustomer(checked, customerName) {
    if (this.anotherUser) {
      if (checked) {
        this.anotherUserCustomerList.push(customerName);
      } else {
        this.anotherUserCustomerList.forEach((element, index) => {
          if (element === customerName) {
            this.anotherUserCustomerList.splice(index, 1);
          }
        });
      }
    } else {
      if (checked) {
        this.userPermission.activeCustomerList.push(customerName);
      } else {
        this.userPermission.activeCustomerList.forEach((element, index) => {
          if (element === customerName) {
            this.userPermission.activeCustomerList.splice(index, 1);
          }
        });
      }
    }
  }

  getSelectedRevolution(checked, revolution) {
    if (checked) {
      this.customerPermission.revolutions.push(revolution);
    } else {
      this.customerPermission.revolutions.forEach((element, index) => {
        if (element === revolution) {
          this.customerPermission.revolutions.splice(index, 1);
        }
      });
    }
  }

  getSelectedKpi(checked, kpiName) {
    if (checked) {
      this.userPermission[kpiName] = true;
    } else {
      this.userPermission[kpiName] = false;
    }
  }

  getSelectedCustKpi(checked, kpiName) {
    if (checked) {
      this.customerPermission[kpiName] = true;
    } else {
      this.customerPermission[kpiName] = false;
    }

  }
  updateRole(role) {
    this.userPermission.userType = role;
    this.userPermission.admin = role === 'admin' || role === 'viewer' ? true : false;
  }

  getCustomerHandling() {
    if (this.anotherUser) {
        return this.anotherUserCustomerList;
    } else {
      return (this.userPermission) ? this.userPermission.activeCustomerList : [];
    }
  }

  updatePermission() {
    if (this.anotherUser) {
      this.userPermission.userMailId = this.userId;
      this.userPermission.customers = [];
      // remove duplicates
      this.userPermission.activeCustomerList = this.anotherUserCustomerList;
      this.userPermission.customers = this.anotherUserCustomerList;
      // .forEach(e => {
      //     this.userPermission.customers.push(e);
      // });
    }
    this.userProfileService.updatePermissionService(this.permissionId, this.userPermission, this.anotherUser).subscribe(response => {
      this.openSuccessDialog();
    });
  }

  updateCustomerPermission() {
    if (this.anotherUser) {
      this.customerPermission.userMailId = this.userId;
    }
    // tslint:disable-next-line:max-line-length
    this.userProfileService.updateCustomerPermissionService(this.permissionId, this.customerPermission,
      this.anotherUser).subscribe(response => {
        this.openSuccessDialog();
      });
  }

  getCustomerStoreDetails() {
    this.userProfileService.getStoreDetails()
      .subscribe((selectedCustomerStoreResponse) => {
        this.custStoreDetails = selectedCustomerStoreResponse;
        // this.combinedStoreNumber = this.custStoreDetails.revolutions[0].model + this.custStoreDetails.revolutions[0].serial;
      });
  }

  openSuccessDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = `Permissions for ${this.userInfo.firstName} ${this.userInfo.lastName} `
      + `updated successfully`;
    dialogRef.componentInstance.isCloseDialog = true;
    dialogRef.afterClosed()
    .subscribe(each => {
      if (!this.anotherUser) {
        window.location.reload();
      }
    });
  }

  openConfirmDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px'
    });
    dialogRef.componentInstance.confirmTitle = Languages.get('global.confirmTitle', 'capitalize');
    dialogRef.componentInstance.isCloseDialog = false;
    dialogRef.componentInstance.isConfirm = true;
    dialogRef.componentInstance.isSuccess = false;
    dialogRef.componentInstance.showLogo = false;
    //     dialogRef.componentInstance.isClose =  false;
    dialogRef.componentInstance.success.subscribe((eventResponse) => {
      if (this.loginType === 'customer-admin') {
        this.updateCustomerPermission();
      } else {
        this.updatePermission();
      }
    });
  }
  getProfileDetails() {
    this.router.navigate(['/user-edit']);
  }

  isEditEnable() {
    return (this.userInfo.userType === this.loginType);
  }
  isAllowedToeditPermission() {
    return this.isAdminandSuperAdmin() || this.loginType === 'customer-admin' && this.userInfo.userType === 'customer';
  }
  isAdminandSuperAdmin() {
    return this.loginType === 'super-admin' || this.loginType === 'admin';
  }
  rolePermissionCondition() {
    const userTypes = ['admin', 'viewer'];
     return (this.loginType === 'super-admin'  && userTypes.indexOf(this.userInfo.userType) !== -1) ||
     ( this.loginType === 'admin' && this.userInfo.userType === 'viewer');
  }

  kpiHandlingCondition() {
    return this.isAdminandSuperAdmin() || this.loginType === 'viewer'  || this.loginType === 'customer'
      ||  this.loginType === 'customer-admin' && this.userInfo.userType === 'customer';
  }

  custHandlingCondition() {
    return (this.loginType === 'super-admin' && this.userInfo.userType === 'super-admin') ||
    (this.loginType === 'admin' && this.userInfo.userType === 'admin') ||
    this.rolePermissionCondition();
  }

  isAllPermissionSectionEnable() {
    return this.adminUser || this.customerUser || this.viewer || this.loginType === 'admin' && this.customerAdmin ||
    this.loginType === 'super-admin' && this.customerAdmin || this.loginType === 'viewer' && this.customerAdmin;
  }

  isCountBoxVisible() {
    return (this.loginType === 'super-admin' && this.userInfo.userType === 'super-admin');
  }

  isCustomerCountAvailable() {
    return(this.loginType === 'customer-admin' && this.userInfo.userType === 'customer-admin')
    || (this.loginType === 'super-admin' && this.userInfo.userType === 'customer-admin')
    || (this.loginType === 'admin' && this.userInfo.userType === 'customer-admin');
  }

  isManageKPICondition() {
    const userTypes = ['customer', 'customer-admin'];
      return  (this.loginType === 'admin'  && userTypes.indexOf(this.userInfo.userType) !== -1) || this.custHandlingCondition()
      || (this.loginType === 'super-admin' && userTypes.indexOf(this.userInfo.userType) !== -1);
  }

  isAdminCountVisible() {
    return (this.loginType === 'admin' && this.userInfo.userType === 'admin') ||
    (this.loginType === 'super-admin' && this.userInfo.userType === 'admin');
  }
}

