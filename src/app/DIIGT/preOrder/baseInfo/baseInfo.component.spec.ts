import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppService } from '../../../app.service';

import { PreOrderBaseInfoComponent } from './baseInfo.component';

describe('BaseInfoComponent', () => {
  let component: PreOrderBaseInfoComponent;
  let fixture: ComponentFixture<PreOrderBaseInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ AppService ],
      declarations: [ PreOrderBaseInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreOrderBaseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
