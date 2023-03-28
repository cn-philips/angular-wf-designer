import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmVersionComponent } from './confirm-version.component';

describe('ConfirmVersionComponent', () => {
  let component: ConfirmVersionComponent;
  let fixture: ComponentFixture<ConfirmVersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmVersionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
