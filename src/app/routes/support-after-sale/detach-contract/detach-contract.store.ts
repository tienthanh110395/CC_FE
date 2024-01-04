import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DetachContractStore {

  private _listContractDetach = new BehaviorSubject<any>(null);
  currentListContractDetach$ = this._listContractDetach.asObservable();
  constructor() { }
  changeListContractDetach(listContract) {
    this._listContractDetach.next(listContract);
  }
}
