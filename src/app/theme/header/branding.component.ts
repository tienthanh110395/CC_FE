import { Component } from '@angular/core';

@Component({
  selector: 'app-branding',
  template: `
    <a class="matero-branding" href="#/">
      <img src="./assets/icons/Logo_epass.svg" class="matero-branding-logo-expanded" alt="logo" />
      <span class="matero-branding-name"></span>
    </a>
  `,
})
export class BrandingComponent {}
