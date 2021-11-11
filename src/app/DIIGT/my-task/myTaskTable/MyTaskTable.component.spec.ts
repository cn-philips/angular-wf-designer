import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTaskTableComponent } from './MyTaskTable.component';

describe('MyTaskTableComponent', () => {
  let component: MyTaskTableComponent;
  let fixture: ComponentFixture<MyTaskTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTaskTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTaskTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
