import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OitcompleteComponent } from './oitcomplete.component';

describe('OitcompleteComponent', () => {
  let component: OitcompleteComponent;
  let fixture: ComponentFixture<OitcompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OitcompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OitcompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
