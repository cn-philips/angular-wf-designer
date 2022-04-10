import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdcheckComponent } from './thirdcheck.component';

describe('ThirdcheckComponent', () => {
  let component: ThirdcheckComponent;
  let fixture: ComponentFixture<ThirdcheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThirdcheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThirdcheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
