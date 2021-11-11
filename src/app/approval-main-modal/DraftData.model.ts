import {FormData as MyFormData} from './FormData.model';

export class DraftData {
  id: string;
  name: string;
  owner: string;
  formId: string;
  createDate: string;
  updateDate: string;
  submit: boolean = false;
  formData: MyFormData;
}
