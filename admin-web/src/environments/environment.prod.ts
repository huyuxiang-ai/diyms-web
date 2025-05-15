// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const ip = '127.0.0.1:4201';
const port = '80';

export const localUrl = `http://127.0.0.1:4000`;

export const environment = {
  company: 'ssict',
  inAim: {
    E: { name: '出口', color: 'green' },
    I: { name: '进口', color: 'red' },
    T: { name: '中转', color: 'blue' },
    M: { name: '堆存', color: 'purple' },
    F: { name: '翻倒', color: 'gray' },
    S: { name: '过境', color: 'gray' },
  } as {
    [key: string]: { name: string; color: string };
  },
  // homeConfig: {
  //   enableBy: 'voyage'
  // },
  searchModes: {
    vessel: {
      label: '船名',
      show: true,
    },
    shippingLine: {
      label: '航线',
      show: true,
    },
    vesselAndPod: {
      label: '港口',
      show: false,
    },
    ctnOwner: {
      label: '箱主',
      show: false,
    },
    all: {
      label: '全部',
      show: true,
    },
  },
  onControl: {
    shippingLineCode: true,
    vesselName: true,
    voyage: true,
    pod: false,
    ctnOwner: false,
    vesselCompany: false,
    blockCode: true,
    inAim: true,
    EFStatus: false,
  },
  onIcon: {
    detailInfoIcon: true,
    copyIcon: true,
    addPartBlockIcon: true,
    editIcon: true,
  },
  production: false,
  managerBaseUrl: 'http://127.0.0.1:4000',
  companyLogoUrl: '/assets/images/logo_small.png',
  webTitle: '上海海事大学<br>智能堆场管理系统',
  // managerBaseUrl: ' http://192.168.199.135:4000',
  coreBaseUrl: 'http://127.0.0.1:5000',
};
