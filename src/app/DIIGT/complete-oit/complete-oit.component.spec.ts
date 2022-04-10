import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteOitComponent } from './complete-oit.component';

describe('CompleteOitComponent', () => {
  let component: CompleteOitComponent;
  let fixture: ComponentFixture<CompleteOitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompleteOitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteOitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
