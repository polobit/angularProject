import {
  HostListener,
  EventEmitter,
  Output,
  ElementRef,
  Component,
  Inject,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { AppConfiguration, Languages } from '../app.configuration';
import { FilterService } from '../services/filter.service';
import { ISubscription } from 'rxjs/Subscription';
import { CashFlowChartService } from './cash-flow-chart.service';
import { ICashFLowChart } from '../app.interface';
import * as _ from 'lodash';

@Component({
  selector: 'app-cash-flow-chart',
  templateUrl: './cash-flow-chart.component.html',
  styleUrls: ['./cash-flow-chart.component.scss'],
  providers: [CashFlowChartService]
})
export class CashFlowChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  el: any;
  flowchartWidth = 3500;
  flowchartHeight = 2000;
  screenWidth = 1024;

  public flowchartData: any;
  public selectedPeriod;
  public selectedCustomerList = [];
  public selectedModelList = [];
  public AppConfiguration = AppConfiguration;
  public Languages = Languages;
  public customerChips: { removable: boolean, text: string }[] = [];
  public modelChips: { removable: boolean, text: string }[] = [];
  public periodChips: { removable: boolean, text: string };
  private filterSubscription: ISubscription;
  private maxValue;

  constructor(@Inject(ElementRef) elementRef: ElementRef, private filterService: FilterService,
    private cashFlowChartService: CashFlowChartService) {
    this.el = elementRef;
    this.filterSubscription = this.filterService.getSelectedFilter().subscribe(updatedFilter => {
      this.selectedPeriod = updatedFilter.period;
      this.selectedCustomerList = [];
      this.selectedModelList = [];
      this.selectedCustomerList.push(updatedFilter.customer);
      this.selectedModelList.push(updatedFilter.model);

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

      this.getChartData();

    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    const el = event ? event.target : window;
    this.screenWidth = el.innerWidth;
    this.ngOnChanges();
  }

  ngOnInit() {
    this.onResize();
  }

  ngOnChanges() {
    const windowWidth = window.innerWidth;
    const content = this.el.nativeElement.querySelector('.mat-tab-body-content');

    const svg = this.el.nativeElement.querySelector('.mat-tab-body-content svg');
    const svgScale = windowWidth / 1500 > 1 ? 1 : windowWidth / 1500 < 0.66 ? 0.66 : windowWidth / 1500;

    const svgY = -1134.453782 * svgScale * svgScale + 2942.016807 * svgScale - 1807.563025;
    if (svg) {
      svg.style.transform = `scale(${svgScale}) translateY(${svgY}px)`;
      setTimeout(() => {
        content.scrollLeft = svg.clientWidth / 2 - content.clientWidth / 2;
      });
    }
  }

  ngAfterViewInit() {
    this.ngOnChanges();
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  public getChartData() {
    this.cashFlowChartService.getChartDataService(this.selectedCustomerList, this.selectedModelList, this.selectedPeriod)
      .subscribe((chartDataResponse: ICashFLowChart) => {
        this.flowchartData = chartDataResponse ? chartDataResponse.cashFlowNode[0] : [];
        if (chartDataResponse && chartDataResponse.cashFlowNode
          && chartDataResponse.cashFlowNode[0].children
          && chartDataResponse.cashFlowNode[0].children.length > 0) {
          this.getMaxNode(chartDataResponse.cashFlowNode[0].children);
        }
      });
  }

  public getMaxNode(arrayObject) {
    this.maxValue = _.maxBy(arrayObject, 'percentage');
    this.maxValue = _.merge(this.maxValue, { fillColor: '#F6B3A5' });
    if (arrayObject.length) {
      for (let i = 0; i < arrayObject.length; i++) {
        this.getMaxNode(arrayObject[i].children);
        _.flatMapDeep(arrayObject[i].children, (data) => {
          if (data.name === 'Wrong user practices' || data.name === 'Jam') {
            data = _.merge(data, { color: '#FF0000' });
          }
          if (data.children[0]) {
            data = _.merge(data, { fillColor: '#F6B3A5' });
          }
        });
      }
    }
  }
}
