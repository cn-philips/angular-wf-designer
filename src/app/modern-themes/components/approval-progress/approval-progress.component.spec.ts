import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalProgressComponent } from './approval-progress.component';

describe('ApprovalProgressComponent', () => {
  let component: ApprovalProgressComponent;
  let fixture: ComponentFixture<ApprovalProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovalProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
