import { TaxonAutocomplete } from '../services/autocomplete.service';

export interface FormData {
  name?: TaxonAutocomplete;
  info?: string;
  date?: string;
  notes?: string;
  extra?: Object;
}
