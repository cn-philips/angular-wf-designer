import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService } from "@pages/system-setting/message-management/services/message.service";
import { formAction } from "../../../enums/formAction.enum";
import { messageTypeEnum } from "../../../interfaces/iMessage";
import { notification } from "../../../interfaces/iNotification";

@Component({
  selector: "app-notification-form-dialog",
  templateUrl: "./notification-form-dialog.component.html",
  styleUrls: ["./notification-form-dialog.component.scss"],
})
export class NotificationFormDialogComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}
  isVisible = false;
  form: FormGroup;
  @Output("submit")
  onSubmit: EventEmitter<any> = new EventEmitter();
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
      type: [null, [Validators.required]],
    });
  }

  showEditModal(notification: notification) {
    this.formType = formAction.edit;
    this.form.patchValue({ ...notification });
    this.isVisible = true;
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

    if (this.form.valid) {
      if (this.formType === formAction.submit) {
        this.messageService
          .createMessage({
            ...this.form.value,
            messageType: messageTypeEnum.Notification,
          })
          .subscribe((res) => {
            this.onSubmit.emit(true);
            this.isSubmitting = false;
            this.hide();
          });
      } else if (this.formType === formAction.edit) {
        this.messageService
          .updateMessage({
            ...this.form.value,
            messageType: messageTypeEnum.Notification,
          })
          .subscribe((res) => {
            this.onSubmit.emit(true);
            this.isSubmitting = false;
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
    this.isSubmitting = false;
    this.isVisible = false;
  }
}
