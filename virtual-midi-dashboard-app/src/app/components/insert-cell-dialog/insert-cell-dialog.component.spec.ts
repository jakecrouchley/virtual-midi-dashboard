import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertCellDialogComponent } from './insert-cell-dialog.component';

describe('InsertCellDialogComponent', () => {
  let component: InsertCellDialogComponent;
  let fixture: ComponentFixture<InsertCellDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InsertCellDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertCellDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
