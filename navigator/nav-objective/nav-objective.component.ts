import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ObjectiveService } from 'src/app/collaboration/services/objective.service';

@Component({
  selector: 'app-nav-objective',
  templateUrl: './nav-objective.component.html',
  styleUrls: ['./nav-objective.component.scss']
})
export class NavObjectiveComponent implements OnInit {

  public objectiveId;
  public selectedCategoryId;
  public selectedObjective;
  public selectedCatalogObjective;
  public selectedProjectId;

  constructor(
    private _service: ObjectiveService, 
    public dialogRef: MatDialogRef<NavObjectiveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.selectedObjective = data.selectedObjective
      this.objectiveId = data.objectiveId
      this.selectedCategoryId = data.selectedCategoryId
      this.selectedCatalogObjective = data.selectedCatalogObjective
      this.selectedProjectId = data.projectId
    }

  ngOnInit(): void {
    this.dialogRef.updatePosition({ left: '120px', bottom: '105px'});
    
  }

  close(){
    this.dialogRef.close(true);
  }

}
