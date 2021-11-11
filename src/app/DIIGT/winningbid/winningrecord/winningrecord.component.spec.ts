import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningrecordComponent } from './winningrecord.component';

describe('WinningrecordComponent', () => {
  let component: WinningrecordComponent;
  let fixture: ComponentFixture<WinningrecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinningrecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinningrecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
