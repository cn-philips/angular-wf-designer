import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplybaseComponent } from './applybase.component';

describe('ApplybaseComponent', () => {
  let component: ApplybaseComponent;
  let fixture: ComponentFixture<ApplybaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplybaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplybaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
