import { Component, OnInit, Inject, Input } from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EmailInviteService } from '../email-invite/email-invite.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '../dialog/dialog.component';
import * as _ from 'lodash';
import { ICustomerList } from 'app/app.interface';
import { ClientService } from 'app/services/client.service';

@Component({
  selector: 'app-email-invite',
  templateUrl: './email-invite.component.html',
  styleUrls: ['./email-invite.component.scss'],
  providers: [EmailInviteService]
})
export class EmailInviteComponent implements OnInit {
  @Input('messageTitle') messageTitle: string;
  @Input('confirmTitle') confirmTitle: string;
  @Input('messageContent') messageContent: string;
  @Input('isCloseDialog') isCloseDialog = false;

  public authUrl = `${AppConfiguration.authUrl}/login`;
  public formGroup: FormGroup;
  public userType: string;
  public loginType: string;
  public customer: String;
  public isCustomerInvite = true;
  public customers: ICustomerList[];

  constructor(
    private formBuilder: FormBuilder,
    private emailInviteService: EmailInviteService,
    private clientService: ClientService,
    public dialogRef: MatDialogRef<EmailInviteComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.clientService.getCustomerList()
      .subscribe((data) => {
        if (!_.isEmpty(data)) {
          this.customers = _.sortBy(data, o => o.customerName);
        }
      });
    this.loadForm();
  }

  openSuccessDialog(emailId): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.successTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = Languages.get('global.emailSuccessMessage', 'capitalize') + emailId;
    dialogRef.componentInstance.isCloseDialog = true;
  }

  loadForm() {
    if (this.userType === 'customer' || this.userType === 'customer-admin') {
      this.buildCustomerForm();
    } else {
      this.buildForm();
    }
  }

  openErrorDialog(message): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px'
    });
    dialogRef.componentInstance.messageTitle = Languages.get('global.failTitle', 'capitalize');
    dialogRef.componentInstance.messageContent = message;
    dialogRef.componentInstance.isSuccess = false;
    dialogRef.componentInstance.isCloseDialog = true;
  }

  buildForm(): void {
    this.formGroup = this.formBuilder.group({
      registeredEmailId: ['', [Validators.required, Validators.email]],
      userType: [''],
      customer: ['']
    });
  }

  buildCustomerForm(): void {
    this.formGroup = this.formBuilder.group({
      registeredEmailId: ['', [Validators.required, Validators.email]],
      userType: [''],
      customer: ['', Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectRole(role) {
    this.isCustomerInvite = (role === 'customer-admin' || role === 'customer') ? true : false;
    this.userType = role;
    this.formGroup.reset();
    this.loadForm();
  }

  selectChange(companySelectEvent: any) {
    this.customer = companySelectEvent.value;
  }

  sendEmail(data) {
    data.userType = this.userType;
    data.customer = this.customer;
    data.registeredEmailId = _.toLower(data.registeredEmailId);
    this.emailInviteService.sendEmailService(data)
      .subscribe((sendEmailResponse) => {
        this.formGroup.reset();
      }, (sendEmailStatus) => {
        if (sendEmailStatus.status === 200) {
          this.formGroup.reset();
          this.openSuccessDialog(data.registeredEmailId);
        } else if (sendEmailStatus.status === 422) {
          this.openErrorDialog(Languages.get('global.emailAlreadySentMessage', 'capitalize') + data.registeredEmailId);
        } else if (sendEmailStatus.status === 409) {
          this.openErrorDialog(Languages.get('global.emailFailMessage', 'capitalize') + data.registeredEmailId);
        }
      });
  }

}
