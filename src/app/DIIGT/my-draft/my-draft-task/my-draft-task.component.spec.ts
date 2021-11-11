import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDraftTaskComponent } from './my-draft-task.component';

describe('MyDraftTaskComponent', () => {
  let component: MyDraftTaskComponent;
  let fixture: ComponentFixture<MyDraftTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyDraftTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDraftTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
