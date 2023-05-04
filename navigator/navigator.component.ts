import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ObjectiveService } from 'src/app/collaboration/services/objective.service';
import { ObjectiveCategoryComponent } from '../objective-category/objective-category.component';
import { ProjectService } from '../services/project.service';
import { NavObjectiveComponent } from './nav-objective/nav-objective.component';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent implements OnInit, OnChanges {
  @Input() objectives: any[] = [];
  @Input() projectId: string = '';
  @Input() selectedObjectiveId: string = '';
  @Input() isOwner = false;
  @Output() onUpdate = new EventEmitter();
  
  dimensions: any[] =[];
  categories:any[]=[];
  objectivesFromCategories :any[] =[];
  sortedObjectives :any[] =[];

  navigatorFilter: number = 1;

  constructor(
    private _service: ProjectService,
    private _objService: ObjectiveService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getCategories();
    this.getDimensions();
  }
  
  getDimensions(){
    this._service.getDimensions().subscribe((res: any) => {
      this.dimensions = res.filter((x: any)=>x.name != 'Default');
    })
  }

  getCategories(){
    this._service.getCategories().subscribe((res:any)=>{
      this.categories = res;
    this.getObjectivesFromCategory();
    })
  }

  getCategoriesByDimension(id:number):any{
    const cates = this.categories.filter(x=>x.dimensionCatalogId == id);
    cates.forEach(element => {
      element.expanded = this.hasObjectives(element)
    });
    return cates;
  }

  getObjectivesFromCategory():any{
    this._service.getObjectivesFromDimension().subscribe((res:any)=>{
      this.objectivesFromCategories = res.map((x: any) => ({
        objectiveCatalogId: x.objectiveCatalogId,
        categoryCatalogId: x.categoryCatalogId,
        dimensionCatalogId: x.dimensionCatalogId,
        maturityScore: x.maturityScore,
        name: x.name,
        projectId: this.projectId,
        class: this.getObjectiveClass(x),
        hasStarted: this.getObjectiveClass(x).includes('has'),
        date: this.getObjectiveDate(x),
        weight: this.getWeight(x),
        isNext: false,
        hasCollaboration: this.getHasCollaboration(x),
        link: x.link,
        video: x.video,
        text: x.text,
      }));
      this.sortObjectives();
    })
  }

  getObjectiveByCategory(id:number):any{
    return this.objectivesFromCategories.filter(x=>x.categoryCatalogId == id);
    
  }

  addObjective(category: number, objective: any){
    let ObjData = null;
    let fObj = this.objectives.filter((x: any) => objective.objectiveCatalogId===x.objectiveCatalogId || objective.name===x.description);
    if(fObj.length>0){
      ObjData = fObj[0];
    }
    const dialogRef = this.dialog.open(NavObjectiveComponent, {
      width: '600px',
      data: {
        selectedObjective: ObjData,
        objectiveId: ObjData ? ObjData.id : '0',
        selectedCategoryId: category,
        panelClass: 'filter-popup',
        projectId: this.projectId,
        selectedCatalogObjective: objective
      }
    });

    dialogRef.afterClosed().subscribe((res: boolean)=>{      
      if(res){
        this.getObjectives();
        this.onUpdate.emit();
      }
    })
  }
  viewObjective(id: any){
    let ObjData = null;
    let fObj = this.objectives.filter((x: any) => x.objectiveCatalogId == id);
    const catObj =  this.objectivesFromCategories.find(x=>x.objectiveCatalogId == id);
    
    if(fObj.length>0){
      ObjData = fObj[0];
    }
    const dialogRef = this.dialog.open(NavObjectiveComponent, {
      width: '600px',
      data: {
        selectedObjective: ObjData,
        objectiveId: ObjData ? ObjData.id : '0',
        selectedCategoryId: this.getCategoryId(ObjData.categories[0]),
        panelClass: 'filter-popup',
        projectId: this.projectId,
        selectedCatalogObjective: catObj
      }
    });

    dialogRef.afterClosed().subscribe((res: boolean)=>{      
      if(res){
        this.getObjectives();
        this.onUpdate.emit();
      }
    })
  }
  getObjectiveClass(objective: any){
    let ObjData = null;
    let ObjClass = "";
    let fObj = this.objectives.filter((x: any) => objective.objectiveCatalogId===x.objectiveCatalogId || objective.name===x.description);
    let objsByCategory = this.objectives.filter((x: any) => objective.categoryCatalogId === x.categoryCatalogId);
    if(fObj.length>0){
      ObjData = fObj[0];
      if(ObjData.hasCollaboration) ObjClass += 'collaboration ';
      if(ObjData.progress > 80 || ObjData.isClosed) ObjClass += 'has-completed ';
      else  ObjClass += 'has-objective ';
    }
    return ObjClass;
  }
  getObjectiveDate(objective: any){
    let ObjData = null;
    let fObj = this.objectives.filter((x: any) => objective.objectiveCatalogId===x.objectiveCatalogId || objective.name===x.description);
    
    if(fObj.length>0){
      ObjData = fObj[0];
      return ObjData.deadlineDate
    }
    else{
      return ''
    }
  }
  getWeight(objective: any){
    let DimData = null;
    let CatData = null;
    let fDim = this.dimensions.filter((x: any) => objective.dimensionCatalogId===x.dimensionCatalogId);
    let fCat = this.categories.filter((x: any) => objective.categoryCatalogId===x.categoryCatalogId);
    
    if(fDim.length > 0 && fCat.length > 0){
      DimData = fDim[0];
      CatData = fCat[0];
      return DimData.weight*(objective.maturityScore+CatData.number)
    }
    else{
      return 0
    }
  }

  getHasCollaboration(objective: any){
    let ObjData = null;
    let fObj = this.objectives.filter((x: any) => objective.objectiveCatalogId===x.objectiveCatalogId || objective.name===x.description);
    
    if(fObj.length>0){
      ObjData = fObj[0];
      return ObjData.hasCollaboration
    }
    return false
  }

  navigateRight(event: any){
    event.scrollLeft += 310;
    
  }
  navigateLeft(event: any){
    if(event.scrollLeft > 0){
      event.scrollLeft -= 310;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['projectId']){      
      this.getObjectives();
    }
    if(changes['selectedObjectiveId']){
      if(changes['selectedObjectiveId'].currentValue){
        this.navigatorFilter = 4;
        /*setTimeout(() => {
          this.viewObjective(this.selectedObjectiveId);
        }, 2100);*/
      }
    }
      
  }
  getObjectives(){
    this._objService.getByProject(this.projectId).subscribe((res: any)=>{
      this.objectives = res;
      console.log(this.objectives)
      this.objectivesFromCategories = this.objectivesFromCategories.map((x: any) => ({
        objectiveCatalogId: x.objectiveCatalogId,
        categoryCatalogId: x.categoryCatalogId,
        dimensionCatalogId: x.dimensionCatalogId,
        maturityScore: x.maturityScore,
        name: x.name,
        projectId: this.projectId,
        class: this.getObjectiveClass(x),
        hasStarted: this.getObjectiveClass(x).includes('has'),
        date: this.getObjectiveDate(x),
        weight: this.getWeight(x),
        isNext: false,
        hasCollaboration: this.getHasCollaboration(x),
        link: x.link,
        video: x.video,
        text: x.text
      }));
      this.sortObjectives();
    })
  }
  hasObjectives(category: any){
    switch(this.navigatorFilter){
      case 1: {
        const objs =  this.objectivesFromCategories.filter(x=>x.categoryCatalogId == category.categoryCatalogId && x.isNext);
        return objs.length > 0;
      }
      case 2: {
        const objs =  this.objectivesFromCategories.filter(x=>x.categoryCatalogId == category.categoryCatalogId && x.hasStarted);
        return objs.length > 0;
      }
      case 3: {
        const objs =  this.objectivesFromCategories.filter(x=>x.categoryCatalogId == category.categoryCatalogId && x.hasCollaboration);
        return objs.length > 0;
      }
      default: 
        const objs =  this.objectivesFromCategories.filter(x=>x.categoryCatalogId == category.categoryCatalogId);
        return objs.length > 0;
    }
  }

  sortObjectives(){
    const sorted = this.objectivesFromCategories.sort(function (a, b) {
        return a.categoryCatalogId - b.categoryCatalogId || a.weight - b.weight;
    });
    //const progress = this.objectivesFromCategories.filter(x => x.class.includes('has'));
    for (let index = 1; index < sorted.length; index++) {
      const first = sorted[index-1];  
      const second = sorted[index];
      if(!first.class.includes('has') && !second.class.includes('has')){
        const firstIndex = this.objectivesFromCategories.findIndex(x=>x.objectiveCatalogId==first.objectiveCatalogId);
        const secondIndex = this.objectivesFromCategories.findIndex(x=>x.objectiveCatalogId==second.objectiveCatalogId);
        this.objectivesFromCategories[firstIndex].isNext = true;
        this.objectivesFromCategories[firstIndex].class += ' highlighted';
        this.objectivesFromCategories[secondIndex].isNext = true;
        this.objectivesFromCategories[secondIndex].class += ' highlighted';
        break;
      }
    }
    /* let stop = 0;
    const lastFill = progress.length ? progress[progress.length-1] : null;
    for (let index = 0; index < sorted.length; index++) {
      const first = sorted[index];  
      if(!first.class.includes('has')){
        const firstIndex = this.objectivesFromCategories.findIndex(x=>x.objectiveCatalogId==first.objectiveCatalogId);
        this.objectivesFromCategories[firstIndex].isNext = true;
        this.objectivesFromCategories[firstIndex].class += ' highlighted';
      }
      if((lastFill && lastFill?.objectiveCatalogId == first.objectiveCatalogId) || stop > 0 || !lastFill){
        stop++;
      }
      if(stop > 2) break;
    }*/
  }

  changeFilter(selector: any){
    selector.removeAttribute('class');
    switch(this.navigatorFilter){
      case 1: {
        selector.classList.add('suggested');
        break;
      }
      case 2: {
        selector.classList.add('progress');
        break;
      }
      case 3: {
        selector.classList.add('collaborators');
        break;
      }
      default: {
        break;
      }
    }
  }

  getCategoryId(category: string){
    const cat = this.categories.find((x: any) => x.name == category);
    return cat?.categoryCatalogId ?? 0;
  }

  hasSelectedObjective(category: any){
    if(!this.selectedObjectiveId) return false;
    let fObj = this.objectives.find((x: any) => this.selectedObjectiveId===x.id);
    return category.name == fObj?.categories[0];
  }
  
  isActiveOrCompleted(progress: any){
    let objectiveColor = document.querySelector(':root') as HTMLElement;
    if(objectiveColor){
      if(progress.progress < 80){
         objectiveColor.style.setProperty('--activeOrNot', '#d6f0cd');
      }else {
        objectiveColor.style.setProperty('--activeOrNot', '#fae651');
      }
    }
  }

}