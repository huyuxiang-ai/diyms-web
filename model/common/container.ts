export interface Container {
  ctnno: string;
  ctnTradeType: string;
  shippingLineOut: string;
  vesselNameOut: string;
  voyageOut: string;
  voyageOutId: string;

  shippingLineIn: string;
  vesselNameIn: string;
  voyageIn: string;
  voyageInId: string;
  inTime: number;
  inAim: string;
  billNo: string;
  ctnOwner: string;
  pod: string;
  portDes: string;
  taskType: string;
  billQty: number;
  ctnSize: string;
  ctnType: string;
  ctnHeight: string;
  ctnStatus: string;
  ctnWeight: number;

  isRef: number;
  isOver: number;
  isDanger: number;

  pairContainer?: string;
  pairPosition?: string;
  specifiedPositions?: string;

  isItt?: number;
  isEmergency?: number;
  lockStationNo?: string;
  truckType?: string;
  isPlan: number;
  groupRange?: [any];

  ctnGroup: string | null;
  group: string;

  doorDirection?: string;
  groupCode?: string;
  restowFlag?: string;
  dischVesCell?: string;
  dischFetchQc?: string;
}
