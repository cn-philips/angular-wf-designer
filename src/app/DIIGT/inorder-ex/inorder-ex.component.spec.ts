import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InorderExComponent } from './inorder-ex.component';

describe('InorderExComponent', () => {
  let component: InorderExComponent;
  let fixture: ComponentFixture<InorderExComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InorderExComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InorderExComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
