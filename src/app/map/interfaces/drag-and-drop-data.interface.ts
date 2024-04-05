import { DragAndDropDataType } from "../enums/drag-and-drop-data-type.enum";

export interface IDragAndDropData {
  duid: string;
  type: DragAndDropDataType;
}
