import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';
import { partition } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  public static cannotWhiteSpace(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value == '' || typeof control.value === 'object') return null;
    if ((control.value || '').toString().trim().length === 0) {
      return { cannotWhiteSpace: true };
    }
    return null;
  }
  public static checkAge(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value == '') return null;
    var today = new Date();
    var age = today.getFullYear() - control.value.getFullYear();
    var m = today.getMonth() - control.value.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < control.value.getDate())) {
      age--;
    }
    if (age >= 0 && age < 18) {
      return { checkAge: true };
    }
    return null;
  }
  public static checkObject(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) return null;
    if (typeof control.value !== 'object') {
      return { checkObject: true };
    }
    return null;
  }
  public static cannot3decimal(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value == '') return null;
    let num = Math.abs(control.value) - Math.floor(control.value);
    if (Math.round(num * 1000) % 10 != 0)
      return { cannot3decimal: true };
    return null;
  }

  public static cannotsubflix(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value == '') return null;
    if (control.value.toString().search('-') != -1)
      return { cannotsubflix: true };
    return null;
  }

  public static cannotSpace(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value == '') return null;
    if (control.value.toString().search(' ') != -1)
      return { cannotSpace: true };
    return null;
  }

  public static maxLength(length: number): ValidatorFn {
    return (c: AbstractControl): any | null => {
      if (c.value) {
        if ((c.value + '').replace(/\n/g, '\r\n').length > length) {
          return { 'maxlength': { 'requiredLength': length } };
        }
      }
      return null;
    };
  }

  public static passwordValidator(control: AbstractControl): any {
    if (!control.value) { return; }

    // {6,100}           - Assert password is between 6 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    // (?!.*\s)          - Spaces are not allowed
    return (control.value.match(/^(?=.*\d)(?=.*[a-zA-Z!@#$%^&*])(?!.*\s).{6,100}$/)) ? '' : { invalidPassword: true };
  }

  /**
   * validate onlyLetterNumber
   */
  public static onlyLetterNumber(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.match(/^[0-9a-zA-Z]+$/)) ? '' : { onlyLetterNumber: true };
  }

  /**
   * validate onlyLetterNumberSp
   */
  public static onlyLetterNumberSp(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.match(/^[0-9a-zA-Z\ ]+$/)) ? '' : { onlyLetterNumber: true };
  }

  /**
   * validate database tableColumnName
   */
  public static dbTableColumnName(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.match(/^[0-9a-zA-Z_]+$/)) ? '' : { dbTableColumnName: true };
  }

  /**
   * validate personalIdNumber
   */
  public static personalIdNumber(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.match(/^[0-9a-zA-Z]{8,15}$/)) ? '' : { personalIdNumber: true };
  }

  /**
   * validate phone
   */
  public static phone(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.match(/^([\+])?(\d([.\s])?){1,15}$/)) ? '' : { phone: true };
  }

  /**
   * validate mobileNumber
   */
  public static mobileNumber(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.match(/^([+][0-9]{1,3}([ .-])?)?([(][0-9]{1,6}[)])?([0-9 .-]{1,32})(([A-Za-z :]{1,11})?[0-9]{1,4}?)$/))
      ? '' : { mobileNumber: true };
  }

  /**
   * validate integer
   */
  public static integer(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.toString().trim().match(/^[\-\+]?\d+$/)) ? '' : { integer: true };
  }

  /**
   * validate positiveInteger
   */
  public static positiveInteger(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.toString().trim().match(/^\d+$/)) ? '' : { positiveInteger: true };
  }

  /**
   * validate number
   */
  public static number(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.toString().trim().match(/^[\-\+]?(([0-9]+)([\.]([0-9]+))?|([\.]([0-9]+))?)$/))
      ? '' : { number: true };
  }

  /**
   * validate positiveNumber
   */
  public static positiveNumber(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.toString().trim().match(/^(([0-9]+)([\.]([0-9]+))?|([\.]([0-9]+))?)$/))
      ? '' : { positiveNumber: true };
  }

  /**
 * validate beforeCurrentDate
 */
  public static beforeCurrentDate(control: AbstractControl): any {
    if (!control.value) { return; }
    const x = new Date().getTime();
    return (control.value < x)
      ? '' : { beforeCurrentDate: true };
  }
  public static afterCurrentDate(control: AbstractControl): any {
    if (!control.value) { return; }
    const x = new Date().getTime();
    return (control.value >= x || x - control.value < 99999999)
      ? '' : { afterCurrentDate: true };
  }

  /**
   * Validate IP
   * @param control : any
   */
  public static isIp(control: AbstractControl): any {
    if (!control.value) { return; }
    const str: string = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.'
      + '){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    const regExp = new RegExp(str);
    if (!regExp.test(control.value)) {
      return { isIp: true };
    }
    return '';
  }
  /**
 * Validate URL
 * @param control : any
 */
  public static isUrl(control: AbstractControl): any {
    if (!control.value) { return; }
    const str = '(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|' +
      'www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|' +
      'https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})';
    const regExp = new RegExp(str);
    if (!regExp.test(control.value)) {
      return { isUrl: true };
    }
    return '';
  }

  /** Validate email format */
  public static emailFormat(control: AbstractControl): any {
    if (!control.value) { return; }
    // tslint:disable-next-line: max-line-length
    return (control.value.toString().trim().match(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i))
      ? '' : { invalidEmail: true };
  }

  /**
   * Validate date not affter date
   * @param targetKey: any
   * @param toMatchKey: any
   */
  public static notAffter(targetKey: string, toMatchKey: string, labelMatchCode: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];
      const toMatch = group.controls[toMatchKey];
      if (target.hasError('dateNotAffter')) {
        target.setErrors(null);
        target.markAsUntouched();
      }

      if (target.value && toMatch.value) {
        const isCheck = target.value <= toMatch.value;
        // set equal value error on dirty controls
        if (!isCheck && target.valid && toMatch.valid) {
          target.setErrors({ dateNotAffter: { dateNotAffter: labelMatchCode } });
          target.markAsTouched();
        }
      }
      return null;
    };
  }

  /**
  * Validate date not before date
  * @param targetKey: any
  * @param toMatchKey: any
  */
  public static notBefore(targetKey: string, toMatchKey: string, labelMatchCode: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];
      const toMatch = group.controls[toMatchKey];
      if (target.hasError('dateNotBefore')) {
        target.setErrors(null);
        target.markAsUntouched();
      }

      if (target.value && toMatch.value) {
        const isCheck = target.value >= toMatch.value;
        // set equal value error on dirty controls
        if (!isCheck && target.valid && toMatch.valid) {
          target.setErrors({ dateNotBefore: { dateNotBefore: labelMatchCode } });
          target.markAsTouched();
        }
      }
      return null;
    };
  }
  /**
   * Validate date not affter number
   * @param targetKey: any
   * @param toMatchKey: any
   */
  public static notAffterNumber(targetKey: string, toMatchKey: string, labelMatchCode: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];
      const toMatch = group.controls[toMatchKey];
      // neu mot trong hai truong null thi chuyen sang require
      if (!target || !toMatch) {
        return null;
      }
      // dieu kien kiem tra
      if (target.hasError('dateNotAffter')) {
        target.setErrors(null);
        target.markAsUntouched();
      }
      const targetValue = parseFloat(target.value);
      const toMatchValue = parseFloat(toMatch.value);
      if (targetValue && toMatchValue) {
        const isCheck = targetValue <= toMatchValue;
        // set equal value error on dirty controls
        if (!isCheck && target.valid && toMatch.valid) {
          target.setErrors({ dateNotAffter: { dateNotAffter: labelMatchCode } });
          target.markAsTouched();
        }
      }
      return null;
    };
  }

  /**
   * Validate date in range 6 Month
   * @param targetKey: any
   * @param toMatchKey: any
   */
  public static isRangeOf6Month(targetKey: string, toMatchKey: string, labelMatchCode: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];
      const toMatch = group.controls[toMatchKey];
      // kiem tra null
      if (target.hasError('isRangeOf6Month')) {
        target.setErrors(null);
        target.markAsUntouched();
      }

      let temp = new Date(target.value);
      temp.setMonth(temp.getMonth() + 6);


      // kiem tra  gia tri
      if (target.value && toMatch.value) {
        const isCheck = temp >= new Date(toMatch.value);
        // set equal value error on dirty controls
        if (!isCheck) {
          target.setErrors({ isRangeOf6Month: { dateNotAffter: labelMatchCode } });
          target.markAsTouched();
        }
      }
      return null;
    };
  }

  /**
   * Validate date not before a specify date
   * @param targetKey: any
   * @param specifyDate: any
   */
  public static beforeSpecifyDate(targetKey: string, specifyDate: string, labelMatchCode: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];

      // Neu mot trong hai truong null
      if (!target || !specifyDate) {
        return null;
      }

      // Dieu kien kiem tra
      if (target.hasError('dateNotBefore')) {
        target.setErrors(null);
        target.markAsUntouched();
      }
      const targetValue = parseFloat(target.value);
      const toMatchValue = parseFloat(specifyDate);
      if (targetValue || targetValue === 0 && toMatchValue) {
        const isCheck = targetValue >= toMatchValue;
        // Set equal value error on dirty controls
        if (!isCheck && target.valid) {
          target.setErrors({ dateNotBefore: { dateNotBefore: labelMatchCode } });
          target.markAsTouched();
        }
      }
      return null;
    };
  }

  /**
   * Validate date not after a specify date
   * @param targetKey: any
   * @param specifyDate: any
   */
  public static afterSpecifyDate(targetKey: string, specifyDate: string, labelMatchCode: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];

      // Neu mot trong hai truong null
      if (!target || !specifyDate) {
        return null;
      }

      // Dieu kien kiem tra
      if (target.hasError('dateNotAffter')) {
        target.setErrors(null);
        target.markAsUntouched();
      }
      const targetValue = parseFloat(target.value);
      const toMatchValue = parseFloat(specifyDate);
      if (targetValue || targetValue === 0 && toMatchValue) {
        const isCheck = targetValue <= toMatchValue;
        // Set equal value error on dirty controls
        if (!isCheck && target.valid) {
          target.setErrors({ dateNotAffter: { dateNotAffter: labelMatchCode } });
          target.markAsTouched();
        }
      }
      return null;
    };
  }

  /**
   * Validate date not before number
   * @param targetKey: any
   * @param toMatchKey: any
   */
  public static notBeforeNumber(targetKey: string, toMatchKey: string, labelMatchCode: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];
      const toMatch = group.controls[toMatchKey];
      // neu mot trong hai truong null thi chuyen sang require
      if (!target || !toMatch) {
        return null;
      }
      // dieu kien kiem tra
      if (target.hasError('dateNotBefore')) {
        target.setErrors(null);
        target.markAsUntouched();
      }
      const targetValue = parseFloat(target.value);
      const toMatchValue = parseFloat(toMatch.value);
      if (targetValue || targetValue === 0 && toMatchValue) {
        const isCheck = targetValue >= toMatchValue;
        // set equal value error on dirty controls
        if (!isCheck && target.valid && toMatch.valid) {
          target.setErrors({ dateNotBefore: { dateNotBefore: labelMatchCode } });
          target.markAsTouched();
        }
      }
      return null;
    };
  }
  /**
     * Validate 'Đơn vị, Chức danh công việc không được phép trùng'
     * @param targetKey: any
     * @param toMatchKey: any
     */
  public static duplicateArray(controlKeys: Array<string>, target: string, messageKey?: string): ValidatorFn {
    return (array: FormArray) => {
      // target.setErrors({duplicateArray: {duplicateName: messageKey}});
      // target.markAsTouched();
      const map: object = {};
      for (const group of array.controls) {
        const controlTaget = group.get(target) as FormControl;
        let count = 0;
        const values = [];
        for (const key of controlKeys) {
          const control = group.get(key) as FormControl;
          if (control.value !== null && control.value !== '') {
            values.push(control.value);
            count++;
          }
        }
        let k = '/' + values.join('/') + '/';
        k = k.toLowerCase();
        if (controlKeys.length === count) {
          if (map.hasOwnProperty(k)) {
            controlTaget.setErrors({ duplicateArray: { duplicateArray: messageKey } });
            controlTaget.markAsTouched();
          } else {
            map[k] = true;
            // fix bug khi xoa row dau khi bi duplicate
            if (controlTaget.hasError('duplicateArray')) {
              controlTaget.setErrors(null);
              controlTaget.markAsUntouched();
            }
          }
        }
      }
      return null;
    };
  }



  /**
   * Xu ly bat buoc nhap truong hien tai khi truong truyen vao co gia tri
   * @param controlKeys Ten truong nhap gia tri
   */
  public static isRequiredIfHaveOne(controlKeys: string): ValidatorFn {
    return (c: AbstractControl): any | null => {
      const group = c.parent as FormGroup;
      const controlHaveOne = group.get(controlKeys) as FormControl;
      if (c.value === null || c.value === '') {
        if (controlHaveOne && (controlHaveOne.value === null || controlHaveOne.value.toString().length === 0)) { //  vi co th value = []
          return null;
        } else {
          return { ifHaveOneIsRequired: true };
        }
      } else {
        return null;
      }
    };
  }





  public static positiveRealNumber(control: AbstractControl): any {
    if (!control.value) { return; }
    return (control.value.toString().trim().match(/^(([0-9]+)([\.]([5]{1}))?)$/))
      ? '' : { positiveRealNumber: true };
  }

  public static isRequiredIfHaveOneValue(controlKeys: string): ValidatorFn {
    return (c: AbstractControl): any | null => {
      const group = c.parent as FormGroup;
      const controlHaveOne = group.get(controlKeys) as FormControl;
      if (c.value === null || c.value == "" || c.value.toString().length === 0) {
        if (controlHaveOne && (controlHaveOne.value === null || controlHaveOne.value === 0)) { //  vi co th value = []
          return null;
        } else {
          return { ifHaveOneIsRequired: true };
        }
      } else {
        return null;
      }
    };
  }

  public static isRequiredReason(sabbaticalLeaveId: string, addDay: string, subDay: string): ValidatorFn {
    return (c: AbstractControl): any | null => {
      const group = c.parent as FormGroup;
      const controlSabbaticalLeaveId = group.get(sabbaticalLeaveId) as FormControl;
      const controlAddAnuualDayLeave = group.get(addDay) as FormControl;
      const controlSubAnuualDayLeave = group.get(subDay) as FormControl;
      if (controlSabbaticalLeaveId.value) {
        if (c.value === null || c.value === "") {
          return null;
        } else {
          return { ifHaveOneIsRequired: true };
        }
      } else {
        if (controlSabbaticalLeaveId.value == null) {
          if (controlAddAnuualDayLeave.value != null || controlSubAnuualDayLeave.value != null) {
            if (c.value === null || c.value === "") {
              return null;
            }
          } else {
            return { ifHaveOneIsRequired: true };
          }
        }
      }
    };
  }

  public static isHaveSabbaticalLeaveId(controlKeys: string): ValidatorFn {
    return (c: AbstractControl): any | null => {
      const group = c.parent as FormGroup;
      const controlHaveOne = group.get(controlKeys) as FormControl;
      if (controlHaveOne.value) {
        if (c.value === null || c.value === "") {
          return { ifHaveOneIsRequired: true };
        }
      } else {
        return null;
      }
    };
  }
}
