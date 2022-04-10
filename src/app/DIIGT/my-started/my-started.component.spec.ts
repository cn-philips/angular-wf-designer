import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyStartedComponent } from './my-started.component';

describe('MyStartedComponent', () => {
  let component: MyStartedComponent;
  let fixture: ComponentFixture<MyStartedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyStartedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyStartedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
