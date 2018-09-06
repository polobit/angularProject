import { Store } from '@ngrx/store';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserRegistrationService } from './user-registration.service';
import { AppConfiguration, Languages } from '../app.configuration';
import { IUserInfoInvited } from '../app.interface';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import * as _ from 'lodash';
@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
  providers: [UserRegistrationService]
})
export class UserRegistrationComponent implements OnInit {
  public inputType: String = 'password';
  public formGroup: FormGroup;
  public Languages = Languages;
  public registerToken;
  public invitedUserInfo: IUserInfoInvited;
  public authUrl = `${AppConfiguration.authUrl}/login`;
  public alreadyRegistered = false;
  public invalidPassword = false;
  public storeError = false;
  public emptyStorenumber = false;
  public isStorePresent: Array<string>;
  public updatedStoreList = [];
  public inviteId: string;
  constructor(
    private formBuilder: FormBuilder,
    private userRegistrationService: UserRegistrationService,
    public dialog: MatDialog
  ) {
    this.inviteId = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
  }

  openSuccessDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.signUpSuccessMessage');
    dialogRef.componentInstance.isLoginRedirect = true;
  }

  showPassword(value) {
    if (value !== '') {
      this.inputType = this.inputType === 'password' ? 'text' : 'password';
    }
  }

  ngOnInit() {
    this.registerToken = window.location.pathname.split('/')[2];
    this.getInvitedUserInfo(this.registerToken);
  }

  buildForm(): void {
    if (this.invitedUserInfo.userType === 'customer' || this.invitedUserInfo.userType === 'customer-admin') {
      this.formGroup = this.formBuilder.group({
        firstName: ['', [Validators.required]],
        lastName: ['', Validators.required],
        emailId: [this.invitedUserInfo.registeredEmailId, Validators.required],
        jobTitle: ['', Validators.required],
        contactNumber: ['', Validators.compose([Validators.required, Validators.min(1000000000), Validators.max(9999999999)])],
        location: ['', Validators.required],
        password: ['', Validators.required],
        storeNumber: [''],
        userType: [''],
        customer: ['']
      });
    } else {
      this.formGroup = this.formBuilder.group({
        firstName: ['', [Validators.required]],
        lastName: ['', Validators.required],
        emailId: [this.invitedUserInfo.registeredEmailId, Validators.required],
        jobTitle: ['', Validators.required],
        contactNumber: ['', Validators.compose([Validators.required, Validators.min(1000000000), Validators.max(9999999999)])],
        location: ['', Validators.required],
        password: ['', Validators.required],
        storeNumber: [null],
        userType: [''],
        customer: ['']
      });
    }
  }
  removeStoreError(store: string) {
    this.storeError = false;
    this.emptyStorenumber = store ? false : true;
    // if (!store) {
    //   this.emptyStorenumber = true;
    // } else {
    //   this.emptyStorenumber = false;
    // }
  }
  isStoreNumberExists(data) {
    if (this.invitedUserInfo.userType === 'customer' || this.invitedUserInfo.userType === 'customer-admin') {
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
      this.userRegistrationService.isStoreNumberService(this.updatedStoreList, this.inviteId).subscribe((response) => {
        data.storeNumber = this.isStorePresent;
        if (response.body.customer) {
          data.customer = response.body.customer;
        } else {
          data.customer = '';
        }
        this.registerUser(data);
      }, (storeStatus) => {
        if (storeStatus.status === 409) {
          this.storeError = true;
        }
      });
    } else {
      this.registerUser(data);
    }
  }
  registerUser(data) {
    data.userType = this.invitedUserInfo.userType;
    this.userRegistrationService.registerUserService(data, this.registerToken)
      .subscribe(registeredUserResponse => {
        this.openSuccessDialog();
      });
  }

  getInvitedUserInfo(registerToken) {
    this.userRegistrationService.getInvitedUserInfoService(registerToken)
      .subscribe((invitedUserInfoResponse) => {
        this.invitedUserInfo = invitedUserInfoResponse;
        this.buildForm();
      }, responseError => {
        if (responseError.status === 422) {
          this.alreadyRegistered = true;
        }
      });
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
