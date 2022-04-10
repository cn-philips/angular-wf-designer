import {Component, Input, OnInit} from '@angular/core';
import {SimpleTable} from '../../domian/simpleTable';

@Component({
  selector: 'app-simple-table',
  template: `
    <div>
      <div class="table-operations">

      </div>
      <nz-table #processTemplateTable nzSize="small" [nzData]="simpleTable.tableData">
        <thead>
        <tr>
          <th *ngFor="let columnName of simpleTable.columns">{{ columnName }}</th>
          <ng-template ngIf="simpleTable."></ng-template>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let data of processTemplateTable.data">
          <td *ngFor="let columnName of simpleTable.columns">{{ data[columnName] }}</td>
          <td></td>
        </tr>
        </tbody>
      </nz-table>
    </div>
  `,
})
export class SimpleTableComponent implements OnInit {

  @Input()
  simpleTable: SimpleTable;

  constructor() {
  }

  ngOnInit() {
  }

}
