const JOURNEY_CONTROL_POINTS = [
    { x: 15.64, z: 36.38 },
    { x: 18.65, z: 38.25 },
    { x: 28.15, z: 41.40 },
    { x: 39.64, z: 43.40 },
    { x: 46.03, z: 37.01 },
    { x: 52.41, z: 34.00 },
    { x: 58.80, z: 34.00 },
    { x: 63.31, z: 30.25 },
    { x: 69.32, z: 22.36 },
    { x: 63.69, z: 7.33 },
    { x: 65.57, z: 4.32 },
    { x: 68.95, z: -6.20 },
    // The final story point. From here the car enters the altar on autopilot.
    { x: 74.96, z: -14.09 },
]

const PORTAL_CENTER = { x: 75.34, z: -27.95 }

const addFrozenPoint = (points, x, z) =>
{
    points.push(Object.freeze({ x, z }))
}

const createRoundedJourney = () =>
{
    const points = []
    const lastControlIndex = JOURNEY_CONTROL_POINTS.length - 1

    for(let i = 0; i <= lastControlIndex; i++)
    {
        const current = JOURNEY_CONTROL_POINTS[i]

        // Preserve the Cookie and bridge alignment exactly. The final story
        // point also stays exact so it can hand off cleanly to the portal.
        if(i <= 2 || i === lastControlIndex)
        {
            addFrozenPoint(points, current.x, current.z)
            continue
        }

        const previous = JOURNEY_CONTROL_POINTS[i - 1]
        const next = JOURNEY_CONTROL_POINTS[i + 1]
        const previousLength = Math.hypot(current.x - previous.x, current.z - previous.z)
        const nextLength = Math.hypot(next.x - current.x, next.z - current.z)
        const radius = Math.min(2.15, previousLength * 0.22, nextLength * 0.22)
        const entryRatio = radius / previousLength
        const exitRatio = radius / nextLength
        const entry = {
            x: current.x + (previous.x - current.x) * entryRatio,
            z: current.z + (previous.z - current.z) * entryRatio,
        }
        const exit = {
            x: current.x + (next.x - current.x) * exitRatio,
            z: current.z + (next.z - current.z) * exitRatio,
        }

        addFrozenPoint(points, entry.x, entry.z)

        // A short quadratic arc rounds each corner while remaining close to
        // the terrain-verified control path.
        for(let step = 1; step <= 4; step++)
        {
            const t = step / 4
            const inverseT = 1 - t
            addFrozenPoint(
                points,
                inverseT * inverseT * entry.x + 2 * inverseT * t * current.x + t * t * exit.x,
                inverseT * inverseT * entry.z + 2 * inverseT * t * current.z + t * t * exit.z,
            )
        }
    }

    return points
}

const roundedJourneyPoints = createRoundedJourney()

export const JOURNEY_TIMELINE_END_INDEX = roundedJourneyPoints.length - 1

export const JOURNEY_PATH_POINTS = Object.freeze([
    ...roundedJourneyPoints,
    Object.freeze(PORTAL_CENTER),
])

export const getJourneyYaw = (from, to) =>
{
    return Math.atan2(-(to.z - from.z), to.x - from.x)
}

export const getJourneyPathDistanceSquared = (x, z) =>
{
    let closestDistanceSquared = Infinity

    for(let i = 0; i < JOURNEY_PATH_POINTS.length - 1; i++)
    {
        const start = JOURNEY_PATH_POINTS[i]
        const end = JOURNEY_PATH_POINTS[i + 1]
        const deltaX = end.x - start.x
        const deltaZ = end.z - start.z
        const lengthSquared = deltaX * deltaX + deltaZ * deltaZ
        const t = Math.max(0, Math.min(1, (
            (x - start.x) * deltaX +
            (z - start.z) * deltaZ
        ) / lengthSquared))
        const projectedX = start.x + deltaX * t
        const projectedZ = start.z + deltaZ * t
        const distanceX = x - projectedX
        const distanceZ = z - projectedZ
        const distanceSquared = distanceX * distanceX + distanceZ * distanceZ

        closestDistanceSquared = Math.min(closestDistanceSquared, distanceSquared)
    }

    return closestDistanceSquared
}
