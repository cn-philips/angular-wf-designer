import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalrecordComponent } from './approvalrecord.component';

describe('ApprovalrecordComponent', () => {
  let component: ApprovalrecordComponent;
  let fixture: ComponentFixture<ApprovalrecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovalrecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalrecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
