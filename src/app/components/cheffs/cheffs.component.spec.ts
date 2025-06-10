import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheffsComponent } from './cheffs.component';

describe('CheffsComponent', () => {
  let component: CheffsComponent;
  let fixture: ComponentFixture<CheffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheffsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
