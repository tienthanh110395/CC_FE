import { HttpParams, HttpParameterCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PERMISSION_CODE } from '@app/core/app-config';
import { FormGroup, FormArray, FormControl, } from '@angular/forms';
import { AppStorage } from '@app/core/services/AppStorage';
import { COMMOM_CONFIG } from '@env/environment.prod';
import { ResourcePermission } from '@app/core/models/resource-permission.model';

@Injectable({
  providedIn: 'root'
})
export class CommonUtils {

  public static isNullOrEmpty(str: any): boolean {
    return !str || (str + '').trim() === '';
  }
  public static isValidId(id: any): boolean {
    if (CommonUtils.isNullOrEmpty(id)) {
      return false;
    }
    if (id === '0') {
      return false;
    }
    return true;
  }
  public static isRealNumber(num: any): boolean {
    if (CommonUtils.isNullOrEmpty(num)) {
      return false;
    }
    if (num === '0' || num === 0) {
      return false;
    }
    return true;
  }
  public static tctReplaceAll(text: string, code: string, decode: string) {
    let old_text = text;
    do {
      old_text = text;
      text = text.replace(code, decode);
    } while (old_text !== text);
    return text;
  }
  public static trim(text: string) {
    if (text == null) {
      return text;
    }
    return text.trim();
  }
  /**
   * return 1 if num1 > num2
   * return 0 if num2 === num2
   * return -1 if num1 < num2
   */
  public static compareNumber(num1: any, num2: any): number {
    return parseFloat(num1) > parseFloat(num2) ? 1 : (parseFloat(num1) === parseFloat(num2) ? 0 : -1);
  }
  /**
   * getPermissionCode
   * @param code: string
   */
  public static getPermissionCode(code: string): string {
    return PERMISSION_CODE[code] || '';
  }

  /**
   * has Permission
   */
  public static havePermission(operationKey: string, adResourceKey: string): boolean {
    const resourcePermission: ResourcePermission[] = AppStorage.getResourcePermission();
    if (resourcePermission == null) {
      return false;
    }

    const obj: ResourcePermission = resourcePermission.filter(x => x.rsname === adResourceKey)[0];
    const scopes: string[] = obj.scopes;
    if (obj.rsname == adResourceKey && scopes.indexOf(adResourceKey) > -1) {
      return true;
    }

    return false;
  }
  public static getPermissionByResourceCode(resourceCode: string): any {
    if (!resourceCode) {
      return null;
    }
    const resourcePermission: ResourcePermission[] = AppStorage.getResourcePermission();
    if (resourcePermission == null) {
      return null;
    }

    const obj: ResourcePermission = resourcePermission.filter(x => x.rsname === resourceCode)[0];
    return obj;
  }

  /**
   * copyProperties
   * param dest
   * param orgs
   */
  public static copyProperties(dest: any, orig: any): any {
    if (!orig) {
      return dest;
    }

    for (const k in dest) {
      if (orig.hasOwnProperty(k)) {
        dest[k] = orig[k];
      }
    }
    return dest;
  }
  /**
   * Clone all properties from source and save typeof dest
   * Author:huynq
   * @param source :object Source
   */
  public static cloneObject(dest: any, source: any): any {
    if (!source) {
      return dest;
    }
    for (const attribute in source) {
      if (source[attribute] !== undefined) {
        if (source[attribute] === null) {
          dest[attribute] = null;
        } else if (typeof source[attribute] === 'object') {
          dest[attribute] = Object.assign({}, source[attribute]);
        } else {
          dest[attribute] = source[attribute];
        }
      }
    }
    return dest;
  }

  /**
   * copyProperties
   * param dest
   * param orgs
   */
  public static buildParams(obj: any): HttpParams {
    return Object.entries(obj || {})
      .reduce((params, [key, value]) => {
        if (value === null) {
          return params.set(key, String(''));
        } else if (typeof value === typeof {}) {
          return params.set(key, JSON.stringify(value));
        } else {
          return params.set(key, String(value));
        }
      }, new HttpParams({ encoder: new CustomEncoder() }));
  }
  /**
   * validateForm
   * @param form: FormGroup
   */
  public static isValidForm(form: any): boolean {
    setTimeout(() => {
      this.markAsTouched(form);
    }, 200);

    if (form.invalid) {
      setTimeout(() => {
        CommonUtils.scrollToSmoothly('.errorMessageDiv.show');
      }, 200);
    }
    return !form.invalid;
  }

  public static isValidFormAndValidity(form: any): boolean {
    this.markAsTouchedAndValidity(form);
    return !form.invalid;
  }

  public static markAsTouched(form: any) {
    if (form instanceof FormGroup) {
      CommonUtils.isValidFormGroup(form);
    } else if (form instanceof FormArray) {
      CommonUtils.isValidFormArray(form);
    } else if (form instanceof FormControl) {
      form.markAsTouched({ onlySelf: true });
      if (form.invalid) {
        console.warn('Validate error field:', form);
      }
    }
  }
  public static offset(el): any {
    const rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  }
  public static scrollToSmoothly(querySelectorAll, time?) {
    const elements = document.querySelectorAll(querySelectorAll);
    if (!elements) {
      return;
    }
    const first = elements[0];
    if (!first) {
      return;
    }
    const position = CommonUtils.offset(first);
    if (isNaN(position.top)) {
      console.warn('Position must be a number');
      return;
    }
    if (position.top < 0) {
      console.warn('Position can not be negative');
      return;
    }
    let top = position.top - 100;
    const currentPos = window.scrollY || window.screenTop;
    if (currentPos > position.top) {
      top = position.top + 100;
    }
    try {
      window.scrollTo({ left: 0, top: top, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, top);
    }
  }

  /**
   * markAsTouchedAndValidity
   */
  public static markAsTouchedAndValidity(form: any) {
    if (form instanceof FormGroup) {
      CommonUtils.isValidFormGroupAndValidity(form);
    } else if (form instanceof FormArray) {
      CommonUtils.isValidFormArrayAndValidity(form);
    } else if (form instanceof FormControl) {
      form.updateValueAndValidity(); // tạm bổ sung ngày 28/03/2019, trường hợp validate nhập 1 thì bắt buộc nhập các trường còn lại
      form.markAsTouched({ onlySelf: true });
      if (form.invalid) {
        console.warn('Validate error field:', form);
      }
    }
  }
  public static isValidFormArrayAndValidity(form: FormArray) {
    if (form['isHidden'] === true) {// neu form đang bị ẩn thì không cần validate
      return;
    }
    for (const i in form.controls) {
      CommonUtils.markAsTouchedAndValidity(form.controls[i]); // neu form đang bị ẩn thì không cần validate
    }
  }

  public static isValidFormArray(form: FormArray) {
    if (form['isHidden'] === true) {// neu form đang bị ẩn thì không cần validate
      return;
    }
    for (const i in form.controls) {
      CommonUtils.markAsTouched(form.controls[i]); // neu form đang bị ẩn thì không cần validate
    }
  }
  public static isValidFormGroup(form: FormGroup) {
    if (form['isHidden'] === true) {
      return;
    }
    Object.keys(form.controls).forEach(key => {
      CommonUtils.markAsTouched(form.get(key));
    });
  }
  public static isValidFormGroupAndValidity(form: FormGroup) {
    if (form['isHidden'] === true) {
      return;
    }
    Object.keys(form.controls).forEach(key => {
      CommonUtils.markAsTouchedAndValidity(form.get(key));
    });
  }
  /**
   * Hàm lấy DateFormat hiện tại theo MarketCompany. Ko có trả về mặc định
   */
  public static getDateFormat(): string {
    return COMMOM_CONFIG.DATE_FORMAT;
    // const nationProperty = AppStorage.getSelectedMarket();
    // if (nationProperty === null || nationProperty === undefined || !nationProperty.dateFormat) {
    //   return ConfigDefault.dateFormat;
    // }
    // return nationProperty.dateFormat;
  }

  /**
   * hàm xử lý lấy nationId hiện tại theo quốc gia
   */
  public static toTreeNode(res: any): any {
    for (const node of res) {
      if (!node.leaf) {
        delete node.icon;
        if (node.children && node.children.length > 0) {
          node.children = CommonUtils.toTreeNode(node.children);
        }
      }
    }
    return res;
  }
  /**
   * nvl
   * param value
   * param defaultValue
   */
  public static nvl(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  }
  /**
   * convert To FormData mutilpart request post
   */
  public static convertFormFile(dataPost: any): FormData {
    const filteredData = CommonUtils.convertData(dataPost);
    const formData = CommonUtils.objectToFormData(filteredData, '', []);
    return formData;
  }
  /**
   * objectToFormData
   */
  public static objectToFormData(obj, rootName, ignoreList): FormData {
    const formData = new FormData();
    function appendFormData(data, root) {
      if (!ignore(root)) {
        root = root || '';
        if (data instanceof File) {
          if (data.type !== 'vhr_stored_file') {
            formData.append(root, data);
          }
        } else if (Array.isArray(data)) {
          let index = 0;
          for (let i = 0; i < data.length; i++) {
            if (data[i] instanceof File) {
              if (data[i].type !== 'vhr_stored_file') {
                appendFormData(data[i], root + '[' + index + ']');
                index++;
              }
            } else {
              appendFormData(data[i], root + '[' + i + ']');
            }
          }
        } else if (data && typeof data === 'object') {
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              if (root === '') {
                appendFormData(data[key], key);
              } else {
                appendFormData(data[key], root + '.' + key);
              }
            }
          }
        } else {
          if (data !== null && typeof data !== 'undefined') {
            formData.append(root, data);
          }
        }
      }
    }

    function ignore(root) {
      return Array.isArray(ignoreList) && ignoreList.some(function (x) { return x === root; });
    }

    appendFormData(obj, rootName);
    return formData;
  }
  /**
   * convertData
   */
  public static convertData(data: any): any {
    if (typeof data === typeof {}) {
      return CommonUtils.convertDataObject(data);
    } else if (typeof data === typeof []) {
      return CommonUtils.convertDataArray(data);
    } else if (typeof data === typeof true) {
      return CommonUtils.convertBoolean(data);
    }
    return data;
  }
  /**
   * convertDataObject
   * param data
   */
  public static convertDataObject(data: Object): Object {
    if (data) {
      for (const key in data) {
        if (data[key] instanceof File) {

        } else {
          data[key] = CommonUtils.convertData(data[key]);
        }
      }
    }
    return data;
  }
  public static convertDataArray(data: Array<any>): Array<any> {
    if (data && data.length > 0) {
      for (const i in data) {
        data[i] = CommonUtils.convertData(data[i]);
      }
    }
    return data;
  }
  public static convertBoolean(value: Boolean): number {
    return value ? 1 : 0;
  }
  /**
   * tctGetFileSize
   * param files
   */
  public static tctGetFileSize(files) {
    try {
      let fileSize;
      // if (typeof files === typeof []) {
      //   fileSize = files[0].size;
      // } else {
      fileSize = files.size;
      // }
      fileSize /= (1024 * 1024); // chuyen ve MB
      return fileSize;
    } catch (ex) {
      console.error(ex.message);
    }
  }
  /**
   * createForm controls
   */
  public static createForm(formData: any, options: any, validate?: any): FormGroup {
    const formGroup = new FormGroup({});
    for (const property in options) {
      if (formData.hasOwnProperty(property)) {
        options[property][0] = formData[property];
      }
      formGroup.addControl(property, new FormControl(options[property][0], options[property][1]));
    }
    if (validate) {
      formGroup.setValidators(validate);
    }
    return formGroup;
  }


  /**
   * pureDataToTreeNode: for workFlows - Menu
   * @param dataSource: array Menu in VPS
   * @param pureData: array Workflows in VHCM_System
   */
  public static pureDataToTreeNode(dataSource: any, pureData: any): any {
    const dataDest = [];
    for (const item of pureData) {
      const tmp = dataSource.find(x => x.nodeId === item.nodeId);
      if (tmp) {
        tmp.isMainAction = item.isMainAction ? item.isMainAction : null;
        tmp.workFlowId = item.workFlowId ? item.workFlowId : null;
        tmp.wfMenuMappingId = item.wfMenuMappingId ? item.wfMenuMappingId : null;
        tmp.referenceNum = dataSource.filter(x => x.parentId === tmp.nodeId).length;
        dataDest.push(tmp);
      }
    }
    return CommonUtils.sort(dataDest, 'sortOrder');
  }
  /**
   * sort
   * @param dataSource: array
   * @param fieldSort: field choosed to sort
   * @param ascending: ascending: 1; descending: -1; default: 1.
   */
  public static sort(dataSource: any, fieldSort: any, ascending?: number) {
    if (!ascending) {
      ascending = 1;
    }
    return dataSource.sort((left, right): number => {
      if (left[fieldSort] < right[fieldSort]) {
        return -ascending;
      }
      if (left.sortOrder > right.sortOrder) {
        return ascending;
      }
      return 0;
    });
  }
  public static convertVpsMenus(data: any, keyId?: string): any {
    keyId = keyId || 'nodeId';
    const dataMap = data.reduce((m, d) => {
      m[d[keyId]] = Object.assign({}, d);
      return m;
    }, {});

    const listTemp = data.filter(d => {
      if (d.parentId !== null) { // assign child to its parent
        const parentNode = dataMap[d.parentId];
        if (!parentNode) {
          return true;
        }
        if (parentNode['items'] === undefined || parentNode['items'] === null) {
          parentNode['items'] = [];
        }
        parentNode.items.push(dataMap[d[keyId]]);
        return false;
      }
      return true; // root node, do nothing
    }).map(d => dataMap[d[keyId]]);
    return listTemp;
  }
  // Check giao quá trình giữa 2 khoảng ngày
  public static tctCompareDates(date1, date2): number {
    const diff = date1 - date2;
    return (diff < 0) ? -1 : (diff === 0) ? 0 : 1;
  }
  public static betweenDate(check, startDate, endDate): boolean {
    return (CommonUtils.tctCompareDates(startDate, check) <= 0) && (CommonUtils.tctCompareDates(check, endDate) <= 0);
  }
  /**
   * check date conflict time
   * @param Date startDate1
   * @param Date endDate1
   * @param Date startDate2
   * @param Date endDate2
   * @return true or false
   */
  public static isConflictDate(startDate1, endDate1, startDate2, endDate2) {
    if (CommonUtils.isNullOrEmpty(endDate2)) {
      return (CommonUtils.isNullOrEmpty(endDate1) || (CommonUtils.tctCompareDates(startDate2, endDate1) <= 0));
    } else {
      return (CommonUtils.isNullOrEmpty(endDate1) && (CommonUtils.tctCompareDates(startDate1, endDate2) < 0))
        || (!CommonUtils.isNullOrEmpty(endDate1)
          && (CommonUtils.betweenDate(startDate1, startDate2, endDate2)
            || CommonUtils.betweenDate(endDate1, startDate2, endDate2)
            || CommonUtils.betweenDate(startDate2, startDate1, endDate1)
            || CommonUtils.betweenDate(endDate2, startDate1, endDate1))
        );
    }
  }
  public static logoutAction() {
    AppStorage.clear();
    // const URL = UrlConfig.ssoAddress + '/logout?service=';
    // const serviceUrl = UrlConfig.clientAddress;
    // window.location.href = URL + this.toUrlString(serviceUrl);
  }
  private static toUrlString(src: any) {
    let dest = src;
    while (dest.indexOf(':') >= 0) {
      dest = dest.replace(':', '%3A');
    }
    while (dest.indexOf('/') >= 0) {
      dest = dest.replace('/', '%2F');
    }
    return dest;
  }
  public static joinStringFromArray(listObject: any, fieldName: any, separator?: any) {
    if (!separator) {
      separator = ',';
    }
    const arrTemp = [];
    listObject.forEach((o) => { arrTemp.push(o[fieldName]); });
    return arrTemp.join(separator);
  }

  public static getListYear(fromYear?: number, toYear?: number) {
    const listYear = [];
    if (fromYear && toYear) {
      for (let i = fromYear; i <= toYear; i++) {
        const obj = {
          year: i
        };
        listYear.push(obj);
      }
    }
    return listYear;
  }
}

class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

