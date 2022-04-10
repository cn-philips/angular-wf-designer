import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsummaryComponent } from './contractsummary.component';

describe('ContractsummaryComponent', () => {
  let component: ContractsummaryComponent;
  let fixture: ComponentFixture<ContractsummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractsummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
