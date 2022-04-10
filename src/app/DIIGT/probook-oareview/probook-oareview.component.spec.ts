import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbookOareviewComponent } from './probook-oareview.component';

describe('ProbookOareviewComponent', () => {
  let component: ProbookOareviewComponent;
  let fixture: ComponentFixture<ProbookOareviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProbookOareviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProbookOareviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
