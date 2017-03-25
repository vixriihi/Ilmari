import { Component, OnInit } from '@angular/core';
import { StoreService, Stored } from '../../services/store.service';
import { ImageService } from '../../services/image.service';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs/Observable';
import { Person } from '../../model/Person';

@Component({
  selector: 'ilm-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {

  images = [{idx: 0, img: '', filename: ''}];
  idx = 1;
  image: any;

  constructor(private storeService: StoreService,
              private userService: UserService,
              private imageService: ImageService
  ) { }

  ngOnInit() {
    this.storeService.get(Stored.IMAGES, this.images)
      .subscribe(images => {
        this.images = images;
        this.idx = this.images.length;
      });
  }

  reset() {
    this.images = [{idx: 0, img: '', filename: ''}];
    this.storeService.set(Stored.IMAGES, this.images);
    this.idx = this.images.length;
  }

  addImage(img, filename = '') {
    this.images = [...this.images, {idx: this.idx, img: img, filename: filename}];
    this.tryToSendImage(this.idx);
    this.storeService.set(Stored.IMAGES, this.images);
    this.idx++;
  }

  tryToSendImage(idx) {
    const image = this.images[idx];
    Observable.combineLatest(
      this.storeService.get(Stored.IMAGE_RIGHTS, 'MZ.intellectualRightsARR'),
      this.userService.getUser(),
      (s1, s2: Person) => ({
        intellectualRights: s1,
        capturerVerbatim: [s2.fullName]
      }))
      .switchMap(meta => this.imageService.addImage(image, meta));
  }

}
