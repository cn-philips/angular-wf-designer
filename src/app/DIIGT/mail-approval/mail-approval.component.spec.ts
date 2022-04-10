import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailApprovalComponent } from './mail-approval.component';

describe('MailApprovalComponent', () => {
  let component: MailApprovalComponent;
  let fixture: ComponentFixture<MailApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
