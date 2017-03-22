import { Injectable } from '@angular/core';

@Injectable()
export class InfoParserService {

  static _default = 'generic';
  static _regex = {
    'generic': {
      'regExp': new RegExp(
        '^' +
        '(e)?\\s?' + // surety e = unsure
        '(([0-9]+(\'|"|k|n|\\b){1}\\s?)+)*' + // count
        '([äÄ])?\\s?' + // sound
        '(.*?)\\s*' + // notes
        '$'
      ),
      'parts': {
        'sure': {'next': 1, 'pick': InfoParserService.toFalse},
        'count': {'next': 3},
        'sound': {'next': 1},
        'notes': {'next': 1, 'pick': InfoParserService.trim, 'rest': true}
      }
    },
    'MVL.1': {
      'regExp': new RegExp(
        '^' +
        '(e)?\\s?' + // surety e = unsure
        '(b)?\\s?' + // twitched
        '(([0-9]+(\'|"|k|n|/|n-puk|jp|tp|\\.?vp|pep|eijp|ss|pull|juv|ad|subad|imm|\\b){1}\\s?)+)*' + // count
        '([äÄ])?\\s?' + // sound
        '([NESW]{1,3})?\\s?' + // direction
        '([\-]{1,4}|[+]{1,4})?\\s?' + // distance
        '(I|II|III|IV)?\\s?' + // height
        '(.*?)\\s*' + // notes
        '$'
      ),
      'parts': {
        'sure': {'next': 1, 'pick': InfoParserService.toFalse},
        'twitched': {'next': 1, 'pick': InfoParserService.toTrue},
        'count': {'next': 3},
        'sound': {'next': 1},
        'direction': {'next': 1},
        'distance': {'next': 1},
        'height': {'next': 1},
        'notes': {'next': 1, 'pick': InfoParserService.trim, 'rest': true}
      }
    }
  };

  static parse(value, group = 'MVL.1') {
    if (!value) {
      return {};
    }
    const inst = this._regex[group] || this._regex[this._default];
    let valueParts = value.split('\n');
    let parts: string[] = inst['regExp'].exec(valueParts[0]);
    if (!parts || parts.length <= 1) {
      return {};
    }
    valueParts = valueParts.splice(1);
    parts = parts.splice(1);
    const result = {};
    Object.keys(inst['parts']).map(key => {
      result[key] = inst['parts'][key]['pick'] ? inst['parts'][key]['pick'](parts[0], result) : parts[0];
      if (inst['parts'][key]['rest'] && valueParts.length > 0) {
        result[key] += '\n' + valueParts.join('\n');
      }
      parts = parts.splice(inst['parts'][key]['next']);
    });
    return result;
  }

  static toTrue(value) {
    return !!value;
  }

  static toFalse(value) {
    return !value;
  }

  static trim(value)  {
    if (typeof value !== 'string') {
      return value;
    }
    return value.trim();
  }

}
