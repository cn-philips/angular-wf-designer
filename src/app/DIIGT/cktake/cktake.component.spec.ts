import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CktakeComponent } from './cktake.component';

describe('CktakeComponent', () => {
  let component: CktakeComponent;
  let fixture: ComponentFixture<CktakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CktakeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CktakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
