import {Component, signal} from "@angular/core";
import { Loader } from "./loader/loader";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: "app-root",
  imports: [Loader, ReactiveFormsModule],
  template: `
    <app-loader [sides]="sides()" 
                [cutterDuration]="cutterDuration()" 
                [spinDuration]="spinDuration()" 
                [stepoverPercent]="stepover()"
                [cutterWorkpieceRatio]="cutterWorkpieceRatio()"
    ></app-loader>

    <div class="settings">
      <span>{{ sides() }}</span>
      <input #sidesInput type="range" step="1" id="sides" min="3" max="8" [value]="sides()" (input)="sides.set(+sidesInput.value)"/>
      <label for="sides">Sides</label>

      <span>{{ stepover() }}</span>
      <input #stepoverInput type="range" step="2" id="stepover" min="2" max="50" [value]="stepover()" (input)="stepover.set(+stepoverInput.value)"/>
      <label for="stepover">Stepover (%)</label>

      <span>{{ cutterWorkpieceRatio() }}</span>
      <input #cutterWorkpieceRatioInput type="range" step=".2" id="cutterWorkpieceRatio" min="1" max="12" [value]="cutterWorkpieceRatio()" (input)="cutterWorkpieceRatio.set(+cutterWorkpieceRatioInput.value)"/>
      <label for="cutterWorkpieceRatio">Cutter/Workpiece diameter</label>


      <span>{{ cutterDuration() }}</span>
      <input #cutterDurationInput type="range" step=".2" id="cutterDuration" min="1" max="30" [value]="cutterDuration()" (input)="cutterDuration.set(+cutterDurationInput.value)"/>
      <label for="duration">Cutter Duration (seconds)</label>

      <span>{{ spinDuration() }}</span>
      <input #spinDurationInput type="range" step=".2" id="spinDuration" min="0" max="30" [value]="spinDuration()" (input)="spinDuration.set(+spinDurationInput.value)"/>
      <label for="duration">Spin Duration (seconds)</label>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      height: 100vh;
      grid-template-columns: 50vh;
      grid-template-areas: "loader" "settings";
      justify-content: center;
    }
    
    @media (min-width: 1200px) {
      :host {
        grid-template-areas: "settings . ." ". loader ." ". . .";
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    app-loader {
      grid-area: loader;
      box-shadow: hsla(0, 0%, 30%, 0.2) 0px 8px 24px;
    }
    
    .settings {
      grid-area: settings;
      display: grid;
      grid-template-columns: 50px 1fr 1fr;
      align-content: space-evenly;
    }
    
    .settings * {
      padding: 1rem;
    }
    
    .settings span {
      justify-self: end;
    }
  `,
})
export class App {
  sides = signal(5);
  cutterDuration = signal(5);
  spinDuration = signal(10);
  stepover = signal(30);
  cutterWorkpieceRatio = signal(2.5);
}
