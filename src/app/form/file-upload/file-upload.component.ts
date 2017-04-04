import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ilm-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {

  activeColor = 'orangered';
  baseColor = 'lightgray';
  overlayColor = 'rgba(255,255,255,0.5)';

  dragging = false;
  loaded = false;
  imageLoaded = false;
  @Input() imageSrc = '';
  @Output() onAdd = new EventEmitter();
  @Output() onRemove = new EventEmitter();
  private filename;

  handleDragEnter() {
    this.dragging = true;
  }

  handleDragLeave() {
    this.dragging = false;
  }

  handleDrop(e) {
    e.preventDefault();
    this.dragging = false;
    this.handleInputChange(e);
  }

  handleImageLoad() {
    this.imageLoaded = true;
  }

  handleInputChange(e) {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file || !file.type) {
      return;
    }
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }

    this.loaded = false;
    try {
      this.filename = e.target.value.replace(/^.*[\\\/]/, '');
    } catch (e) {
      this.filename = 'unknown';
    }

    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e) {
    const reader = e.target;
    this.loaded = true;
    this.onAdd.emit({img: reader.result, filename: this.filename});
  }

}
