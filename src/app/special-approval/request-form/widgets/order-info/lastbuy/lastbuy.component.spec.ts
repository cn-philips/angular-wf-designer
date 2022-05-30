import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LastbuyComponent } from './lastbuy.component';

describe('LastbuyComponent', () => {
  let component: LastbuyComponent;
  let fixture: ComponentFixture<LastbuyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LastbuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastbuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
