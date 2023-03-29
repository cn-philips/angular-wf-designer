import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService } from "@pages/system-setting/message-management/services/message.service";
import { formAction } from "../../../enums/formAction.enum";
import { carousel } from "../../../interfaces/iCarousel";
import { messageTypeEnum } from "../../../interfaces/iMessage";

@Component({
  selector: "app-carousel-form-dialog",
  templateUrl: "./carousel-form-dialog.component.html",
  styleUrls: ["./carousel-form-dialog.component.scss"],
})
export class CarouselFormDialogComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}
  @Output("submit")
  onSubmit: EventEmitter<any> = new EventEmitter();
  isVisible = false;
  form: FormGroup;
  isSubmitting: boolean = false;
  formType: formAction = formAction.submit;
  ngOnInit() {
    this.form = this.fb.group({
      id: [null],
      title: [null, [Validators.required]],
      content: [null, [Validators.required]],
      startDate: [null],
      endDate: [null],
      isEnable: [true],
      image: [null, [Validators.required]],
      link: [null],
    });
  }
  showEditModal(carousel: carousel) {
    this.formType = formAction.edit;
    this.isVisible = true;
    this.messageService.getMessage(carousel).subscribe(c=>{
      this.form.patchValue({ ...c });
    })
  }
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isSubmitting = true;
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    console.log("this.form.valid", this.form.valid);
    if (this.form.valid) {
      if (this.formType === formAction.submit) {
        this.messageService
          .createMessage({
            ...this.form.value,
            messageType: messageTypeEnum.Carousel,
          })
          .subscribe((res) => {
            this.isSubmitting = false;
            this.onSubmit.emit(true);
            this.hide();
          });
      } else if (this.formType === formAction.edit) {
        this.messageService
          .updateMessage({
            ...this.form.value,
            messageType: messageTypeEnum.Carousel,
          })
          .subscribe((res) => {
            this.isSubmitting = false;
            this.onSubmit.emit(true);
            this.hide();
          });
      }
    }
  }
  handleCancel(): void {
    this.hide();
  }
  hide() {
    this.form.reset();
    this.formType = formAction.submit;
    this.isVisible = false;
  }
}
