import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesFormComponent } from './services-form.component';

describe('ServicesFormComponent', () => {
  let component: ServicesFormComponent;
  let fixture: ComponentFixture<ServicesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
