import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalrecordaccComponent } from './approvalrecord.component';

describe('ApprovalrecordComponent', () => {
  let component: ApprovalrecordaccComponent;
  let fixture: ComponentFixture<ApprovalrecordaccComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovalrecordaccComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalrecordaccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
