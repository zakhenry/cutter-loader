import {Component} from '@angular/core';

@Component({
    selector: 'app-loader', imports: [], template: `
        <svg
                xmlns:svg="http://www.w3.org/1999/html"
                viewBox="-500 -500 1000 1000"
        >

<!--            <polygon fill="red" [attr.points]="polyPoints"></polygon>-->
<!--            <polygon fill="green" [attr.points]="polyPoints2"></polygon>-->
<!--            <polygon [attr.points]="polyPoints2"></polygon>-->

            
            <polygon stroke="yellow" stroke-width="5" fill="none">
                <animate attributeName="points"
                         dur="6s"
                         repeatCount="indefinite"
                         [attr.keyTimes]="animation.keyTimes"
                         [attr.values]="animation.values"/>
            </polygon>

            <path stroke="white" stroke-width="4" fill="none" [attr.d]="cutterPath" />

            <circle [attr.r]="cutterDiameter" stroke="blue" stroke-width="5" fill="none">
                <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        [attr.path]="cutterPath" />
            </circle>
        </svg>
    `, styles: ``
})
export class Loader {

    sides = 6;

    generatePolyPoints(sides: number, radius: number) {
        return Array.from({length: sides}).map((_, vert) => {
            // points are intentionally duplicated as they will animate independently at the cut edge
            const theta = vert * (Math.PI * 2) / sides;
            return [(Math.cos(theta) * radius).toFixed(2), (Math.sin(theta) * radius).toFixed(2),]
        })
    }

    generateOffsetPolyLine(sides: number, radius: number, offset: number): string {
        /** ---- 1  original vertices on the circum-circle ---- */
        const vertices = Array.from({ length: sides }).map((_, i) => {
            const θ = (2 * Math.PI * i) / sides;
            return { x: Math.cos(θ) * radius, y: Math.sin(θ) * radius };
        });

        /** ---- 2  unit outward normals for each edge ---- */
        const normals = vertices.map((v, i) => {
            const n = (i + 1) % sides;
            const dir = {
                x: vertices[n].x - v.x,
                y: vertices[n].y - v.y,
            };
            const len = Math.hypot(dir.x, dir.y);
            // CCW polygon  ⟹  outward normal = 90° CW rotation (dy, −dx)
            return { x: dir.y / len, y: -dir.x / len };
        });

        /** ---- 3  helper to build incoming / outgoing points ---- */
        const incoming = (i: number) => ({
            x: vertices[i].x + normals[(i - 1 + sides) % sides].x * offset,
            y: vertices[i].y + normals[(i - 1 + sides) % sides].y * offset,
        });
        const outgoing = (i: number) => ({
            x: vertices[i].x + normals[i].x * offset,
            y: vertices[i].y + normals[i].y * offset,
        });

        /** ---- 4  assemble the path ---- */
        let d = '';
        const p0 = incoming(0);
        d += `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} `;

        for (let i = 0; i < sides; i++) {
            const out = outgoing(i);
            // small-arc-flag = 0  (all vertex arcs < 180°)
            // sweep-flag      = 1  (clockwise in screen coords)
            d += `A ${offset} ${offset} 0 0 1 ${out.x.toFixed(2)} ${out.y.toFixed(2)} `;

            // straight segment to next vertex’s incoming point
            const nextInc = incoming((i + 1) % sides);
            d += `L ${nextInc.x.toFixed(2)} ${nextInc.y.toFixed(2)} `;
        }

        return d + 'Z'; // close path
    }

    minDiameter = 600;
    maxDiameter = 800;

    animation = this.generateAnimationFrames(this.sides, this.minDiameter, this.maxDiameter);

    stepover = 0.3;
    cutterDiameter = 80;
    cutterPath = this.generateOffsetPolyLine(this.sides, this.minDiameter/2, this.cutterDiameter);

    polyPoints = this.generatePolyPoints(this.sides, this.maxDiameter/2)
    polyPoints2 = this.generatePolyPoints(this.sides, this.minDiameter/2)

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
