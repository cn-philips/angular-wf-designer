import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SpecialApprovalService } from '../../../special-approval.service';

@Component({
  selector: 'app-select-foreign-company',
  templateUrl: './select-foreign-company.componen.html'
})

export class SelectForeignCompanyComponent implements OnInit {
  constructor(private spService: SpecialApprovalService) { }

  foreignCompanies = []

  allForeignCompanies = []

  tableLoading = true

  companyName = null

  @Input() visible = false
  @Output() select: EventEmitter<null> = new EventEmitter()

  ngOnInit() {
    this.initForeignCompanies()
  }

  async initForeignCompanies() {
    this.spService.getForeignCompany().then((foreignCompanies) => {
      this.allForeignCompanies = this.foreignCompanies = foreignCompanies
      this.tableLoading = false
    })
  }

  onSearch() {
    const companyName = this.companyName ? this.companyName.trim() : null
    if (!this.companyName) { 
      this.foreignCompanies = this.allForeignCompanies
    } else {
      this.foreignCompanies = this.allForeignCompanies.filter(({ corporateName }) => corporateName && corporateName.indexOf(companyName) > -1)
    }
  }

  onHideModal() {
    this.visible = false
  }

  onSelectCompany(company) {
    this.select.emit(company)
  }
}