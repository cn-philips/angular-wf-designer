import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignAccComponent } from './consign-acc.component';

describe('ConsignAccComponent', () => {
  let component: ConsignAccComponent;
  let fixture: ComponentFixture<ConsignAccComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsignAccComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignAccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
