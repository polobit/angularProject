import { Component, OnInit, Input, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { IinfoTableData } from '../app.interface';
import { AppConfiguration, Languages } from '../app.configuration';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-info-table',
  templateUrl: './info-table.component.html',
  styleUrls: ['./info-table.component.scss']
})
export class InfoTableComponent implements OnInit {
  @Input('columnList') columnList;
  @Input('data') data: IinfoTableData;
  @Input ('reportType') reportType;
  @ViewChild('infoTable', { read: TemplateRef }) infoTable: TemplateRef<any>;
  public Languages = Languages;
  private dialogRef: MatDialogRef<any>;
  private isDialogClosed = true;

  constructor(public dialog: MatDialog) {}

  ngOnInit() { }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
      const width = event && event.target ? event.target.innerWidth : window.innerWidth;
      if (width > AppConfiguration.global.resolution.tablet && this.dialogRef) {
          this.dialogRef.close();
          this.isDialogClosed = true;
      }
  }

  openDialog(): void {
      if (window.innerWidth <= AppConfiguration.global.resolution.phone) {
          if (this.dialogRef) {
              this.dialogRef.close();
          }
          this.isDialogClosed = false;
          this.dialogRef = this.dialog.open(this.infoTable, {
              minWidth: '80vw',
              maxWidth: '90vw',
              maxHeight: '80vh',
              panelClass: 'info-table-dialog',
              role: 'dialog',
              ariaLabel: 'info-table-dialog',
          });
          this.dialogRef.beforeClose().subscribe(() => this.isDialogClosed = true);
      }
  }

  onNoClick(): void {
      this.dialogRef.close();
  }

}
