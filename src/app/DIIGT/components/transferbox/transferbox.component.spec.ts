import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferboxComponent } from './transferbox.component';

describe('TransferboxComponent', () => {
  let component: TransferboxComponent;
  let fixture: ComponentFixture<TransferboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
