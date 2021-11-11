import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreordermodifComponent } from './preordermodif.component';

describe('PreordermodifComponent', () => {
  let component: PreordermodifComponent;
  let fixture: ComponentFixture<PreordermodifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreordermodifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreordermodifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
