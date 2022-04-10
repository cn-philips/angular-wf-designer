import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreorderauditComponent } from './preorderaudit.component';

describe('PreorderauditComponent', () => {
  let component: PreorderauditComponent;
  let fixture: ComponentFixture<PreorderauditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreorderauditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreorderauditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
