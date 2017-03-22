
import { Taxa } from './Taxa';
import { TaxaDescription } from './TaxaDescription';
import { TaxaMedia } from './TaxaMedia';

export interface Taxon {

  info: Taxa;

  descriptions: TaxaDescription[];

  media: TaxaMedia[];

}
