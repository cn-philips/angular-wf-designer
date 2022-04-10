import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplementOaComponent } from './supplement-oa.component';

describe('SupplementOaComponent', () => {
  let component: SupplementOaComponent;
  let fixture: ComponentFixture<SupplementOaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplementOaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplementOaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
