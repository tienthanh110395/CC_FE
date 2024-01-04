import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppStorage } from '@app/core/services/AppStorage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.scss']
})
export class PriceListComponent implements OnInit, AfterViewInit {

  vehicleGroup = [];

  columns = [];
  displayedColumns = [];

  dataSource = new MatTableDataSource<any>();
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(public dialogRef: MatDialogRef<PriceListComponent>,
    protected _translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.getVehicleGroup();
    this.dataSource.data = this.data?.listData || [];
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'vehicle.vehicleTypeFee', field: 'vehicleGroupName' },
      { i18n: 'search-bot.description', field: 'vehicleGroupDescription' },
      { i18n: 'search-bot.turnTicket', field: 'ticketPrices' },
      { i18n: 'search-bot.monthTicket', field: 'monthlyTicketPrices' },
      { i18n: 'search-bot.quarterTicket', field: 'quarterlyTicketPrices' }
    ];
    this.displayedColumns = this.columns.map(x => x.field);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getVehicleGroup() {
    this.vehicleGroup = AppStorage.get('vehicle-group');
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}
