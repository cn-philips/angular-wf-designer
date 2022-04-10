import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningproductComponent } from './winningproduct.component';

describe('WinningproductComponent', () => {
  let component: WinningproductComponent;
  let fixture: ComponentFixture<WinningproductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningproductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
