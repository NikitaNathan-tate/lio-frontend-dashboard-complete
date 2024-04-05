import { LinkView } from "src/app/features/general-template/model/model";
import { ISegment } from "./segment.interface";

export interface ILinkMap extends LinkView {
  segments: ISegment[];
}
