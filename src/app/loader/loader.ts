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

            <mask id="cutter-mask">
                <rect x="-500" y="-500" width="100%" height="100%" fill="white" />
                <g>
                    <circle [attr.r]="cutterDiameter/2"  fill="black"></circle>
                    <rect [attr.height]="cutterDiameter" [attr.y]="-cutterDiameter/2" width="100%"></rect>
                    <animateMotion
                            dur="6s"
                            repeatCount="indefinite"
                            rotate="auto-reverse"
                            [attr.path]="cutterPath" />
                    
                </g>
            </mask>
            
            <polygon fill="yellow" mask="url(#cutter-mask)">
                <animate attributeName="points"
                         dur="6s"
                         repeatCount="indefinite"
                         [attr.keyTimes]="animation.keyTimes"
                         [attr.values]="animation.values"/>
            </polygon>

            <path stroke="white" stroke-width="4" fill="none" [attr.d]="cutterPath" />

            <circle [attr.r]="cutterDiameter/2" stroke="blue" stroke-width="5" fill="none">
                <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        [attr.path]="cutterPath" />
            </circle>
        </svg>
    `, styles: ``
})
export class Loader {

    sides = 6

    generatePolyPoints(sides: number, radius: number) {
        return Array.from({length: sides}).map((_, vert) => {
            // points are intentionally duplicated as they will animate independently at the cut edge
            const theta = vert * (Math.PI * 2) / sides;
            return [(Math.cos(theta) * radius).toFixed(2), (Math.sin(theta) * radius).toFixed(2),]
        })
    }

    generateOffsetPolyLine(sides: number, radius: number, offset: number): string {

        const points = Array.from({ length: sides }, (_, i) => {
            const theta = (2 * Math.PI * i) / sides;
            return { x: Math.cos(theta), y: Math.sin(theta) };
        });

        const vertices = points.map(p => ({ x: p.x * radius, y: p.y * radius }));
        const normals = points.map((_, i) => {
            const a = vertices[i];
            const b = vertices[(i + 1) % sides];
            const dx = b.x - a.x, dy = b.y - a.y;
            const len = Math.hypot(dx, dy);
            return { x: dy / len, y: -dx / len }; // outward normal
        });

        const moveTo = (p: { x: number, y: number }) => `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
        const lineTo = (p: { x: number, y: number }) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
        const arcTo = (p: { x: number, y: number }) => `A ${offset} ${offset} 0 0 1 ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;

        let d = moveTo({
            x: vertices[0].x + normals[sides - 1].x * offset,
            y: vertices[0].y + normals[sides - 1].y * offset,
        });

        for (let i = 0; i < sides; i++) {
            const v = vertices[i];
            const n1 = normals[i];

            const out = { x: v.x + n1.x * offset, y: v.y + n1.y * offset };
            const inc = { x: vertices[(i + 1) % sides].x + n1.x * offset, y: vertices[(i + 1) % sides].y + n1.y * offset };

            d += arcTo(out);
            d += lineTo(inc);
        }

        return d + 'Z';
    }

    minDiameter = 600;
    maxDiameter = 800;

    animation = this.generateAnimationFrames(this.sides, this.minDiameter, this.maxDiameter);

    stepover = 0.3;
    cutterDiameter = 150;
    cutterPath = this.generateOffsetPolyLine(this.sides, this.minDiameter/2, this.cutterDiameter/2);

    polyPoints = this.generatePolyPoints(this.sides, this.maxDiameter/2)
    polyPoints2 = this.generatePolyPoints(this.sides, this.minDiameter/2)

    generateAnimationFrames(sides: number, minDiameter: number, maxDiameter: number) {

        const allPoints = Array.from({length: sides + 1}).map((_, index) => {
            const diameter = minDiameter + index * (maxDiameter - minDiameter) / (sides-1);
            return this.generatePolyPoints(sides, diameter / 2)
        })

        const rotatedPoints = Array.from({length: sides + 1}).map((_, keyframeIndex) => {
            return Array.from({length: sides}).map((_, sideIndex) => {
                const offsetA = (sides + keyframeIndex - sideIndex - 1) % sides;

                const firstPoint = /*offsetA === sides - 1 ? allPoints[0][sideIndex] : */allPoints[offsetA][sideIndex];

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
