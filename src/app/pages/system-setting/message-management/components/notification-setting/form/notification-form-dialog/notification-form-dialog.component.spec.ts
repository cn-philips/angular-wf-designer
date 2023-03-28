import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationFormDialogComponent } from './notification-form-dialog.component';

describe('NotificationFormDialogComponent', () => {
  let component: NotificationFormDialogComponent;
  let fixture: ComponentFixture<NotificationFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
