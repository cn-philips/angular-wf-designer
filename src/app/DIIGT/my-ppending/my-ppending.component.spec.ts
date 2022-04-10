import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPpendingComponent } from './my-ppending.component';

describe('MyPpendingComponent', () => {
  let component: MyPpendingComponent;
  let fixture: ComponentFixture<MyPpendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyPpendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPpendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
