import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningconfirmComponent } from './winningconfirm.component';

describe('WinningconfirmComponent', () => {
  let component: WinningconfirmComponent;
  let fixture: ComponentFixture<WinningconfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningconfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningconfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
