import {FileService} from '../services';
import {UploadFile} from 'ng-zorro-antd';
import {ToastrService} from 'ngx-toastr';

export class ImportFiles {
  limit: number = 1;
  uploadButtonText: string = '上传文件';
  uploading: boolean = false;
  fileList: UploadFile[] = [];
  uploadURL: string;
  successCallBack: (res?: any) => void;

  constructor(private fileService: FileService,
              private toastrService: ToastrService,
              uploadURL: string,
              limit: number,
              uploadButtonText: string) {
    this.uploadURL = uploadURL;
    this.limit = limit;
    this.uploadButtonText = uploadButtonText;
  }

  beforeUpload = (file: UploadFile): boolean => {
    if (this.fileList.length < this.limit) {
      this.fileList = this.fileList.concat(file);
    }
    return false;
  };

  handleUpload = (): void => {
    this.uploading = true;
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    this.fileList.forEach((file: any) => {
      formData.append('files[]', file);
    });
    this.fileService.uploadFileByFormData(this.uploadURL, formData,
      res => {
        this.uploading = false;
        this.fileList = [];
        this.toastrService.success('上传成功');
        this.successCallBack && this.successCallBack(res);
      }, res => {
        this.uploading = false;
        this.fileList = [];
        this.toastrService.error(res && res.msg ? res.msg : '上传失败');
      });
  };
}
