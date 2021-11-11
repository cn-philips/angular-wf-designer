import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignComponent } from './consign.component';

describe('ConsignComponent', () => {
  let component: ConsignComponent;
  let fixture: ComponentFixture<ConsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
