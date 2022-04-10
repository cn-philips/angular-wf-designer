import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InorderAccComponent } from './inorder-acc.component';

describe('InorderAccComponent', () => {
  let component: InorderAccComponent;
  let fixture: ComponentFixture<InorderAccComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InorderAccComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InorderAccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
