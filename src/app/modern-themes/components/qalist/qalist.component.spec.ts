import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QAListComponent } from './qalist.component';

describe('QAListComponent', () => {
  let component: QAListComponent;
  let fixture: ComponentFixture<QAListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QAListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QAListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
