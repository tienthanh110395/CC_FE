import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';


@Injectable({
    providedIn: 'root'
})
export class CryptoService {
    private static encrText = 'rNZSYvtgfyUPx75Okf6ArEx2SiktAW9j';
    public static encr(data) {
        try {
          return CryptoJS.AES.encrypt(JSON.stringify(data), this.encrText).toString();
        } catch (e) {
          // console.log(e);
        }
    }
    public static decr(data) {
        try {
          const bytes = CryptoJS.AES.decrypt(data, this.encrText);
          if (bytes) {
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
          }
          return data;
        } catch (e) {
          // console.log(e);
        }
    }
}
