import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeOnwerComponent } from './change-onwer.component';

describe('ChangeOnwerComponent', () => {
  let component: ChangeOnwerComponent;
  let fixture: ComponentFixture<ChangeOnwerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeOnwerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeOnwerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
