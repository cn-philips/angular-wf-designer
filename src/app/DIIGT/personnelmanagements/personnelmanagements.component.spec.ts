import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnelmanagementsComponent } from './personnelmanagements.component';

describe('PersonnelmanagementsComponent', () => {
  let component: PersonnelmanagementsComponent;
  let fixture: ComponentFixture<PersonnelmanagementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonnelmanagementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonnelmanagementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
