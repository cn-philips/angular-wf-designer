import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleModalityBMCFormComponent } from './role-modality-bmc-form.component';

describe('RoleModalityBMCFormComponent', () => {
  let component: RoleModalityBMCFormComponent;
  let fixture: ComponentFixture<RoleModalityBMCFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleModalityBMCFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleModalityBMCFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
