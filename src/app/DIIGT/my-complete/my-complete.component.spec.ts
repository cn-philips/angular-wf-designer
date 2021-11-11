import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCompleteComponent } from './my-complete.component';

describe('MyCompleteComponent', () => {
  let component: MyCompleteComponent;
  let fixture: ComponentFixture<MyCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
