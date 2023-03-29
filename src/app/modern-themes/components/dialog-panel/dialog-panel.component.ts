import {
  Component,
  ContentChildren,
  Input,
  OnInit,
  QueryList,
} from "@angular/core";
import { DialogPanelTabComponent } from "./components/dialog-panel-tab/dialog-panel-tab.component";

@Component({
  selector: "app-dialog-panel",
  templateUrl: "./dialog-panel.component.html",
  styleUrls: ["./dialog-panel.component.scss"],
})
export class DialogPanelComponent implements OnInit {
  @ContentChildren(DialogPanelTabComponent, { descendants: false })
  panelTabs: QueryList<DialogPanelTabComponent>;

  constructor() {}
  selectedIndex = 0;
  @Input("title")
  title: String = "";

  ngOnInit() {}
  isVisible = false;

  showModal(index?): void {
    if (index !== null) {
      this.selectedIndex = index;
    }
    this.isVisible = true;
  }
  hideModal(): void {
    this.selectedIndex = 0;
    this.isVisible = false;
  }
}
