import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyViewTableComponent } from './my-view-table.component';

describe('MyViewTableComponent', () => {
  let component: MyViewTableComponent;
  let fixture: ComponentFixture<MyViewTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyViewTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyViewTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
