import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { authConfig } from '@app/core/auth.config';
import { AuthConfigService } from '@app/core/services/auth-keycloak.service';
import { StartupService, TokenInterceptor, TranslateLangService } from '@core';
import { COMMOM_CONFIG } from '@env/environment';
import { FormlyModule } from '@ngx-formly/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ValidationService } from "@shared/common/validation.service";
import { CustomFormlyFieldInput } from "@shared/components/formly-field/fieldinput-types";
import { FlexLayoutType } from "@shared/components/formly-field/flexlayout-type";
import { AuthConfig, OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { RoutesModule } from './routes/routes.module';
import { SharedModule } from './shared/shared.module';
import { ThemeModule } from './theme/theme.module';

export function init_app(authConfigService: AuthConfigService) {
  return () => authConfigService.initAuth();
}

// Required for AOT compilation
export function TranslateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function TranslateLangServiceFactory(translateLangService: TranslateLangService) {
  return () => translateLangService.load();
}

export function StartupServiceFactory(startupService: StartupService) {
  return () => startupService.load();
}


@NgModule({
  declarations: [AppComponent, FlexLayoutType, CustomFormlyFieldInput],
  imports: [
    BrowserModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    ThemeModule,
    RoutesModule,
    FormlyModule.forRoot({
      types: [
        {
          name: 'flex-layout', component: FlexLayoutType,
        },
        {
          name: 'v-input',
          component: CustomFormlyFieldInput,
          wrappers: ['form-field'],
        },
      ],
      validationMessages: [
        { name: 'required', message: 'Trường thông tin bắt buộc' },
        { name: 'invalidEmail', message: 'Email không đúng định dạng' },
        { name: 'matDatepickerParse', message: 'Vui lòng nhập đúng định dạng DD/MM/YYYY' },
        { name: 'matDatepickerMax', message: 'Không nhập quá ngày hiện tại' },
        { name: 'maxFileSize', message: 'File không vượt quá 7MB' },
      ],
      validators: [
        { name: 'invalidEmail', validation: ValidationService.emailFormat },
      ]
    }),
    ToastrModule.forRoot(),

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BrowserAnimationsModule,
    OAuthModule.forRoot(
      {
        resourceServer: {
          allowedUrls: [COMMOM_CONFIG.BASE_URL],
          sendAccessToken: true
        }
      }
    ),
  ],
  providers: [
    AuthConfigService,
    { provide: AuthConfig, useValue: authConfig },
    { provide: OAuthStorage, useValue: sessionStorage },
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AuthConfigService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: TranslateLangServiceFactory,
      deps: [TranslateLangService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: StartupServiceFactory,
      deps: [StartupService],
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
