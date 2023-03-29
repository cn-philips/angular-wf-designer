import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { RouterExtendService } from "@app/modern-themes/services/router-extend.service";
import { HttpService } from "@core/services";
import { BiddingV3Service } from "@pages/bidding-v3/bidding-v3.service";

type OitLink = {
  applyId: string;
  applyType: string;
  processStatus: string;
  processInstanceId: string;
};

@Component({
  selector: "bidding-v3-oit-related-link",
  templateUrl: "oit-related-link.component.html",
  styleUrls: ["./oit-related-link.component.scss"],
})
export class OitRelatedLinkComponent implements OnInit, OnChanges {
  @Input() applyDetail = {
    id: null,
    marketBundles: [],
  };

  visible = false;

  oitLinks: OitLink[] = [];
  processStatus: string

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private routerExt: RouterExtendService,
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.applyDetail) {
      const { previousValue, currentValue } = changes.applyDetail;
      if ((!previousValue || !previousValue.id) && currentValue.id) {
        const {
          queryParams: { processStatus },
        } = this.activatedRoute.snapshot;
        if (processStatus !== "ecos_bid_done") {
          return;
        }
        this.processStatus = processStatus
        const marketBundleIds = (this.applyDetail.marketBundles || [])
          .filter(({ oitStatus }) => oitStatus === 1)
          .map(({ id }) => id);
        if (marketBundleIds.length > 0) {
          this.getOitLinks(marketBundleIds)
        }
      }
    }
  }

  getOitLinks(marketBundleIds: string[]) {
    const url = `/act/ecos/bidding/apply/oitData`
    this.http.post(url, marketBundleIds).subscribe(({ code, data }) => {
      if (code === '0000') {
        this.oitLinks = data.sort((left, right) => left.applyType.localeCompare(right.applyType))
        this.visible = true
      }
    }, () => {
      this.visible = false
    });
  }

  goOitPage(oitData: OitLink) {
    let url = "";
      let orderExamine = [
        "ecos_oit_deal_countersign",
        "ecos_oit_deal_sales",
        "ecos_oit_deal_sub_process",
        "ecos_oit_deal_done",
        "ecos_oit_deal_canceled",
      ];
      let orderOa = ["ecos_oit_deal_oa"];
      let orderv3 = [
        "ecos_oit_deal_resubmit",
        "ecos_oit_deal_submit",
        "ecos_status_draft",
      ];
      let contract = ["ecos_oit_order_submit", "ecos_oit_order_resubmit"];
      let contractExamine = [
        "ecos_oit_order_oa",
        "ecos_oit_order_dm",
        "ecos_oit_order_zsl",
        "ecos_oit_order_install_terms",
        "ecos_oit_order_logistics_terms",
        "ecos_oit_order_nstd_countersign",
        "ecos_oit_order_site_terms",
        "ecos_oit_order_install_sup",
        "ecos_oit_order_sp_cop_leader",
        "ecos_oit_order_sp_cluster_bp",
        "ecos_oit_order_sp_countersign",
        "ecos_oit_order_sp_cfc_leader",
        "ecos_oit_order_payment_terms",
        "ecos_oit_order_payment_sup",
        "ecos_oit_order_rm",
        "ecos_oit_order_cancel_oa",
        "ecos_oit_order_cancel_dm",
        "ecos_oit_order_canceled",
      ];
      let ordersummary = [
        "ecos_oit_order_os_input",
        "ecos_oit_order_os_finance",
        "ecos_oit_order_os_finance_bp",
      ];
      let contractSign = ["ecos_oit_order_sign"];
      let oitcomplete = [
        "ecos_oit_order_upload",
        "ecos_oit_order_done",
        "ecos_oit_order_change_approval",
        "ecos_oit_order_change_submit",
        "ecos_oit_order_change_resubmit",
        "ecos_oit_order_change_first_approval",
        "ecos_oit_order_change_second_approval",
      ];
      if (orderExamine.includes(oitData.processStatus)) {
        url = "/order-v3/orderExamine";
      } else if (orderOa.includes(oitData.processStatus)) {
        url = "/order-v3/orderOa";
      } else if (orderv3.includes(oitData.processStatus)) {
        url = "/order-v3";
      } else if (contract.includes(oitData.processStatus)) {
        url = "/order-v3/contract";
      } else if (contractExamine.includes(oitData.processStatus)) {
        url = "/order-v3/contractExamine";
      } else if (ordersummary.includes(oitData.processStatus)) {
        url = "/order-v3/ordersummary";
      } else if (contractSign.includes(oitData.processStatus)) {
        url = "/order-v3/contractSign";
      } else if (oitcomplete.includes(oitData.processStatus)) {
        url = "/order-v3/oitcomplete";
      }
      this.routerExt.navigateWithNewWindow([url], {
        queryParams: {
          id: oitData.applyId,
          taskStatus: oitData.processStatus,
          procInstId: oitData.processInstanceId,
          processStatus: oitData.processStatus,
          flag: 1,
        },
      });
  }
}
