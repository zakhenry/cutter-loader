import {Component} from '@angular/core';

@Component({
    selector: 'app-loader', imports: [], template: `
        <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-500 -500 1000 1000"
                transform="rotate(-90 0 0)"
        >

            <g id="animation">

                <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 0 0"
                        to="-360 0 0"
                        [attr.dur]="duration * 2"
                        repeatCount="indefinite" />
            
                <defs>
                    <g id="cutter-raw">
                        <circle [attr.r]="cutterDiameter/2" fill="black"></circle>
                        <rect [attr.height]="cutterDiameter" [attr.y]="-cutterDiameter/2" width="100%"></rect>
                        <animateMotion
                                [attr.dur]="duration"
                                repeatCount="indefinite"
                                rotate="auto-reverse"
                                [attr.path]="cutterPath"/>
    
                    </g>
    
                    <mask id="cutter-mask">
                        <rect x="-500" y="-500" width="1000" height="1000" fill="white"/>
                        <use href="#cutter-raw"/>
                    </mask>
    
                    <filter id="stroke-sim" filterUnits="userSpaceOnUse" x="-500" y="-500" width="1000" height="1000">
                        <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="dilated"/>
                        <feComposite in="dilated" in2="SourceAlpha" operator="xor" result="outline"/>
                        <feFlood flood-color="white" result="strokeFill"/>
                        <feComposite in="strokeFill" in2="outline" operator="in"/>
                    </filter>
                </defs>
    
                <g filter="url(#stroke-sim)">
                    <polygon mask="url(#cutter-mask)"
                    >
                        <animate attributeName="points"
                                 [attr.dur]="duration"
                                 repeatCount="indefinite"
                                 [attr.keyTimes]="animation.keyTimes"
                                 [attr.values]="animation.values"/>
                    </polygon>
                </g>
    
                
<!--                <path stroke="grey" stroke-width="4" fill="none" [attr.d]="cutterPath" />-->
<!--                <circle [attr.r]="stockDiameter/2" stroke="yellow" stroke-width="4" fill="none"></circle>-->
<!--                <circle [attr.r]="targetDiameter/2" stroke="green" stroke-width="4" fill="none"></circle>-->
                
    
                <circle [attr.r]="cutterDiameter/2 - 2" stroke="white" stroke-width="4" fill="none">
                    <animateMotion
                            [attr.dur]="duration"
                            repeatCount="indefinite"
                            calcMode="linear"
                            [attr.path]="cutterPath" />
                </circle>
            </g>
        </svg>
    `, styles: ``
})
export class Loader {

    sides = 5
    duration = 5
    stepoverPercent = 30; // note this must be less than 50% due to how the masking currently works
    cutterDiameter = 200;
    stepover = this.cutterDiameter * (this.stepoverPercent / 100);

    targetDiameter = 500;
    stockDiameter = this.targetDiameter + (2 * this.stepover) / Math.cos(Math.PI / this.sides);

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


    animation = this.generateAnimationFrames(this.sides, this.targetDiameter, this.stockDiameter);

    cutterPath = this.generateOffsetPolyLine(this.sides, this.targetDiameter/2, this.cutterDiameter/2);

    // polyPoints = this.generatePolyPoints(this.sides, this.maxDiameter/2)
    // polyPoints2 = this.generatePolyPoints(this.sides, this.minDiameter/2)

    generateAnimationFrames(sides: number, minDiameter: number, maxDiameter: number) {

        const allPoints = Array.from({length: sides}).map((_, index) => {
            const diameter = minDiameter + (index % sides) * (maxDiameter - minDiameter) / (sides-1);
            return this.generatePolyPoints(sides, diameter / 2)
        })

        const rotatedPoints = Array.from({length: sides + 1}).flatMap((_, keyframeIndex) => {
            const rotated = Array.from({length: sides}).map((_, sideIndex) => {
                const rotatedOffset = (sides + keyframeIndex - sideIndex - 1) % sides;

                const targetPoint = rotatedOffset === 0 ? allPoints.at(-1)![sideIndex]: allPoints[rotatedOffset][sideIndex];

                return [
                    allPoints[rotatedOffset][sideIndex],
                    targetPoint,
                ];
            });

            const rotatedOffset = Array.from({length: sides}).map((_, sideIndex) => {
                const rotatedOffset = (sides + keyframeIndex - sideIndex - 1) % sides;

                const targetPoint = rotatedOffset === sides - 1 ? allPoints.at(0)![sideIndex]: allPoints[rotatedOffset][sideIndex];

                return [
                    targetPoint,
                    allPoints[rotatedOffset][sideIndex],
                ];
            });

            return [rotated, rotatedOffset]
        });


        const keyTimes = Array.from({length: sides }).flatMap((_, index) => [index / sides, index / sides]).join("; ") + '; 1; 1';

        return {
            keyTimes,
            values: rotatedPoints.join(';\n')
        }

    }

}
