import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeboxComponent } from './treebox.component';

describe('TreeboxComponent', () => {
  let component: TreeboxComponent;
  let fixture: ComponentFixture<TreeboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
