import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbookSoComponent } from './probook-so.component';

describe('ProbookSoComponent', () => {
  let component: ProbookSoComponent;
  let fixture: ComponentFixture<ProbookSoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProbookSoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProbookSoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
