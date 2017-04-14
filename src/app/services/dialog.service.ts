import { Observable } from 'rxjs/Rx';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Injectable()
export class DialogsService {

  dialogRef: MdDialogRef<ConfirmDialogComponent>;

  constructor(private dialog: MdDialog) {}

  public confirm(title: string, message: string): Observable<boolean> {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent);
    this.dialogRef.componentInstance.title = title;
    this.dialogRef.componentInstance.message = message;

    return this.dialogRef.afterClosed();
  }
}
