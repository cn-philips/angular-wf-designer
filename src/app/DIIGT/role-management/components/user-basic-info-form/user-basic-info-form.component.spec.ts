import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBasicInfoFormComponent } from './user-basic-info-form.component';

describe('UserBasicInfoFormComponent', () => {
  let component: UserBasicInfoFormComponent;
  let fixture: ComponentFixture<UserBasicInfoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserBasicInfoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserBasicInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
