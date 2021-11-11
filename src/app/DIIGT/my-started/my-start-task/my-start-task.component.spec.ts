import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyStartTaskComponent } from './my-start-task.component';

describe('MyStartTaskComponent', () => {
  let component: MyStartTaskComponent;
  let fixture: ComponentFixture<MyStartTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyStartTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyStartTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
