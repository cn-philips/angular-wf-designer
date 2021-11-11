import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignTabComponent } from './consign-tab.component';

describe('ConsignTabComponent', () => {
  let component: ConsignTabComponent;
  let fixture: ComponentFixture<ConsignTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsignTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
