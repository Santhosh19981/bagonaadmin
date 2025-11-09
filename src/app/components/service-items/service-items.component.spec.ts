import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceItemsComponent } from './service-items.component';

describe('ServiceItemsComponent', () => {
  let component: ServiceItemsComponent;
  let fixture: ComponentFixture<ServiceItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
