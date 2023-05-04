import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavObjectiveComponent } from './nav-objective.component';

describe('NavObjectiveComponent', () => {
  let component: NavObjectiveComponent;
  let fixture: ComponentFixture<NavObjectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavObjectiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavObjectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
