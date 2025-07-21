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

            <polygon stroke="yellow" stroke-width="5" fill="none">
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

    sides = 6;

    polyPoints = this.generatePolyPoints(this.sides, 500)
    polyPoints2 = this.generatePolyPoints(this.sides, 400)

    generatePolyPoints(sides: number, radius: number) {
        return Array.from({length: sides}).map((_, vert) => {
            // points are intentionally duplicated as they will animate independently at the cut edge
            const theta = vert * (Math.PI * 2) / sides;
            return [(Math.cos(theta) * radius).toFixed(2), (Math.sin(theta) * radius).toFixed(2),]
        })
    }

    animation = this.generateAnimationFrames(this.sides, 800, 1000)

    generateAnimationFrames(sides: number, minDiameter: number, maxDiameter: number) {

        const allPoints = Array.from({length: sides + 1}).map((_, index) => {
            const diameter = minDiameter + index * (maxDiameter - minDiameter) / (sides-1);
            return this.generatePolyPoints(sides, diameter / 2)
        })

        const rotatedPoints = Array.from({length: sides + 1}).map((_, keyframeIndex) => {
            return Array.from({length: sides}).map((_, sideIndex) => {
                const offsetA = (sides + keyframeIndex - sideIndex) % sides;

                const firstPoint = offsetA === sides - 1 ? allPoints[0][sideIndex] : allPoints[offsetA][sideIndex];

                // duplicate vertex
                return [
                    firstPoint,
                    allPoints[offsetA][sideIndex],
                ]
            })
        });

        return {
            keyTimes: Array.from({length: sides + 1}).map((_, index) => index / sides).join("; "),
            values: rotatedPoints.join(';\n')
        }

    }

}
