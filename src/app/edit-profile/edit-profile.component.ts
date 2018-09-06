import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AppConfiguration, Languages } from '../app.configuration';
import { ClientService } from '../services/client.service';
import {
  ICustomerList, IUserInfo, IUserCount, IUserPermission, ICustStoreDetails,
  ICustListDetails, ICustomerPermission
} from '../app.interface';
import * as _ from 'lodash';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { EditProfileService } from '../edit-profile/edit-profile.service';
import { UserProfileService } from '../user-profile/user-profile.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  providers: [EditProfileService]
})
export class EditProfileComponent implements OnInit {
  public formGroup: FormGroup;
  public userInfo: IUserInfo;
  public Languages = Languages;
  public storeList: FormArray[];
  public updatedStoreList = [];
  public isStorePresent: Array<string>;
  public storeError = false;
  public phone: string;
  constructor(private clientService: ClientService,
    private userProfileService: UserProfileService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private editProfileService: EditProfileService,
    private router: Router,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.getUserInfo();
  }

  getUserInfo() {
    this.userProfileService.getUserInfoService()
      .subscribe((userInfoResponse) => {
        this.userInfo = userInfoResponse;
        this.userInfo.contactNumber = userInfoResponse.contactNumber.replace(/\s/g, '');
        this.storeList = this.userInfo.storeNumber;
        this.buildForm();
      });
  }

  buildForm(): void {
      this.formGroup = this.formBuilder.group({
        firstName: [this.userInfo.firstName, [Validators.required]],
        lastName: [this.userInfo.lastName, Validators.required],
        jobTitle: [this.userInfo.jobTitle, Validators.required],
        contactNumber: [this.userInfo.contactNumber,
        Validators.compose([Validators.required, Validators.min(1000000000), Validators.max(9999999999)])],
        location: [this.userInfo.location, Validators.required],
        emailId: [this.userInfo.emailId, Validators.required],
        storeNumber: [this.userInfo.storeNumber]
      });
  }

  removeStoreError(store: string) {
    this.storeError = false;
  }

  isStoreNumberExists(data) {
    if (data.storeNumber) {
      this.isStorePresent = data.storeNumber.toString().replace(/\s\s+/g, '').split(',');
      this.updatedStoreList = [];
      this.isStorePresent.forEach(element => {
        this.updatedStoreList.push(_.toString(element).substr(1));
      });
    } else if (data.storeNumber === '') {
      this.isStorePresent = ['NA'];
      this.updatedStoreList = ['NA'];
    } else {
      this.updatedStoreList = [];
    }
    data.storeNumber = this.isStorePresent;
    this.editProfileService.isStoreNumberService(data).subscribe((response) => {
      if (response.status === 200) {
        this.storeError = false;
        this.openSuccessDialog();
      }
    }, (error) => {
      if (error.status === 409) {
        this.storeError = true;
      }
    });
  }

  updateProfile(data) {
    this.editProfileService.updateCustomerProfile(data).subscribe(response => {
    this.openSuccessDialog();
    });
  }

  checkUserType(data) {
    if (this.userInfo.userType === 'customer' || this.userInfo.userType === 'customer-admin') {
      this.isStoreNumberExists(data);
    } else {
      this.updateProfile(data);
    }
  }

  openSuccessDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.successEditProfile', 'capitalize');
    dialogRef.componentInstance.isCloseDialog = true;
  }
}
