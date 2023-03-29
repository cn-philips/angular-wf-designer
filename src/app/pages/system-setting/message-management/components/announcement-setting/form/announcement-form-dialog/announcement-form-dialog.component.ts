import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService } from "@pages/system-setting/message-management/services/message.service";

import { formAction } from "../../../enums/formAction.enum";
import { announcement } from "../../../interfaces/iAnnouncement";
import { messageTypeEnum } from "../../../interfaces/iMessage";

@Component({
  selector: "app-announcement-form-dialog",
  templateUrl: "./announcement-form-dialog.component.html",
  styleUrls: ["./announcement-form-dialog.component.scss"],
})
export class AnnouncementFormDialogComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}
  isVisible = false;
  isSubmitting: boolean = false;
  form: FormGroup;
  formType: formAction = formAction.submit;
  @Output("submit")
  onSubmit: EventEmitter<any> = new EventEmitter();
  ngOnInit() {
    this.form = this.fb.group({
      id: [null],
      title: [null, [Validators.required]],
      content: [null, [Validators.required]],
      startDate: [null],
      endDate: [null],
      isEnable: [true],
      isForceRead: [false],
      alwaysShow: [false],
      readTime: [null, [Validators.required]],
    });
  }
  showModal(): void {
    this.isVisible = true;
  }

  showEditModal(announcement: announcement) {
    this.formType = formAction.edit;
    this.form.patchValue({ ...announcement });
    this.isVisible = true;
  }
  handleOk(): void {
    this.isSubmitting = true;

    this.changeReadTimeValidation();

    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid) {
      if (this.formType === formAction.submit) {
        this.messageService
          .createMessage({
            ...this.form.value,
            messageType: messageTypeEnum.Announcement,
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
            messageType: messageTypeEnum.Announcement,
          })
          .subscribe((res) => {
            this.isSubmitting = false;
            this.onSubmit.emit(true);
            this.hide();
          });
      }
    }
  }
  changeReadTimeValidation() {
    console.log("this.form.value.isForceRead", this.form.value.isForceRead);
    if (!this.form.value.isForceRead) {
      this.form.patchValue({ readTime: null });
      this.form.controls["readTime"].clearValidators();
    } else {
      this.form.controls["readTime"].setValidators(Validators.required);
    }
    this.form.controls["readTime"].markAsDirty();
    this.form.controls["readTime"].updateValueAndValidity({
      onlySelf: true,
    });
  }

  handleCancel(): void {
    this.hide();
  }

  hide() {
    this.form.reset();
    this.isVisible = false;
  }
}
