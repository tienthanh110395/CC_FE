import { ResourcePermission } from '../models';
import { Injectable } from '@angular/core';
import { CryptoService } from '@app/shared/services/crypto.service';
import { AccessToken } from '../models/access-token.model';

@Injectable({
  providedIn: 'root'
})
class StorageData {
  resourcePermission: ResourcePermission[];
  navState: boolean;
  navFlipState: boolean;
  searchState: any;
  listLang: any;
  listMarket: any;
  currentUrl: any;
  intro: any;
}
export class AppStorage {
  public static data: StorageData;
  private static expriteIn = '_expriteIn';
  private static instanceName = '_AppStorage';

  private static storage = localStorage;

  /**
   * init
   */
  public static init(): void {

  }
  /**
   * isExprited
   */
  public static isExprited(): boolean {
    return false;
  }
  /**
   * clear
   */
  public static clear(): void {
    this.storage.removeItem(this.instanceName);
  }
  /**
   * storedData
   */
  public static storedData(): StorageData {
    const storedData = this.storage.getItem(this.instanceName);
    if (this.isNullOrEmpty(storedData)) {
      return null;
    }
    return CryptoService.decr(storedData);
  }

  public static isNullOrEmpty(str: any): boolean {
    return !str || (str + '').trim() === '';
  }

  /**
   * get
   */
  public static get(key: string): any {
    if (this.isExprited()) {
      return null;
    }
    const storedData = this.storedData();
    if (storedData == null) {
      return null;
    }
    return storedData[key];
  }
  /**
   * get
   */
  public static set(key: string, val: any): any {
    let storedData = this.storedData();
    if (storedData == null) {
      storedData = new StorageData();
    }
    storedData[key] = val;

    this.storage.setItem(this.instanceName, CryptoService.encr(storedData));
  }

  /**
   * getAccessToken
   */
  public static getAccessToken(): AccessToken {
    return this.get('accessToken');
  }
  /**
   * setAccessToken
   */
  public static setAccessToken(accessToken) {
    return this.set('accessToken', accessToken);
  }

  /**
   * getUserLogin
   */
  public static getUserLogin(): string {
    return this.get('userLogin');
  }
  /**
   * setUserLogin
   */
  public static setUserLogin(userLogin) {
    return this.set('userLogin', userLogin);
  }


  /**
   * getResourcePermission
   */
  public static getResourcePermission(): ResourcePermission[] {
    return this.get('resourcePermission');
  }
  /**
   * setResourcePermission
   */
  public static setResourcePermission(resourcePermission) {
    return this.set('resourcePermission', resourcePermission);
  }

  /**
   * getCurrentUrl
   */
  public static getCurrentUrl(): any {
    return this.get('currentUrl');
  }
  /**
   * setCurrentUrl
   */
  public static setCurrentUrl(currentUrl: any): void {
    this.set('currentUrl', currentUrl);
  }

  /**
   * getLanguage
   */
  public static getLanguage(): any {
    return this.get('language');
  }
  /**
   * setLanguage
   */
  public static setLanguage(language: any): void {
    this.set('language', language);
  }

  public static setEnviroment(env) {
    return this.set('env', env);
  }

  public static getEnviroment(): any {
    return this.get('env');
  }

  public static setPartnerCode(partner_code) {
    return this.set('partner_code', partner_code);
  }

  public static getPartnerCode(): any {
    return this.get('partner_code');
  }

  public static setLoginByToken(login_by_token) {
    return this.set('login_by_token', login_by_token);
  }

  public static getLoginByToken(): any {
    return this.get('login_by_token');
  }
}
