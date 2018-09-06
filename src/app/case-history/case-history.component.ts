import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { AppConfiguration, Languages } from '../app.configuration';
import { UnitLifeService } from 'app/unit-life/unit-life.component.service';
import { FilterService } from '../services/filter.service';
import { SecurePipe } from '../services/securepipe';
import * as _ from 'lodash';
import { CaseHistoryService } from './case-history.service';
import { ICaseDetailsHistory, IUnitDataValue, IUnitData } from '../app.interface';

@Component({
  selector: 'app-case-history',
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.scss'],
  providers: [UnitLifeService, CaseHistoryService]
})
export class CaseHistoryComponent implements OnInit, OnDestroy {
  @Input('width') width;
  @Input('height') height;
  @ViewChild('infoTable') infoTable;

  public Languages = Languages;
  public AppConfiguration = AppConfiguration;
  public selectedPeriod;
  public selectedFrequency;
  public selectedCustomerList = [];
  public selectedModelList = [];
  public customerChips: { removable: boolean, text: string }[] = [];
  public modelChips: { removable: boolean, text: string }[] = [];
  public periodChips: { removable: boolean, text: string };
  public machineData: IUnitDataValue;
  public tableData = [];
  public columnList = ['caseNumber', 'caseDate', 'phoneFix' , 'jobType',  'description', 'status'];
  public machineId: String;
  public caseDetails: ICaseDetailsHistory;
  public toNumber = _.toNumber;
  public notAvailable = Languages.get('global.notAvailable', 'upper');

  private pageOffset: number;
  private pageLimit: number;
  private filterSubscription: ISubscription;

  constructor(private unitLifeService: UnitLifeService,
    private route: ActivatedRoute,
    private filterService: FilterService,
    private securePipe: SecurePipe,
    private caseHistoryService: CaseHistoryService) {
    this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
      this.selectedCustomerList = [];
      this.selectedModelList = [];
      this.selectedCustomerList.push(updatedFilter.customer);
      this.selectedModelList.push(updatedFilter.model);
      this.selectedPeriod
        = this.AppConfiguration.global.periods.frequency[this.AppConfiguration.global.periods.values.indexOf(updatedFilter.period)];
      this.selectedFrequency
        = this.AppConfiguration.global.periods.reportFrequency
        [this.AppConfiguration.global.periods.values.indexOf(updatedFilter.period)];
      updatedFilter.customer.forEach(element => {
        this.customerChips.push({
          removable: element !== 'ALL',
          text: element
        });
      });

      updatedFilter.model.forEach(element => {
        this.modelChips.push({
          removable: element !== 'ALL',
          text: element
        });
      });

      this.periodChips = {
        removable: updatedFilter.period !== 'pastthirtydays',
        text: updatedFilter.period
      };

      this.route.params.subscribe(params => {
        this.pageOffset = params['pageOffset'];
        this.pageLimit = params['pageLimit'];
        this.machineId = params['machineId'];
      });
    });

    this.width = route.snapshot.data['width'] || this.width || AppConfiguration.global.kpiChart.resolution.desktop.width;
    this.height = route.snapshot.data['height'] || this.height || AppConfiguration.global.kpiChart.resolution.desktop.height;
  }
  ngOnInit() {
    this.getSelectedMachineDetails();
    this.getCaseHistory();
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  getSelectedMachineDetails() {
    this.unitLifeService.getUnitLifeData(this.selectedCustomerList,
      this.selectedModelList, this.pageOffset, this.pageLimit)
      .subscribe((unitLifeResponse: IUnitData) => {
        this.machineData = _.find(unitLifeResponse.units, x => x.serial === this.machineId);
        this.machineData.path = `${AppConfiguration.url}/modelinfo/model/?path=${this.machineData.path}`;
      });
  }

  getCaseHistory() {
    this.caseHistoryService.getCaseHistoryService(this.machineId)
      .subscribe((caseHistoryResponse: ICaseDetailsHistory) => {
        if (caseHistoryResponse.caseDetails.length > 0) {
          this.tableData = caseHistoryResponse.caseDetails;
        } else {
          this.tableData = [];
        }
      });
  }

  viewCaseHistory() {
    this.infoTable.openDialog();
  }
}
