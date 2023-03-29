import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ImageEditorComponent } from "../image-editor/image-editor.component";
import resizeBase64 from "resize-base64"

@Component({
  selector: "app-image-control",
  templateUrl: "./image-control.component.html",
  styleUrls: ["./image-control.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageControlComponent),
      multi: true,
    },
  ],
})
export class ImageControlComponent implements OnInit, ControlValueAccessor {
  constructor() {}
  // @Input("image")
  image: String = "";
  hasImage: boolean = false;
  @ViewChild("uploader")
  uploader: ElementRef;
  @ViewChild("editor")
  editor: ImageEditorComponent;
  @Input() name: string = null;

  ngOnInit() {}
  ngAfterContentChecked(): void {
    if (!!this.image) {
      this.hasImage = true;
    } else {
      this.hasImage = false;
    }
  }
  // value 属性，以 get 方式拦截
  get value(): any {
    // resizeBase64(this.image,1920,1920/4);
    return this.image;
  }

  public handleUpload() {
    this.uploader.nativeElement.click();
  }
  public async handleFileSelected($event) {
    this.editor.fileChangeEvent($event);
    this.editor.showDialog();
  }
  handleCropped(data) {
    this.image = data;
    this.onChange(this.image);
    this.uploader.nativeElement.value = null;
  }
  onChange: any = () => {};
  onTouch: any = () => {};
  writeValue(input: string): void {
    if (input !== undefined) this.image = input;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error("Method not implemented.");
  }
  public handleEdit() {
    // console.log("click", this.image);
    this.editor.load(this.image);
    this.editor.showDialog();
  }
  public handleRemove() {
    this.image = null;
    // console.log("click", this.image);
    this.onChange(this.image);
  }
}
