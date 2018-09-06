import { Component, Inject, Input, OnInit } from '@angular/core';
import { Languages } from '../app.configuration';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
    selector: 'app-error-message-dialog',
    templateUrl: 'error-message-dialog.component.html',
})

export class ErrorMessageDialogComponent {
    Languages = Languages;

    constructor(public dialogRef: MatDialogRef<ErrorMessageDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

@Component({
    selector: 'app-error-message',
    templateUrl: './error-message.component.html',
    styleUrls: ['./error-message.component.scss']
})

export class ErrorMessageComponent implements OnInit {
    @Input('errorMessage') errorMessage: string;
    @Input('isDialog') isDialog: boolean;
    @Input('buttonText') buttonText: string;

    Languages = Languages;

    constructor(public dialog: MatDialog, public snackBar: MatSnackBar) {
        this.buttonText = this.buttonText || Languages.get('global.ok', 'upper');
        this.isDialog = this.isDialog === undefined ? false : this.isDialog;
    }

    static refresh() {
        location.reload();
    }

    ngOnInit() {
        setTimeout(() => this.isDialog ? this.openDialog() : this.openSnackBar(), 0);
    }

    openSnackBar() {
        const snackBarRef = this.snackBar.open(Languages.get('global.dataLoadingProblem', 'start'),
            Languages.get('global.tryAgain', 'upper'));
        snackBarRef.onAction().subscribe(() => {
            ErrorMessageComponent.refresh();
        });
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(ErrorMessageDialogComponent, {
            width: '250px',
            data: {
                errorMessage: this.errorMessage,
                buttonText: this.buttonText
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                ErrorMessageComponent.refresh();
            }
        });
    }
}
