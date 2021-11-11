import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignConsignComponent } from './consign-consign.component';

describe('ConsignConsignComponent', () => {
  let component: ConsignConsignComponent;
  let fixture: ComponentFixture<ConsignConsignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsignConsignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignConsignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
