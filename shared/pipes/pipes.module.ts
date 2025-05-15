import { NgModule } from '@angular/core';
import { InAimPipe } from './in-aim.pipe';
import { MapPipe } from './map.pipe';
import { NumberLoopPipe } from './number-loop.pipe';
import { StatusPipe } from './status.pipe';
import { TableFiledPipe } from './table-filed.pipe';
import { TaskTypePipe } from './task-type.pipe';
import { YardposFormatPipe } from './yardpos-format.pipe';
import { YardposPipe } from './yardpos.pipe';
import { TaskTypeNewPipe } from './task-type-new.pipe';

const PIPES = [NumberLoopPipe, MapPipe, TaskTypePipe, TaskTypeNewPipe, TableFiledPipe, YardposFormatPipe, YardposPipe, StatusPipe, InAimPipe];

@NgModule({
  declarations: [],
  imports: [...PIPES],
  exports: [...PIPES]
})
export class PipesModule {}
