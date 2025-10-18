
import type { Point, PegData, Grid } from '../types';
import { CELL_SIZE } from '../constants';

const getPegCenter = (peg: PegData): Point => {
    return {
        x: (peg.col - 1) * CELL_SIZE + CELL_SIZE / 2,
        y: (peg.row - 1) * CELL_SIZE + CELL_SIZE / 2,
    };
};

function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    function orientation(p: Point, q: Point, r: Point): number {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0; // Collinear
        return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
    }

    function onSegment(p: Point, q: Point, r: Point): boolean {
        return (
            q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
        );
    }

    const o1 = orientation(p1, p2, p3);
    const o2 = orientation(p1, p2, p4);
    const o3 = orientation(p3, p4, p1);
    const o4 = orientation(p3, p4, p2);

    // General case
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }
    
    // This is a simplified check that avoids counting intersections at endpoints.
    // In this game, lines sharing an endpoint (peg) should not be considered intersecting.
    // The main loop already prevents checking lines from the same pair, but this is a safeguard.
    const points = [p1, p2, p3, p4];
    const uniquePoints = new Set(points.map(p => `${p.x},${p.y}`));
    if (uniquePoints.size < 4) {
        return false;
    }

    // Collinear cases check
    if (o1 === 0 && onSegment(p1, p3, p2)) return true;
    if (o2 === 0 && onSegment(p1, p4, p2)) return true;
    if (o3 === 0 && onSegment(p3, p1, p4)) return true;
    if (o4 === 0 && onSegment(p3, p2, p4)) return true;

    return false;
}


export function calculateTotalIntersections(pegs: PegData[], grid: Grid): number {
    if (pegs.length < 4) return 0;

    const ropes: { p1: Point, p2: Point, pairId: string }[] = [];
    const pegPairs: Record<string, PegData[]> = {};

    pegs.forEach(peg => {
        if (!pegPairs[peg.pair]) {
            pegPairs[peg.pair] = [];
        }
        pegPairs[peg.pair].push(peg);
    });

    Object.values(pegPairs).forEach(pair => {
        if (pair.length === 2) {
            ropes.push({
                p1: getPegCenter(pair[0]),
                p2: getPegCenter(pair[1]),
                pairId: pair[0].pair,
            });
        }
    });

    let intersectionCount = 0;
    for (let i = 0; i < ropes.length; i++) {
        for (let j = i + 1; j < ropes.length; j++) {
            const rope1 = ropes[i];
            const rope2 = ropes[j];
            
            // Ropes of the same pair cannot intersect themselves.
            // This condition is technically already handled by the i/j loop, but it's good for clarity.
            if (rope1.pairId === rope2.pairId) continue;
            
            if (segmentsIntersect(rope1.p1, rope1.p2, rope2.p1, rope2.p2)) {
                intersectionCount++;
            }
        }
    }

    return intersectionCount;
}
