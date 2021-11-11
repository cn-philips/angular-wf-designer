import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpAccComponent } from './emp-acc.component';

describe('EmpAccComponent', () => {
  let component: EmpAccComponent;
  let fixture: ComponentFixture<EmpAccComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpAccComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpAccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
