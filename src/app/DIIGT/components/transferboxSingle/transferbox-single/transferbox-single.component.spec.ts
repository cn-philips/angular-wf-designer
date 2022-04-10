import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferboxSingleComponent } from './transferbox-single.component';

describe('TransferboxSingleComponent', () => {
  let component: TransferboxSingleComponent;
  let fixture: ComponentFixture<TransferboxSingleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferboxSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferboxSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
