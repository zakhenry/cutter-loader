import { Component } from "@angular/core";
import { Loader } from "./loader/loader";

@Component({
  selector: "app-root",
  imports: [Loader],
  template: ` <app-loader></app-loader> `,
  styles: `
    :host {
      display: grid;
      grid-template-areas: ". . ." ". loader ." ". . .";
      grid-template-rows: 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      height: 100vh;
    }

    app-loader {
      grid-area: loader;
      box-shadow: hsla(0, 0%, 30%, 0.2) 0px 8px 24px;
    }
  `,
})
export class App {}
