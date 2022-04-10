import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InorderExamineComponent } from './inorder-examine.component';

describe('InorderExamineComponent', () => {
  let component: InorderExamineComponent;
  let fixture: ComponentFixture<InorderExamineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InorderExamineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InorderExamineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
