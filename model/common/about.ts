import { NzCustomColumn } from "ng-zorro-antd/table";

export interface version{
code: string;
description: string;
name:string;
version:string
}

export interface CustomColumn extends NzCustomColumn {
  name: string;
  required?: boolean;
  position?: 'left' | 'right';
  parent?: string;
}