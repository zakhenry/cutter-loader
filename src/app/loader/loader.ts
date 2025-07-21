import {Component} from '@angular/core';

@Component({
    selector: 'app-loader', imports: [], template: `
        <svg
                xmlns:svg="http://www.w3.org/1999/html"
                viewBox="-500 -500 1000 1000"
        >

            <polygon fill="red" [attr.points]="polyPoints"></polygon>
            <polygon fill="green" [attr.points]="polyPoints2"></polygon>
            <polygon [attr.points]="polyPoints2"></polygon>

            <polygon stroke="yellow" stroke-width="2" fill="none">
                <animate attributeName="points"
                         dur="6s"
                         repeatCount="indefinite"
                         [attr.keyTimes]="animation.keyTimes"
                         [attr.values]="animation.values"/>
            </polygon>
        </svg>
    `, styles: ``
})
export class Loader {

    sides = 4;

    polyPoints = this.generatePolyPoints(this.sides, 500)
    polyPoints2 = this.generatePolyPoints(this.sides, 300)

    generatePolyPoints(sides: number, radius: number) {
        return Array.from({length: sides}).flatMap((_, index) => {

            // points are intentionally duplicated as they will animate independently at the cut edge
            return [index, index + 1]
                .map((vert) => {
                    const theta = vert * (Math.PI * 2) / sides;
                    return [
                        (Math.cos(theta) * radius).toFixed(2),
                        (Math.sin(theta) * radius).toFixed(2),
                    ]
                })
        })
    }

    animation = this.generateAnimationFrames(this.sides, 600, 1000)

    generateAnimationFrames(sides: number, minDiameter: number, maxDiameter: number) {

        const allPoints = Array.from({length: sides + 1}).map((_, index) => {
            const diameter = minDiameter + index * (maxDiameter - minDiameter) / (sides);
            return this.generatePolyPoints(sides, diameter/2)
        })

        console.log(`al`, allPoints);

        // const inner = this.generatePolyPoints(sides, minDiameter/2);
        // const outer = this.generatePolyPoints(sides, maxDiameter/2);


        return {
            keyTimes: Array.from({length: sides + 1}).map((_, index) => index / sides).join("; "),
            values: allPoints.join(';\n')
        }

    }

}
