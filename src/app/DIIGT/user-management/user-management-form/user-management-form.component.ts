import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FORM_ACTION_TYPE } from "../../role-management/components/role-management-form/role-management-form.component";
import { BusinessInfoArea } from "./business-info-area/business-info-area.component";

@Component({
  selector: "app-user-management-form",
  templateUrl: "./user-management-form.component.html",
  styleUrls: ["./user-management-form.component.scss"],
})
export class UserManagementFormComponent implements OnInit {
  @Input() type: FORM_ACTION_TYPE;
  @Input() id: any;
  @Input() readOnly: boolean = false;
  @Output() onClose = new EventEmitter();
  userInform: any = {
    id: null,
    email: null,
    name: null,
    lineManager: null,
  };
  tableData: BusinessInfoArea[] = [];
  constructor() {}
  fetchUserInform(id) {
    // API Here
    this.userInform = {
      id: 773,
      email: "ada.zhang1@philips.com",
      name: "Ada Zhang",
      lineManager: "lineManager",
    };
  }
  fetchBusinessInfoArea(id) {
    // API Here
    this.tableData = [
      {
        dataSource: "COS",
        role: "OA",
        team: "CFC",
        ifApply: false,
        ifReview: true,
        modality: "PD&IGT(excl.)",
        bmc: null,
        area: [
          "Private-East-East1",
          "Soluition-East-East1",
          "Soluition-East-East2",
        ],
      },
    ];
  }
  ngOnInit() {}
  handleSubmit() {
    if (this.type === FORM_ACTION_TYPE.CREATE) {
      this.handleCreate();
    } else if (this.type === FORM_ACTION_TYPE.EDIT) {
      this.handleUpdate();
    }
  }
  handleCreate() {
    // API Here
    this.close();
  }
  handleUpdate() {
    // API Here
    this.close();
  }
  handleCancel() {
    this.clearForm();
    this.close();
  }
  close() {
    this.onClose.emit("close");
  }
  clearForm() {
    this.userInform = {
      id: null,
      email: null,
      name: null,
      lineManager: null,
    };
    this.tableData = [];
  }
  ngOnChanges() {
    if (this.id) {
      this.fetchUserInform(this.id);
      this.fetchBusinessInfoArea(this.id);
    } else {
      this.clearForm();
    }
  }

  // Dialog
  ifShowDialog: boolean = false;
  title: string = "编辑Business Info-Area";
  businessInfoAreaFormType: FORM_ACTION_TYPE = FORM_ACTION_TYPE.CREATE;
  handleCreateDialog(){
    this.businessInfoAreaFormType = FORM_ACTION_TYPE.CREATE
    this.setTitle()
    this.showDialog()
  }
  handleUpdateDialog(){
    this.businessInfoAreaFormType = FORM_ACTION_TYPE.EDIT
    this.setTitle()
    this.showDialog()
  }
  showDialog() {
    this.ifShowDialog = true;
  }
  hideDialog() {
    this.ifShowDialog = false;
  }
  setTitle() {
    let action = "";
    switch (this.businessInfoAreaFormType) {
      case FORM_ACTION_TYPE.CREATE:
        action = "新增";
        break;
      case FORM_ACTION_TYPE.EDIT:
        action = "编辑";
        break;
    }
    this.title =   action+'Business Info-Area';
  }
    // end Dialog
}
