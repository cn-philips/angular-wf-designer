import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContemplateComponent } from './contemplate.component';

describe('ContemplateComponent', () => {
  let component: ContemplateComponent;
  let fixture: ComponentFixture<ContemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
