import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppService } from '../../app.service';

import { PreOrderComponent } from './preOrder.component';

describe('PreOrderComponent', () => {
  let component: PreOrderComponent;
  let fixture: ComponentFixture<PreOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [ AppService ],
      declarations: [ PreOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
