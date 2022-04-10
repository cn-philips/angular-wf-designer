import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsigningComponent } from './contractsigning.component';

describe('ContractsigningComponent', () => {
  let component: ContractsigningComponent;
  let fixture: ComponentFixture<ContractsigningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractsigningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsigningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
