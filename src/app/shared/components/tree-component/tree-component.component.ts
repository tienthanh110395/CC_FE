import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';

export class TreeModel {
  children: Array<TreeModel>;
  name: string;
  isCheck: boolean;
}

@Component({
  selector: 'crm-tree-component',
  templateUrl: './tree-component.component.html',
  styleUrls: ['./tree-component.component.scss']
})
export class TreeComponentComponent implements OnInit, OnChanges {
  @ViewChild('tree') tree: MatTree<any>;
  @Input() treeData = [];
  @Input() heightScroll;
  nestedTreeControl: NestedTreeControl<TreeModel>;
  nestedDataSource: MatTreeNestedDataSource<TreeModel>;
  selectedData = new SelectionModel<any>();
  @Output() selectNode = new EventEmitter();
  constructor() {
    this.nestedTreeControl = new NestedTreeControl<TreeModel>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
  }

  ngOnInit() {
    // build data lại dạng tree
    this.nestedDataSource.data = this.getNestedChildren(this.treeData, undefined);
  }

  hasNestedChild = (_: number, nodeData: TreeModel) => { return nodeData.children && nodeData.children.length > 0 };

  private _getChildren = (node: TreeModel) => node.children;
  changeState(data) {
    data.expanded = !data.expanded;
  }
  chooseNode(item: any) {
    this.selectedData = item;
    this.selectNode.next(this.selectedData);
  }

  ngOnChanges() {
    this.nestedDataSource.data = this.treeData;
    this.chooseNode(this.nestedDataSource.data[0]);
  }

  getNestedChildren(arr, parentId) {
    var children = [];
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i].parentId == parentId) {
        var grandChildren = this.getNestedChildren(arr, arr[i].ticketTypeId)
        if (grandChildren.length) {
          arr[i].children = grandChildren;
          arr[i].expandable = true;
        }
        children.push(arr[i]);
      }
    }
    return children;
  }
}
