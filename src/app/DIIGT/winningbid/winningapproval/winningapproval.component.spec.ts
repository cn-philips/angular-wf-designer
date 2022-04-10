import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningapprovalComponent } from './winningapproval.component';

describe('WinningapprovalComponent', () => {
  let component: WinningapprovalComponent;
  let fixture: ComponentFixture<WinningapprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningapprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningapprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
