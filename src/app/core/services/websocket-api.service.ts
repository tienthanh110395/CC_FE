import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppStorage } from './AppStorage';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketAPI {
  webSocketEndPoint = environment.serverUrl.api_websocket + '/ws';
  stompClient: any;

  constructor(
    private oauthService: OAuthService,
    private _httpClient: HttpClient,
  ) { }

  _connect(topicName, sessionIdCallback, responseCallback, errorCallback) {
    console.log('Initialize WebSocket Connection');
    const ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    this.stompClient.debug = null;
    // this.stompClient.maxWebSocketFrameSize = 16 * 1024;
    const _this = this;
    const token = this.oauthService.getAccessToken();
    const userLogin = AppStorage.getUserLogin();
    _this.stompClient.connect({ 'X-Authorization': 'Bearer ' + token }, (frame) => {
      let url = _this.stompClient.ws._transport.url;
      if (url.includes('ws:')) {
        const urlService = this.webSocketEndPoint.replace('http:', 'ws:') + '/';
        url = url.replace(urlService, '');
      } else {
        url = url.replace(this.webSocketEndPoint + '/', '');
      }
      url = url.replace('/websocket', '');
      url = url.replace(/^[0-9]+\//, '');
      const sessionId = url;
      sessionIdCallback(sessionId);
      _this.stompClient.subscribe(`/topic/${topicName}/` + userLogin + '/' + sessionId, (message) => {
        responseCallback(message);
        _this._disconnect();
      });
    }, (error) => errorCallback(error));
  }
  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('Disconnected');
  }

}
