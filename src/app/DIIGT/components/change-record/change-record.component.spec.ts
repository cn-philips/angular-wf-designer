import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeRecordComponent } from './change-record.component';

describe('ChangeRecordComponent', () => {
  let component: ChangeRecordComponent;
  let fixture: ComponentFixture<ChangeRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
