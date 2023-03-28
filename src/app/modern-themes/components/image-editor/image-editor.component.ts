import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";
import resizeBase64 from "resize-base64";

@Component({
  selector: "app-image-editor",
  templateUrl: "./image-editor.component.html",
  styleUrls: ["./image-editor.component.scss"],
})
export class ImageEditorComponent implements OnInit {
  constructor() {}
  @ViewChild("cropPanel")
  cropPanel: ElementRef;
  @ViewChild("cropper")
  cropper: ImageCropperComponent;

  imageUrl: String = null;
  show: boolean = false;
  @Output("cropped")
  cropped: EventEmitter<String> = new EventEmitter();

  ngOnInit() {}
  imageChangedEvent: any = "";
  croppedImage: any = "";

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded(image) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  load(base64Image) {
    this.imageUrl = resizeBase64(base64Image, 1920, 1920 / 4);
  }
  showDialog() {
    this.show = true;
  }
  hideDialog() {
    this.show = false;
  }
  handleCrop() {
    let event: ImageCroppedEvent = this.cropper.crop();
    this.cropped.emit(resizeBase64(event.base64, 1920, 1920 / 4));
    this.imageUrl = null;
    this.hideDialog();
  }
  handleReplace(img){
    this.load(img)
  }
}
