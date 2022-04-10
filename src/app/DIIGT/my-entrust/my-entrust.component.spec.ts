import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEntrustComponent } from './my-entrust.component';

describe('MyEntrustComponent', () => {
  let component: MyEntrustComponent;
  let fixture: ComponentFixture<MyEntrustComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyEntrustComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyEntrustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
