import { CommonUtils } from '@app/shared/services/common-utils.service';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HelperService } from '@app/shared/services/helper.service';
import { WebSocketAPI } from './websocket-api.service';

@Injectable()
export class BasicService {
  public serviceUrl: string;
  public module: string;
  public systemCode: string;
  credentials: any = {};

  /**
   * init service from system code and module
   * config value of app-config.ts
   * param systemCode
   * param module
   */
  constructor(
    @Inject(String) systemCode: string,
    @Inject(String) module: string,
    public httpClient: HttpClient,
    public helperService: HelperService,
    private webSocketAPI?: WebSocketAPI
  ) {
    this.systemCode = systemCode;
    this.module = module;
    const API_URL = this.systemCode;
    const API_PATH = this.module;
    if (!API_URL) {
      console.error(
        `Missing config system service config in src/environments/environment.ts => system: ${this.systemCode}`
      );
      return;
    }
    // if (!API_PATH) {
    //   console.error(
    //     `Missing config system service config in src/environments/environment.ts => module: ${this.module}`
    //   );
    //   return;
    // }
    this.serviceUrl = API_URL + API_PATH;
  }
  /**
   * set SystemCode
   * param systemCode
   */
  public setSystemCode(systemCode: string) {
    this.systemCode = systemCode;
    const API_URL = this.systemCode;
    const API_PATH = this.module;
    if (!API_URL) {
      console.error(
        `Missing config system service config in src/environments/environment.ts => system: ${this.systemCode}`
      );
      return;
    }
    if (!API_PATH) {
      console.error(
        `Missing config system service config in src/environments/environment.ts => module: ${this.module}`
      );
      return;
    }
    this.serviceUrl = API_URL + API_PATH;
  }

  public search(data?: any, controller?: any): Observable<any> {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}${controller}`;
    return this.getRequest(url, { params: buildParams });
  }
  /**
   * findAll
   */
  public findAll(controller?: any): Observable<any> {
    const url = `${this.serviceUrl}${controller}`;
    return this.getRequest(url);
  }
  /**
   * findOne
   * param id
   */
  public findOne(id: number, controller?: any): Observable<any> {
    const url = `${this.serviceUrl}${controller}/${id}`;
    return this.getRequest(url);
  }

  /**
   * saveOrUpdate
   */
  public saveOrUpdateNew(item: any, controller?: any): Observable<any> {
    const url = `${this.serviceUrl}${controller}`;
    return this.postRequest(url, CommonUtils.convertData(item));
  }

  /**
   * saveOrUpdate
   */
  public saveOrUpdate(item: any): Observable<any> {
    const url = `${this.serviceUrl}`;
    return this.postRequest(url, CommonUtils.convertData(item));
  }
  /**
   * saveOrUpdateFormFile
   */
  public saveOrUpdateFormFile(item: any): Observable<any> {
    const formdata = CommonUtils.convertFormFile(item);
    const url = `${this.serviceUrl}`;
    return this.postRequest(url, formdata);
  }
  /**
   * deleteById
   * param id
   */
  public deleteById(id: number): Observable<any> {
    const url = `${this.serviceUrl}/${id}`;
    this.helperService.isProcessing(true);
    return this.deleteRequest(url);
  }
  /*******************************/

  /**
   * handleError
   */
  public handleError(error: any) {
    return throwError(error.error);
  }
  /**
   * make get request
   */
  public getRequest(url: string, options?: any): Observable<any> {
    this.helperService.isProcessing(true);
    return this.httpClient.get(url, options).pipe(
      tap(
        // Log the result or error
        res => {
          this.helperService.APP_TOAST_MESSAGE.next(res);
          this.helperService.isProcessing(false);
        },
        error => {
          this.helperService.APP_TOAST_MESSAGE.next(error);
          this.helperService.isProcessing(false);
        }
      ),
      catchError(this.handleError)
    );
  }
  public getRequestFile(url: string, options?: any): Observable<any> {
    options.responseType = 'blob';
    options.observe = 'response';
    this.helperService.isProcessing(true);
    return this.httpClient.get(url, options).pipe(
      tap(
        // Log the result or error
        res => {
          this.helperService.APP_TOAST_MESSAGE.next(res);
          this.helperService.isProcessing(false);
        },
        error => {
          this.helperService.APP_TOAST_MESSAGE.next(error);
          this.helperService.isProcessing(false);
        }
      ),
      catchError(this.handleError)
    );
  }
  /**
   * make post request
   */
  public postRequest(url: string, data?: any): Observable<any> {
    this.helperService.isProcessing(true);

    return this.httpClient.post(url, data).pipe(
      tap(
        // Log the result or error
        res => {
          this.helperService.APP_TOAST_MESSAGE.next(res);
          this.helperService.isProcessing(false);
        },
        error => {
          this.helperService.APP_TOAST_MESSAGE.next(error);
          this.helperService.isProcessing(false);
        }
      ),
      catchError(this.handleError)
    );
  }

  /**
   * make put request
   */
  public putRequest(url: string, data?: any): Observable<any> {
    this.helperService.isProcessing(true);

    return this.httpClient.put(url, data).pipe(
      tap(
        // Log the result or error
        res => {
          this.helperService.APP_TOAST_MESSAGE.next(res);
          this.helperService.isProcessing(false);
        },
        error => {
          this.helperService.APP_TOAST_MESSAGE.next(error);
          this.helperService.isProcessing(false);
        }
      ),
      catchError(this.handleError)
    );
  }

  /**
   * make post request for file
   */
  public postRequestFile(url: string, data?: any): Observable<any> {
    this.helperService.isProcessing(true);
    return this.httpClient.post(url, data, { responseType: 'blob' }).pipe(
      tap(
        // Log the result or error
        res => {
          this.helperService.APP_TOAST_MESSAGE.next(res);
          this.helperService.isProcessing(false);
        },
        error => {
          this.helperService.APP_TOAST_MESSAGE.next(error);
          this.helperService.isProcessing(false);
        }
      ),
      catchError(this.handleError)
    );
  }

  /**
   * make post request for file
   */
  public postRequestFile2(url: string, data?: any): Observable<any> {
    this.helperService.isProcessing(true);
    return this.httpClient.post(url, data, { responseType: 'blob', observe: 'response' }).pipe(
      tap(
        // Log the result or error
        res => {
          this.helperService.APP_TOAST_MESSAGE.next(res);
          this.helperService.isProcessing(false);
        },
        error => {
          this.helperService.APP_TOAST_MESSAGE.next(error);
          this.helperService.isProcessing(false);
        }
      ),
      catchError(this.handleError)
    );
  }
  /**
   * make get request
   */
  public deleteRequest(url: string, data?: any): Observable<any> {
    this.helperService.isProcessing(true);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: data
    };
    return this.httpClient.delete(url, httpOptions).pipe(
      tap(
        // Log the result or error
        res => {
          this.helperService.APP_TOAST_MESSAGE.next(res);
          this.helperService.isProcessing(false);
        },
        error => {
          this.helperService.APP_TOAST_MESSAGE.next(error);
          this.helperService.isProcessing(false);
        }
      ),
      catchError(this.handleError)
    );
  }
  /**
   * processReturnMessage
   * param data
   */
  public processReturnMessage(data): void {
    this.helperService.APP_TOAST_MESSAGE.next(data);
  }
  /**
   * request is success
   */
  public requestIsSuccess(data: any): boolean {
    let isSuccess = false;
    if (!data) {
      isSuccess = false;
    }
    // if (data.type === 'SUCCESS' || data.type === 'success') {
    if (data.mess.code === 1) {
      isSuccess = true;
    } else {
      isSuccess = false;
    }
    return isSuccess;
  }
  /**
   * request is success
   */
  public requestIsConfirm(data: any): boolean {
    let isConfirm = false;
    if (!data) {
      isConfirm = false;
    }
    if (data.type === 'CONFIRM') {
      isConfirm = true;
    } else {
      isConfirm = false;
    }
    return isConfirm;
  }
  /**
   * confirmDelete
   */
  public confirmDelete(data): void {
    this.helperService.confirmDelete(data);
  }
  /**
  * make post request for file with language
  */
  public postRequestFileWithLanguage(url: string, data?: any, language?: string): Observable<any> {
    this.helperService.isProcessing(true);
    const httpOptions: any = {
      headers: new HttpHeaders({ 'Accept-Language': language }),
      responseType: 'blob',
      observe: 'response'
    };
    return this.httpClient.post(url, data, httpOptions).pipe(
      tap(
        // Log the result or error
        res => {
          this.helperService.APP_TOAST_MESSAGE.next(res);
          this.helperService.isProcessing(false);
        },
        error => {
          this.helperService.APP_TOAST_MESSAGE.next(error);
          this.helperService.isProcessing(false);
        }
      ),
      catchError(this.handleError)
    );
  }
  buildParams(body) {
    this.credentials = Object.assign({}, body);
    const searchData = CommonUtils.convertData(this.credentials);
    return CommonUtils.buildParams(searchData);
  }
  /**
   *
   * @param topicName
   * @param apiUrl
   * @param body
   * make post request for file
   */
  public postSocketFile(topicName, apiUrl, body): Observable<any> {
    return new Observable((observer) => {
      this.webSocketAPI._connect(topicName,
        (sessionId) => {
          this.postRequest(`${apiUrl}?sessionId=${sessionId}`, body).subscribe(res => {
            observer.next({ type: 'API', headers: null, body: res });
          }, error => {
            observer.error(error);
          });
        },
        (res) => {
          const base64 = 'data:application/octet-binary;base64,' + JSON.parse(res.body).payload;
          fetch(base64)
            .then(r => r.arrayBuffer())
            .then(buffer => {
              observer.next({ type: 'WEBSOCKET', headers: res.headers, body: buffer });
              observer.complete();
            });
        },
        (error) => {
          observer.error(error);
        });
      return {
        unsubscribe() {
        }
      };
    });
  }
}
