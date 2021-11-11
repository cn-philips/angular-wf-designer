import { async, ComponentFixture, TestBed,} from '@angular/core/testing';
import {NgModule} from '@angular/core';

import { ApplyTenderComponent } from './apply-tender.component';

describe('ApplyTenderComponent', () => {
  let component: ApplyTenderComponent;
  let fixture: ComponentFixture<ApplyTenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyTenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyTenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
