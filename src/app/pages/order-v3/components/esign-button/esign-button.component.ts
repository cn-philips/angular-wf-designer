import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { HttpService, UtilityService } from "@core/services";
import PDF from "pdfjs-dist/build/pdf";
import PDFWorker from "pdfjs-dist/build/pdf.worker.entry";
import { FormGroup } from "@angular/forms";
import { saveAs } from "file-saver";

PDF.GlobalWorkerOptions.workerSrc = PDFWorker;

// const SEAL_POOL_INITIAL_SIZE = 5
// class Pool {
//   items = []

//   getItem() {
//     return this.items.pop()
//   }

//   addItem(item) {
//     this.items.push(item)
//   }
// }

const RENDER_SCALE = 1.5;

const IMG_WIDTH = 100;

enum ESIGN_STATUS {
  NOTSTART = 0,
  LOADING = 1,
  FAILURE = -1,
  SUCCESS = 2,
}

type EsignFile = {
  fileId?: string;
  fileName?: string;
  signedFileId?: string;
  signedFileName?: string;
  status?: ESIGN_STATUS;
  attachmentComment?: string;
};

type Seal = {
  sealId?: string;
  sealName?: string;
  imgSrc?: string;
};

type Position = {
  x: number;
  y: number;
  w: number;
  h: number;
  page: number;
  imageFileId: string;
  id: string;
  sealWrap: HTMLDivElement;
};

@Component({
  selector: "esign-button",
  templateUrl: "esign-button.component.html",
  styleUrls: ["./esign-button.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => EsignButtonComponent),
    },
  ],
})
export class EsignButtonComponent implements ControlValueAccessor {
  // @Input() sourceFileList: SourceFile[];

  @Input() signFileForm: FormGroup;
  @Output() fileSigned: EventEmitter<any> = new EventEmitter();
  @Output() fileDeleted: EventEmitter<any> = new EventEmitter();

  disabled = false;
  sideContentVisible = true;

  isDragging = false;

  sourceFileList: EsignFile[];
  signedFileList: EsignFile[];

  visible = false;
  activeTab = "file";
  activeFile: EsignFile = {};
  activeSeal: Seal = {};
  loading = false;
  ESIGN_STATUS = ESIGN_STATUS;
  sealList = [];

  positionMap: Record<string, Position[]> = {};

  canvasWrapMap: Record<string, HTMLDivElement[]> = {};

  constructor(
    private http: HttpService,
    private message: NzMessageService,
    private utilityService: UtilityService,
  ) {}

  writeValue(obj: any): void {
    if (obj) {
      this.signedFileList = obj;
    }
  }

  onChange: any = () => {};
  onTouch: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  show() {
    const { zslNotSignedFile, signedFileRelationList } =
      this.signFileForm.getRawValue();
    const relationMap = new Map<string, string>();
    if (Array.isArray) {
      signedFileRelationList.forEach(({ signedFileId, unsignedFileId }) => {
        relationMap.set(unsignedFileId, signedFileId);
      });
    }
    this.sourceFileList = zslNotSignedFile.map((file: EsignFile) => ({
      ...file,
      signedFileId: relationMap.get(file.fileId),
      status: relationMap.get(file.fileId)
        ? ESIGN_STATUS.SUCCESS
        : ESIGN_STATUS.NOTSTART,
    }));
    this.visible = true;
    if (this.sealList.length === 0) {
      this.initSealList();
    }
    // 设置默认加载第一个文件
    if (this.sourceFileList.length > 0) {
      setTimeout(() => {
        this.activeFile = this.sourceFileList[0];
        this.loadPDF(this.activeFile);
      }, 0);
    }
  }

  initSealList() {
    const { zslEmail } = this.signFileForm.getRawValue();
    const url = `/act/ecos/signature/find/image/${zslEmail}`;
    this.http.get(url).subscribe(({ data }) => {
      this.sealList = data.map(({ fileId, fileName }) => ({
        sealId: fileId,
        sealName: fileName,
        imgSrc: this.http.getFullHref(`/act/system/download/${fileId}`),
      }));
    });
  }

  handleHideDialog() {
    this.visible = false;
  }

  handleToggleTab(tabName) {
    this.activeTab = tabName;
    this.sideContentVisible = true;
  }

  handleTogglePage(pageNum) {
    const $canvasWrap = document.querySelector(
      `.canvas-wrap:nth-child(${pageNum})`
    );
    if ($canvasWrap) {
      $canvasWrap.scrollIntoView();
    } else {
      this.message.error("文件未加载完成或无该页");
    }
  }

  handleToggleSidebar() {
    this.sideContentVisible = !this.sideContentVisible;
  }

  handleToggleSeal(seal: Seal) {
    this.activeSeal = seal;
  }

  handleToggleFile(file: EsignFile) {
    this.activeFile = file;
    this.loadPDF(file);
  }

  async handleRemoveSeal($event) {
    $event.preventDefault()
    $event.stopPropagation()
    const { target: $removeSealBtn } = $event;

    const positionId = $event.target.id;
    const { fileId } = this.activeFile;
    this.positionMap[fileId] = this.positionMap[fileId].filter(
      ({ id }) => id !== positionId
    );
    $removeSealBtn.parentNode.remove();
  }

  calcImgScale($img: HTMLImageElement, maxWidth = IMG_WIDTH) {
    const { width, height } = $img;
    const scaleWidth = maxWidth / RENDER_SCALE;
    const scaleHeight = (maxWidth * height) / width / RENDER_SCALE;
    // let scaleHeight;
    // if (width < maxWidth) {
    //   scaleWidth = width;
    //   scaleHeight = height;
    // } else {
    //   scaleWidth = maxWidth;
    //   scaleHeight = maxWidth * (height / width);
    // }
    return { scaleWidth, scaleHeight };
  }

  async handleAddSeal(pageNum, $event) {
    if (this.activeFile.status === ESIGN_STATUS.SUCCESS) {
      return;
    }
    const positionId = String(Date.now());
    const { sealId } = this.activeSeal;
    if (!sealId) {
      this.message.warning("请先选择电子签");
      this.activeTab = "seal";
      this.sideContentVisible = true;
      return;
    }

    const sealImg = await this.initSealImg(sealId);
    const sealWrap = document.createElement("div");
    sealWrap.classList.add("seal-wrap");
    const removeSealBtn = document.createElement("div");
    removeSealBtn.title = "移除盖章位置";
    removeSealBtn.onclick = this.handleRemoveSeal.bind(this);
    removeSealBtn.innerText = "X";
    removeSealBtn.classList.add("remove-seal");
    removeSealBtn.id = positionId;
    sealWrap.appendChild(sealImg);
    sealWrap.appendChild(removeSealBtn);

    const { offsetX, offsetY, target: $canvas } = $event;
    $canvas.parentNode.insertBefore(sealWrap, $canvas);
    const { clientWidth, clientHeight } = sealImg;
    // sealImg
    sealWrap.style.left = offsetX - clientWidth / 2 + "px";
    sealWrap.style.top = offsetY - clientHeight / 2 + "px";

    if (this.utilityService.isMobile()) {
      sealImg.addEventListener("touchstart", (e) => {
        this.isDragging = true;
      });
      sealImg.addEventListener("touchend", (e: TouchEvent) => {
        e.stopPropagation()
        const container = document.querySelector('.pdf-container') as HTMLDivElement
  
  
        const { changedTouches } = e;
        if (changedTouches.length === 1) {
          const [{ clientX, clientY }] = Array.from(changedTouches);
          sealWrap.style.left = clientX - container.offsetLeft + container.scrollLeft - clientWidth / 2 + "px";
          sealWrap.style.top = clientY - container.offsetTop + container.scrollTop - clientHeight / 2 + "px";
  
          // 更新盖章位置
          const position: Position = {
            id: positionId,
            x: (clientX - container.offsetLeft + container.scrollLeft) / RENDER_SCALE,
            y: ($canvas.height - clientY + container.offsetTop - container.scrollTop) / RENDER_SCALE,
            page: pageNum,
            w: this.calcImgScale(sealImg).scaleWidth,
            h: this.calcImgScale(sealImg).scaleHeight,
            imageFileId: sealId,
            sealWrap,
          };
  
          this.positionMap[this.activeFile.fileId] = this.positionMap[
            this.activeFile.fileId
          ].map((item) => (positionId === item.id ? position : item));
        }
        setTimeout(() => {
          this.isDragging = false;
        }, 0);
      });
    } else {
      sealImg.addEventListener("dragend", (e) => {
        const beforeLeft = Number(sealWrap.style.left.slice(0, -2));
        const beforeTop = Number(sealWrap.style.top.slice(0, -2));
        sealWrap.style.left = beforeLeft + e.offsetX - clientWidth / 2 + "px";
        sealWrap.style.top = beforeTop + e.offsetY - clientHeight / 2 + "px";
  
        // 更新盖章位置
        const position: Position = {
          id: positionId,
          x: (beforeLeft + e.offsetX) / RENDER_SCALE,
          y: ($canvas.height - beforeTop - e.offsetY) / RENDER_SCALE,
          page: pageNum,
          w: this.calcImgScale(sealImg).scaleWidth,
          h: this.calcImgScale(sealImg).scaleHeight,
          imageFileId: sealId,
          sealWrap,
        };
  
        this.positionMap[this.activeFile.fileId] = this.positionMap[
          this.activeFile.fileId
        ].map((item) => (positionId === item.id ? position : item));
      });
    }

    const position: Position = {
      id: positionId,
      x: offsetX / RENDER_SCALE,
      y: ($canvas.height - offsetY) / RENDER_SCALE,
      page: pageNum,
      w: this.calcImgScale(sealImg).scaleWidth,
      h: this.calcImgScale(sealImg).scaleHeight,
      imageFileId: sealId,
      sealWrap,
    };
    const { fileId } = this.activeFile;
    if (!this.positionMap[fileId]) {
      this.positionMap[fileId] = [];
    }
    this.positionMap[fileId].push(position);
  }

  loadPDF(file: EsignFile) {
    document.querySelector(".pdf-container").innerHTML = "";
    this.loading = true;
    // load pdf from cache
    const fileId =
      file.status === ESIGN_STATUS.SUCCESS ? file.signedFileId : file.fileId;
    if (this.canvasWrapMap[fileId]) {
      const canvasWrapList = this.canvasWrapMap[fileId];
      canvasWrapList.forEach(($canvasList) => {
        document.querySelector(".pdf-container").appendChild($canvasList);
        this.loading = false;
      });
      return;
    }
    // 下载文件
    const url = `/act/system/download/${fileId}`;
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((blob) => {
        const LoadingTask = PDF.getDocument({
          url: window.URL.createObjectURL(blob),
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.0.288/cmaps/",
          cMapPacked: true,
        });
        LoadingTask.promise
          .then((pdfInstance) => {
            const pageTotal = pdfInstance.numPages;
            for (let pageNum = 1; pageNum <= pageTotal; pageNum++) {
              this.loadPDFPage(pdfInstance, pageNum, fileId);
            }
            this.loading = false;
          })
          .catch((err) => {
            this.message.error("PDF加载失败");
            this.loading = false;
          });
      });
  }

  loadPDFPage(pdfInstance, pageNum = 1, fileId) {
    const $canvas = document.createElement("canvas");
    $canvas.onclick = this.handleAddSeal.bind(this, pageNum);
    const $div = document.createElement("div");
    $div.classList.add("canvas-wrap");
    $div.appendChild($canvas);
    document.querySelector(".pdf-container").appendChild($div);

    pdfInstance.getPage(pageNum).then((page) => {
      const scale = RENDER_SCALE;
      const viewport = page.getViewport({ scale });

      $canvas.width = viewport.width;
      $canvas.height = viewport.height;

      // $canvas.style.cursor = "pointer";
      // $canvas.style.display = "block";
      // $canvas.style.margin = "8px auto";

      const renderContext = {
        canvasContext: $canvas.getContext("2d"),
        viewport,
      };

      page.render(renderContext).promise.then(() => {
        if (!this.canvasWrapMap[fileId]) {
          this.canvasWrapMap[fileId] = [];
        }
        this.canvasWrapMap[fileId][pageNum - 1] = $div;
      });
    });
  }

  initSealImg(fileId): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const $img = new Image();
      $img.classList.add("seal-img");
      $img.src = this.http.getFullHref(`/act/system/download/${fileId}`);
      $img.onload = () => {
        resolve($img);
      };
    });
  }

  calcSignedFileName(sourceFileName) {
    const [fileName] = sourceFileName.split(/\.pdf$/i);
    return `${fileName}_signature.pdf`;
  }

  handleSubmit() {
    this.loading = true;
    this.activeTab = "file";
    this.activeFile.status = ESIGN_STATUS.LOADING;
    const { fileId, fileName } = this.activeFile;
    const positions = this.positionMap[fileId].map(
      ({ x, y, w, h, page, imageFileId }) => ({ x, y, w, h, page, imageFileId })
    );
    const url = `/act/pdf/signature`;
    const data = {
      pdfFileId: fileId,
      pointList: positions,
    };
    this.http.post(url, data).subscribe(({ code, data, msg }) => {
      if (code === "0000") {
        this.activeFile.status = ESIGN_STATUS.SUCCESS;
        this.activeFile.signedFileId = data;
        this.signedFileList = [
          ...this.signedFileList,
          { fileId: data, fileName: this.calcSignedFileName(fileName) },
        ];
        this.fileSigned.emit({ signedFileId: data, unsignedFileId: fileId });
        this.onChange(this.signedFileList);
        this.loadPDF(this.activeFile);
        this.message.success("盖章成功");
      } else {
        this.activeFile.status = ESIGN_STATUS.FAILURE;
        this.message.error(msg);
      }
      this.loading = false;
    });
  }

  handleRemoveSignedFile(file: EsignFile) {
    this.signedFileList = this.signedFileList.filter(
      ({ fileId }) => fileId !== file.fileId
    );
    this.onChange(this.signedFileList);
    this.fileDeleted.emit({ signedFileId: file.fileId });
    delete this.canvasWrapMap[file.fileId];
  }

  handleDownloadSignedFile(file: EsignFile) {
    const { fileId, fileName } = file;
    const url = `/act/system/download/${fileId}`;
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((data) => {
        saveAs(data, fileName);
      });
  }

  handleReset() {
    const { signedFileId, fileId } = this.activeFile;
    this.signedFileList = this.signedFileList.filter(
      ({ fileId }) => fileId !== signedFileId
    );

    if (this.positionMap[fileId]) {
      this.positionMap[fileId].forEach(({ sealWrap }) => {
        sealWrap.remove();
      });
    }

    this.onChange(this.signedFileList);
    this.fileDeleted.emit({ signedFileId: signedFileId });
    delete this.positionMap[fileId];
    delete this.canvasWrapMap[signedFileId];
    this.activeFile.signedFileId = null;
    this.activeFile.status = ESIGN_STATUS.NOTSTART;
    this.loadPDF(this.activeFile);
  }
}
