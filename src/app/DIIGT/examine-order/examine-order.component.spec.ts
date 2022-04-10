import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppService } from '../../app.service';

import { ExamineOrderIGTComponent } from './examine-order.component';

describe('ExamineOrderIGTComponent', () => {
  let component: ExamineOrderIGTComponent;
  let fixture: ComponentFixture<ExamineOrderIGTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ AppService ],
      declarations: [ ExamineOrderIGTComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamineOrderIGTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
