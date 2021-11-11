import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InorderComponent } from './inorder.component';

describe('InorderComponent', () => {
  let component: InorderComponent;
  let fixture: ComponentFixture<InorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
