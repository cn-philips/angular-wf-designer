import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InconmodifComponent } from './inconmodif.component';

describe('InconmodifComponent', () => {
  let component: InconmodifComponent;
  let fixture: ComponentFixture<InconmodifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InconmodifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InconmodifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
