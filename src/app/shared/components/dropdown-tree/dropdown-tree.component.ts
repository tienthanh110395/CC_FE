import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Observable } from 'rxjs';

export class TicketNode {
  children?: TicketNode[];
  name: string;
  code: string;
  ticketErrorCauseId: number;
  parentId: number;
  item: any;
}

export class TicketFlatNode {
  item: any;
  level: number;
  expandable: boolean;
  name: string;
  ticketErrorCauseId: number;
  code: string;
  parentId: number;
  selected: boolean;
}

@Component({
  selector: 'app-dropdown-tree',
  templateUrl: './dropdown-tree.component.html',
  styleUrls: ['./dropdown-tree.component.scss'],
})
export class DropdownTreeComponent implements OnInit {
  dataChange = new BehaviorSubject<TicketNode[]>([]);
  treeData: any[];

  get data(): TicketNode[] {
    return this.dataChange.value;
  }
  @Input() rawData;
  @Output() onSelected = new EventEmitter();
  dataSource: MatTreeFlatDataSource<TicketNode, TicketFlatNode>;

  flatNodeMap = new Map<TicketFlatNode, TicketNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TicketNode, TicketFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TicketFlatNode | null = null;

  /** The new item's name */
  newItemName = "";

  treeControl: FlatTreeControl<TicketFlatNode>;

  treeFlattener: MatTreeFlattener<TicketNode, TicketFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TicketFlatNode>(true /* multiple */);

  /// Filtering
  myControl = new FormControl();
  options: string[] = ["One", "Two", "Three"];
  filteredOptions: Observable<string[]>;
  rootCauseSelected: TicketFlatNode;
  constructor(
  ) {

  }

  ngOnInit() {
    this.initialize();
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<TicketFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }
  initialize() {
    this.treeData = this.getNestedChildren(this.rawData, undefined);
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    const data = this.getNestedChildren(this.rawData, undefined);
    // Notify the change.
    this.dataChange.next(data);
  }

  public filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      // Filter the tree
      function filter(array, text) {
        const getChildren = (result, object) => {
          if (object.item.toLowerCase() === text.toLowerCase()) {
            result.push(object);
            return result;
          }
          if (Array.isArray(object.children)) {
            const children = object.children.reduce(getChildren, []);
            if (children.length) result.push({ ...object, children });
          }
          return result;
        };

        return array.reduce(getChildren, []);
      }

      filteredTreeData = filter(this.treeData, filterText);
    } else {
      // Return the initial tree
      filteredTreeData = this.treeData;
    }

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    const data = filteredTreeData;
    // Notify the change.
    this.dataChange.next(data);
  }
  getLevel = (node: TicketFlatNode) => node.level;

  isExpandable = (node: TicketFlatNode) => node.expandable;

  getChildren = (node: TicketNode): TicketNode[] => node.children;

  hasChild = (_: number, _nodeData: TicketFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TicketFlatNode) => _nodeData.name === "";

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TicketNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item ? existingNode : new TicketFlatNode();
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    flatNode.name = node.name;
    flatNode.ticketErrorCauseId = node.ticketErrorCauseId;
    flatNode.parentId = node.parentId;
    flatNode.code = node.code;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TicketFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TicketFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TicketFlatNode): void {
    node.selected = !node.selected;
    this.rootCauseSelected = node;
    this.onSelected.emit(this.rootCauseSelected);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TicketFlatNode): void {
    node.selected = !node.selected;
    this.rootCauseSelected = node;
    this.onSelected.emit(this.rootCauseSelected);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TicketFlatNode): void {
    let parent: TicketFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TicketFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TicketFlatNode): TicketFlatNode | null {
    console.log(this.checklistSelection.selected);
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  getSelectedItems(): string {
    if (!this.rootCauseSelected) {
      return 'Nguyên nhân';
    }
    return this.rootCauseSelected?.name;
  }

  filterChanged(filterText: string) {
    // ChecklistDatabase.filter method which actually filters the tree and gives back a tree structure
    this.filter(filterText);
    if (filterText) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }

  getNestedChildren(arr, parentId) {
    var children = [];
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i].parentId == parentId) {
        var grandChildren = this.getNestedChildren(arr, arr[i].ticketErrorCauseId)
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