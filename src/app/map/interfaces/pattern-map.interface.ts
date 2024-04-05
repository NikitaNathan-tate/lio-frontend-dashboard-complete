import { PatternView } from 'src/app/features/general-template/model/model';
import { ILinkMap } from './link-map.interface';

export interface IPatternMap extends PatternView {
  links?: ILinkMap[];
}
