import {Component, computed, input, signal} from '@angular/core';

@Component({
    selector: 'app-loader',
    imports: [],
    template: `
        <svg
                xmlns="http://www.w3.org/2000/svg"
                [attr.viewBox]="[-viewboxWidth/2, -viewboxWidth/2, viewboxWidth, viewboxWidth]"
                transform="rotate(-90 0 0)"
        >

            <g id="animation">

                <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 0 0"
                        to="-360 0 0"
                        [attr.dur]="spinDuration()"
                        repeatCount="indefinite"/>

                <defs>
                    <g id="cutter-raw">
                        <circle [attr.r]="cutterDiameter()/2" fill="black"></circle>
                        <rect [attr.height]="cutterDiameter()" [attr.y]="-cutterDiameter()/2" width="100%"></rect>
                        <animateMotion
                                [attr.dur]="cutterDuration()"
                                repeatCount="indefinite"
                                rotate="auto-reverse"
                                [attr.path]="cutterPath()"/>

                    </g>

                    <mask id="cutter-mask">
                        <rect [attr.x]="-viewboxWidth/2" [attr.y]="-viewboxWidth/2" [attr.width]="viewboxWidth"
                              [attr.height]="viewboxWidth" fill="white"/>
                        <use href="#cutter-raw"/>
                    </mask>

                    <filter id="stroke-sim" filterUnits="userSpaceOnUse" [attr.x]="-viewboxWidth/2"
                            [attr.y]="-viewboxWidth/2" [attr.width]="viewboxWidth" [attr.height]="viewboxWidth">
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
                                 [attr.dur]="cutterDuration()"
                                 repeatCount="indefinite"
                                 [attr.keyTimes]="animation().keyTimes"
                                 [attr.values]="animation().values"/>
                    </polygon>
                </g>


                <!--                <path stroke="grey" stroke-width="4" fill="none" [attr.d]="cutterPath" />-->
                <!--                <circle [attr.r]="stockDiameter/2" stroke="yellow" stroke-width="4" fill="none"></circle>-->
                <!--                <circle [attr.r]="targetDiameter/2" stroke="green" stroke-width="4" fill="none"></circle>-->


                <circle [attr.r]="cutterDiameter()/2 - 2" stroke="white" stroke-width="4" fill="none">
                    <animateMotion
                            [attr.dur]="cutterDuration()"
                            repeatCount="indefinite"
                            calcMode="linear"
                            [attr.path]="cutterPath()"/>
                </circle>
            </g>
        </svg>
    `
})
export class Loader {

    viewboxWidth = 1000

    // inputs
    sides = input.required<number>()
    cutterDuration = input.required<number>()
    spinDuration = input.required<number>()
    stepoverPercent = input.required<number, number>({
        // note this must be less than 50% due to how the masking currently works
        transform: v => Math.min(v, 50)}
    );
    cutterWorkpieceRatio = input.required<number>();

    targetDiameter = this.viewboxWidth / 2;
    cutterDiameter = computed(() => this.targetDiameter / this.cutterWorkpieceRatio());

    // calculated values
    stepover = computed(() => this.cutterDiameter() * (this.stepoverPercent() / 100));
    stockDiameter = computed(() => this.targetDiameter + (2 * this.stepover()) / Math.cos(Math.PI / this.sides()));
    animation = computed(() => this.generateAnimationFrames(this.sides(), this.targetDiameter, this.stockDiameter()));
    cutterPath = computed(() => this.generateOffsetPolyLine(this.sides(), this.targetDiameter/2, this.cutterDiameter()/2));

    generatePolyPoints(sides: number, radius: number): number[][] {
        return Array.from({length: sides}).map((_, vert) => {
            const theta = vert * (Math.PI * 2) / sides;
            return [
                (Math.cos(theta) * radius),
                (Math.sin(theta) * radius),
            ]
        })
    }

    generateOffsetPolyLine(sides: number, radius: number, offset: number): string {

        const points = this.generatePolyPoints(sides, radius);

        const vertices = points.map(([x, y]) => ({ x, y }));
        const normals = vertices.map((a, i) => {
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
            const vertex = vertices[i];
            const normal = normals[i];

            const out = { x: vertex.x + normal.x * offset, y: vertex.y + normal.y * offset };
            const inc = { x: vertices[(i + 1) % sides].x + normal.x * offset, y: vertices[(i + 1) % sides].y + normal.y * offset };

            d += arcTo(out);
            d += lineTo(inc);
        }

        return d + 'Z';
    }

    generateAnimationFrames(sides: number, minDiameter: number, maxDiameter: number) {

        const allPoints = Array.from({ length: sides }).map((_, index) => {
            const diameter = minDiameter + (index % sides) * (maxDiameter - minDiameter) / (sides - 1);
            return this.generatePolyPoints(sides, diameter / 2)
                .map(p => p.map(p => p.toFixed(0)));
        });

        // Helper function to get modified vertex (if applicable, returns null if no modification required)
        function getModifiedVertex(rotatedOffset: number, sideIndex: number, trailingCoordinate: boolean) {
            if (trailingCoordinate && rotatedOffset === sides - 1) {
                return allPoints[0][sideIndex];
            }

            if (!trailingCoordinate && rotatedOffset === 0) {
                return allPoints[allPoints.length - 1][sideIndex];
            }

            return null;
        }

        function computeConnectionPairs(keyframeIndex: number, trailingCoordinate: boolean) {
            return Array.from({ length: sides }).map((_, sideIndex) => {
                const rotatedOffset = (sides + keyframeIndex - sideIndex - 1) % sides;
                const actualVertex = allPoints[rotatedOffset][sideIndex];
                const modifiedVertex = getModifiedVertex(rotatedOffset, sideIndex, trailingCoordinate) ?? actualVertex;

                return trailingCoordinate
                    ? [modifiedVertex, actualVertex]
                    : [actualVertex, modifiedVertex];
            });
        }

        const rotatedPoints = Array.from({ length: sides + 1 })
            .flatMap((_, keyframeIndex) => {
                return [
                    computeConnectionPairs(keyframeIndex, false),
                    computeConnectionPairs(keyframeIndex, true)
                ];
            });

        const keyTimes = Array.from({ length: sides })
            .flatMap((_, index) => [index / sides, index / sides])
            .join("; ") + '; 1; 1';

        return {
            keyTimes,
            values: rotatedPoints.join(';\n')
        };

    }

}
