import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningbidComponent } from './winningbid.component';

describe('WinningbidComponent', () => {
  let component: WinningbidComponent;
  let fixture: ComponentFixture<WinningbidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningbidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningbidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
