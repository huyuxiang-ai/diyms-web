import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  get baseUrl(): string {
    return environment.managerBaseUrl;
  }

  get coreUrl(): string {
    return environment.coreBaseUrl;
  }

  get permission() {
    return {
      loginUrl: `${this.baseUrl}/auth/login/`,
      resetPasswordUrl: `${this.baseUrl}/auth/system/user/reset_password`,
      userUrl: `${this.baseUrl}/auth/system/user/`,
      deleteLongAgoUserUrl: `${this.baseUrl}/auth/system/user/clean/`,
      menuUrl: `${this.baseUrl}/auth/system/menu/`,
      MenuByLoginUrl: `${this.baseUrl}/auth/system/menu/webrouter/`,
      roleUrl: `${this.baseUrl}/auth/system/role/`,
      MenuByRoleIdUrl: `${this.baseUrl}/auth/system/role/role_get_menu/`,
      deptUrl: `${this.baseUrl}/auth/system/dept/`,
      systemUrl: `${this.baseUrl}/auth/system/`,
      uploadImageUrl: `${this.baseUrl}/auth/system/upload_image/`,
      refreshTokenUrl: `${this.baseUrl}/auth/token/refresh/`,
      validateTokenUrl: `${this.baseUrl}/auth/token/`,
    };
  }

  get algoruthmPreference() {
    return {
      systemConfigUrl: `${this.baseUrl}/alg/result/pre_recorded_info/`,
      storageaiUrl: `${this.coreUrl}/storageai`,
    };
  }

  get algorithmConfig() {
    return {
      vesselUrl: `${this.baseUrl}/alg/preference/vessel_info/`,
      getVesselUrl: `${this.baseUrl}/vessel`,
      mainBlockUrl: `${this.baseUrl}/alg/preference/main_block/`,
      blockUrl: `${this.baseUrl}/alg/preference/block/`,
      blockGroupUrl: `${this.baseUrl}/alg/preference/block_group/`,
      storageRecordUrl: `${this.baseUrl}/alg/result/storage_record/`,
      systemConfigUrl: `${this.baseUrl}/alg/preference/param_config/`,
      cacheUrl: `${this.baseUrl}/alg/result/cache/`,
      blockControlUrl: `${this.baseUrl}/alg/preference/range_control/`,
      rangeUrl: `${this.baseUrl}/alg/preference/range/`,
      weightClassControlUrl: `${this.baseUrl}/alg/preference/weight_control/`,
      weightClassUrl: `${this.baseUrl}/alg/preference/weight_class/`,
      shippingLinePodUrl: `${this.baseUrl}/alg/preference/shipping_line_pod/`,
      emptyContainerStorageDaysUrl: `${this.baseUrl}/nict/alg/preference/empty_ctn_owner/`,
      specialAreaConfigurationUrl: `${this.baseUrl}/nict/alg/preference/specific_group/`,
    };
  }

  get monitorting() {
    return {
      vesselMonitoringUrl: `${this.baseUrl}/monitoring/vessel_monitoring/`,
      jobPathMonitoringUrl: `${this.baseUrl}/monitoring/operate_road_monitoring/`,
      yardPlanVisionUrl: `${this.baseUrl}/monitoring/yard_plan/`,
      // 添加堆场可视化相关的URL
      blockUrl: `${this.baseUrl}/monitoring/block/`,
      equipmentUrl: `${this.baseUrl}/monitoring/equipment/`,
      instructionUrl: `${this.baseUrl}/monitoring/instruction/`,
      blockBayInstructionUrl: `${this.baseUrl}/monitoring/block_bay_instruction/`,
      blockBayUrl: `${this.baseUrl}/monitoring/block_bay/`,
      blockBayContainersUrl: `${this.baseUrl}/monitoring/block_bay_container/`,
      visualPlansUrl: `${this.baseUrl}/monitoring/plan/`,
      equipmentMovesUrl: `${this.baseUrl}/monitoring/equipment_move/`,
      containersInfoUrl: `${this.baseUrl}/monitoring/container_info/`,
      vesselInfoUrl: `${this.baseUrl}/alg/preference/vessel_info/`,
      vesselsUrl: `${this.baseUrl}/visualisation/vessels/`,
      getBerthMonitoringUrl: `${this.baseUrl}/vessel_berthing_operation`,
      getBerthProcessUrl: `${this.baseUrl}/ctn_volumes`,
      instructionMonitoringUrl: `${this.baseUrl}/instruction_monitoring`,
      instructionMonitoringCheckUrl: `${this.baseUrl}/instruction_monitoring_check`,
    };
  }

  get dataStatistics() {
    return {
      ContainerDataStatisticsUrl: `${this.baseUrl}/stat/record/ctn/count/group/`,
      reltimeContainerDataStatisticsEchartsUrl: `${this.baseUrl}/stat/record/ctn/group/`,
      realtimeContainerStaticsUrl: `${this.baseUrl}/stat/location/summary/`,
      realtimeContainerStoreRateUrl: `${this.baseUrl}/stat/location/store_rate/`,
      statExportVesselHistoryInfoUrl: `${this.baseUrl}/stat/record/exp/vessel/his/info/`,
      shippingLineHistoryInfoUrl: `${this.baseUrl}/stat/record/exp/shipping/line/his/info/`,
      shipOnSiteContainerStatisticsUrl: `${this.baseUrl}/stat/location/vessel/`,
      vesselEfficiencyStatisticsUrl: `${this.baseUrl}/stat/vessel/efficiency/`,
      rehandingSummartStatisticsUrl: `${this.baseUrl}/stat/rehandling/summary/`,
      driverEfficiencyStatisticsUrl: `${this.baseUrl}/stat/position_mismatch/`,
    };
  }

  get home() {
    return {
      homeSunnaryUrl: `${this.baseUrl}/stat/record/summary/`,
      freqUrl: `${this.baseUrl}/stat/record/freq/`,
    };
  }

  get about() {
    return {
      VersionUrl: `${this.baseUrl}/alg/preference/version/`,
    };
  }

  get canvas() {
    return {
      canvasUrl: `${this.baseUrl}/block_stats`,
      blockByCesselUrl: `${this.baseUrl}/block_stats_by_vessel`,
    };
  }
}
