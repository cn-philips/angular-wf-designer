import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InorderOrComponent } from './inorder-or.component';

describe('InorderOrComponent', () => {
  let component: InorderOrComponent;
  let fixture: ComponentFixture<InorderOrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InorderOrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InorderOrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
