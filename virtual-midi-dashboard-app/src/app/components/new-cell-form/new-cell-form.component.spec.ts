import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCellFormComponent } from './new-cell-form.component';

describe('NewCellFormComponent', () => {
  let component: NewCellFormComponent;
  let fixture: ComponentFixture<NewCellFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewCellFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCellFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
