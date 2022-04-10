export class SimpleTable {
  constructor(columns: string[],
              hasAction:boolean) {
    this.columns = columns;
    this.hasAction = hasAction;
  }
  columns: string[];
  tableData: any[];
  hasAction: boolean;
}
