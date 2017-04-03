import { Component, OnInit } from '@angular/core';
import { StoreService, Stored } from '../../services/store.service';
import { ImageService } from '../../services/image.service';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs/Observable';
import { Person } from '../../model/Person';
import { DialogsService } from '../../services/dialog.service';

export const DEFAULT_IMAGE_RIGHTS = 'MZ.intellectualRightsARR';

@Component({
  selector: 'ilm-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {

  images = [{idx: 0, id: '', src: ''}];
  idx = 1;
  image: any;

  constructor(private storeService: StoreService,
              private userService: UserService,
              private dialogService: DialogsService,
              public imageService: ImageService
  ) { }

  ngOnInit() {
    this.storeService.get(Stored.IMAGES, this.images)
      .subscribe(images => {
        this.images = images;
        this.idx = this.images.length;
      });
  }

  reset() {
    this.images = [{idx: 0, id: '', src: ''}];
    this.storeService.set(Stored.IMAGES, this.images);
    this.idx = this.images.length;
  }

  addImage(data) {
    Observable.combineLatest(
      this.storeService.get(Stored.IMAGE_RIGHTS, DEFAULT_IMAGE_RIGHTS),
      this.userService.getUser(),
      (s1, s2: Person) => ({
        intellectualRights: s1,
        capturerVerbatim: [s2.fullName]
      }))
      .switchMap(meta => this.imageService.addImage(data.img, meta, data.filename))
      .switchMap(id => this.imageService.getImageSrc(id)
        .switchMap((src) => Observable.of({idx: this.idx, id: id, src: src}))
      )
      .subscribe(img => {
        this.images = [ ...this.images, img];
        this.storeService.set(Stored.IMAGES, this.images);
        this.idx++;
      });
  }

  delImage(id) {
    this.dialogService.confirm('Oletko varma', 'että haluat poistaa kuvan')
      .subscribe(res => {
        if (!res) return;

        this.imageService.deleteImage(id)
          .subscribe(
            () => this.delLocalImage(id),
            (err) => {
              if (err.status === 404) {
                this.delLocalImage(id);
              }
            }
          );
      });
  }

  private delLocalImage(id) {
    const idx = this.images.findIndex(img => img.id === id);
    if (idx === -1) {
      return;
    }
    this.images = [...this.images.slice(0, idx), ...this.images.slice(idx + 1)];
    this.storeService.set(Stored.IMAGES, this.images);
  }

}
