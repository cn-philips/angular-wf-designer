import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditrecordComponent } from './auditrecord.component';

describe('AuditrecordComponent', () => {
  let component: AuditrecordComponent;
  let fixture: ComponentFixture<AuditrecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditrecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditrecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
