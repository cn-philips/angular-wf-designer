import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PrebookV3Service } from '@pages/prebook-v3/prebook-v3.service';

@Component({
  selector: 'prebook-v3-oa-supplement',
  templateUrl: './oa-supplement.component.html'
})

export class OaSupplementComponent implements OnInit {

  @Input() oaSupplement: FormGroup

  @Input() disabled = false

  @Input() applyDetail = {
    prebook: {
      orderInfo: []
    }
  }

  @Input() isUsProcess: boolean = false;

  omList = []

  constructor(
    private prebookV3Service: PrebookV3Service
  ) { }

  ngOnInit() {
    this.prebookV3Service.getOMList().then(
      (omList: Array<{ name: string, email: string }>) => {
        this.omList = omList.map(({ name, email }) => ({ label: name, value: email }))
      })
  }
}
