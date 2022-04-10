import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionsTreeComponent } from './dimensions-tree.component';

describe('DimensionsTreeComponent', () => {
  let component: DimensionsTreeComponent;
  let fixture: ComponentFixture<DimensionsTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DimensionsTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
