import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyTenderModifComponent } from './apply-tender-modif.component';

describe('ApplyTenderModifComponent', () => {
  let component: ApplyTenderModifComponent;
  let fixture: ComponentFixture<ApplyTenderModifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplyTenderModifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyTenderModifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
