import { Game } from './Game.js'
import { clamp } from 'three/src/math/MathUtils.js'
import { Quaternion, Vector3 } from 'three'
import { getJourneyPathDistanceSquared, JOURNEY_PATH_POINTS, JOURNEY_TIMELINE_END_INDEX } from './JourneyPath.js'

const MILESTONES = [
    {
        year: '2007',
        eyebrow: 'Chapter I · Origins',
        title: 'Player One Spawns',
        copy: 'I showed up in 2007 — no master plan, no neat story. Just a curious kid who liked figuring things out because it felt good. That part never left.',
    },
    {
        year: '2012',
        eyebrow: 'Chapter I · Origins',
        title: 'The First Machine',
        copy: 'Age 5, a PC lands in the house. Other kids got toys; I got a boot screen. I didn’t know it yet, but the whole obsession quietly installed itself right there.',
    },
    {
        year: '2022',
        eyebrow: 'Chapter II · Discovery',
        title: 'First Line of Code',
        copy: 'Age 15 — one “Hello, World” and something clicked. Python, then backend: servers, routes, databases. Not a study-all-day love — the curious, sit-there-and-figure-it-out kind. The invisible half of the internet started to feel like home.',
    },
    {
        year: '2023',
        eyebrow: 'Chapter II · Discovery',
        title: 'The XP Outside the Terminal',
        copy: 'I’m not only about tech. Guitar gives me a peace nothing else does; anime I genuinely connect with; books to get lost in; chess to think a few moves ahead. I joke a lot and stay chill — that never meant I wasn’t thinking deeply. I just don’t show it the usual way.',
    },
    {
        year: '2024',
        eyebrow: 'Chapter III · The Search',
        title: 'The Search',
        copy: 'Age 17 — bug-hunting competitions and coding contests, one after another; finding what breaks became a sport. But I kept pulling every direction: AI, backend, hacking, business, content. It’s not that I lack ambition — I just haven’t locked onto one thing yet.',
    },
    {
        year: '2025',
        eyebrow: 'Chapter IV · The Detour',
        title: 'Off Track',
        copy: 'Then college — new freedom, no structure, distractions everywhere. Days started slipping: scrolling, wasting time, eating junk, knowing better and still not fixing it. Attachments and overthinking too — I’ve cared about people more than I probably should have, and it cost me focus.',
    },
    {
        year: '2026',
        eyebrow: 'Chapter V · In Between',
        title: 'Somewhere In Between',
        copy: 'Still, one thing hasn’t changed: I know I’m capable of more. I don’t see myself as average, even when my actions make it look that way. The skills, ideas and awareness are here — I’m just working on consistency and direction. Not the start, not the end; somewhere in between, slowly getting there in my own way — building this island as I go.',
    },
]

export class LinearJourney
{
    constructor()
    {
        this.game = Game.getInstance()
        this.active = true

        this.route = {
            points: JOURNEY_PATH_POINTS,
            segments: [],
            totalLength: 0,
            distance: 0,
        }

        for(let i = 0; i < this.route.points.length - 1; i++)
        {
            const start = this.route.points[i]
            const end = this.route.points[i + 1]
            const deltaX = end.x - start.x
            const deltaZ = end.z - start.z
            const length = Math.hypot(deltaX, deltaZ)
            const startDistance = this.route.totalLength

            this.route.segments.push({
                start,
                end,
                deltaX,
                deltaZ,
                directionX: deltaX / length,
                directionZ: deltaZ / length,
                length,
                lengthSquared: length * length,
                startDistance,
                endDistance: startDistance + length,
                yaw: Math.atan2(-deltaZ, deltaX),
            })

            this.route.totalLength += length
        }

        this.route.timelineLength = this.route.segments[JOURNEY_TIMELINE_END_INDEX - 1].endDistance
        this.routePosition = {
            segment: this.route.segments[0],
            x: this.route.points[0].x,
            z: this.route.points[0].z,
        }
        this.guidedSpeed = 0
        this.currentRotation = new Quaternion()
        this.targetRotation = new Quaternion()
        this.upAxis = new Vector3(0, 1, 0)

        this.currentIndex = -1
        this.cardTimeout = null
        this.pointerDirection = 0
        this.ready = false
        this.ending = {
            active: false,
            exiting: false,
            pauseRemaining: 0,
            redirectTimeout: null,
        }

        this.setElements()
        this.setPointerControls()
        this.setGuidedCollisionProfile()

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePrePhysics()
        }, 1)

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 7)

        this.updateMilestone(0)
    }

    setGuidedCollisionProfile()
    {
        // World props are created just after the journey controller. Once they
        // exist, turn only the objects close to the authored route into
        // non-blocking sensors. The terrain and wooden bridges stay physical,
        // preserving the suspension and elevation changes.
        this.game.ticker.wait(2, () =>
        {
            const clearanceSquared = 3.75 * 3.75
            const supportName = /bridge|road|floor|terrain/i
            const chassisBody = this.game.physicalVehicle.chassis.physical.body

            for(const object of this.game.objects.list.values())
            {
                if(!object.physical || object.physical.body === chassisBody)
                    continue

                const body = object.physical.body
                const visualName = object.visual?.object3D?.name || ''
                const position = body.translation()

                if(
                    supportName.test(visualName) ||
                    getJourneyPathDistanceSquared(position.x, position.z) > clearanceSquared
                )
                    continue

                for(const collider of object.physical.colliders)
                    collider.setSensor(true)
            }
        })
    }

    setElements()
    {
        this.element = document.querySelector('.js-linear-journey')
        this.yearElement = this.element.querySelector('.js-linear-journey-year')
        this.eyebrowElement = this.element.querySelector('.js-linear-journey-eyebrow')
        this.titleElement = this.element.querySelector('.js-linear-journey-title')
        this.copyElement = this.element.querySelector('.js-linear-journey-copy')
        this.counterElement = this.element.querySelector('.js-linear-journey-counter')
        this.progressElement = this.element.querySelector('.js-linear-journey-progress')
        this.dots = [ ...this.element.querySelectorAll('.js-linear-journey-dot') ]

        const audioButton = this.element.querySelector('.js-linear-journey-audio')
        audioButton.addEventListener('click', () =>
        {
            this.game.audio.mute.toggle()
        })

        const updateAudioButton = () =>
        {
            const muted = this.game.audio.mute.active
            audioButton.classList.toggle('is-muted', muted)
            audioButton.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off')
            audioButton.querySelector('span').textContent = muted ? 'Sound off' : 'Sound on'
        }

        this.game.audio.events.on('muteChange', updateAudioButton)
        updateAudioButton()
    }

    setPointerControls()
    {
        const buttons = [ ...this.element.querySelectorAll('.js-linear-journey-drive') ]

        const stop = () =>
        {
            this.pointerDirection = 0
        }

        for(const button of buttons)
        {
            const direction = parseFloat(button.dataset.direction)

            button.addEventListener('pointerdown', (event) =>
            {
                event.preventDefault()
                button.setPointerCapture(event.pointerId)
                this.pointerDirection = direction
                button.classList.add('is-active')
            })

            button.addEventListener('pointerup', () =>
            {
                button.classList.remove('is-active')
                stop()
            })

            button.addEventListener('pointercancel', () =>
            {
                button.classList.remove('is-active')
                stop()
            })
        }

        window.addEventListener('blur', stop)
    }

    updatePrePhysics()
    {
        if(
            !this.ending.active &&
            this.pointerDirection !== 0 &&
            this.game.player.state === this.game.player.constructor.STATE_DEFAULT
        )
            this.game.player.accelerating = this.pointerDirection

        const body = this.game.physicalVehicle.chassis.physical.body
        const position = body.translation()
        const velocity = body.linvel()
        const delta = Math.min(this.game.ticker.deltaScaled, 1 / 30)
        if(!this.ending.active && this.route.distance >= this.route.timelineLength)
            this.startPortalSequence()

        if(this.ending.active && this.ending.pauseRemaining > 0)
            this.ending.pauseRemaining = Math.max(0, this.ending.pauseRemaining - delta)

        const inputDirection = this.ending.active
            ? (this.ending.pauseRemaining > 0 ? 0 : 1)
            : (this.pointerDirection || this.game.player.accelerating)
        const targetSpeed = this.ending.active
            ? inputDirection * 2.35
            : inputDirection * 3.15
        const response = inputDirection === 0 ? 3.8 : 7

        // The wheels, suspension and scenery remain physical, while horizontal
        // travel is guided by distance along this authored route. This makes
        // the narrow wooden bridge reliable without turning the scene into a
        // non-interactive cut-scene.
        this.guidedSpeed += (targetSpeed - this.guidedSpeed) * Math.min(delta * response, 1)
        this.route.distance = clamp(
            this.route.distance + this.guidedSpeed * delta,
            0,
            this.route.totalLength
        )

        const routePosition = this.getRoutePosition(this.route.distance)
        const segment = routePosition.segment
        const atStart = this.route.distance <= 0.001 && this.guidedSpeed < 0
        const atEnd = this.route.distance >= this.route.totalLength - 0.001 && this.guidedSpeed > 0

        if(atStart || atEnd)
            this.guidedSpeed = 0

        if(atEnd && this.ending.active)
            this.finishPortalSequence()

        body.setTranslation({
            x: routePosition.x,
            y: position.y,
            z: routePosition.z,
        }, true)

        body.setLinvel({
            x: segment.directionX * this.guidedSpeed,
            y: clamp(velocity.y, - 3, 3),
            z: segment.directionZ * this.guidedSpeed,
        }, true)

        this.currentRotation.copy(body.rotation())
        this.targetRotation.setFromAxisAngle(this.upAxis, segment.yaw)
        this.currentRotation.slerp(this.targetRotation, Math.min(delta * 12, 1))
        body.setRotation(this.currentRotation, true)
        body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    }

    update()
    {
        if(!this.ready && this.game.world.intro === null)
        {
            this.ready = true
            document.documentElement.classList.add('linear-journey-ready')
        }

        const progress = clamp(this.route.distance / this.route.timelineLength, 0, 1)

        this.progressElement.style.transform = `scaleX(${progress})`
        this.element.style.setProperty('--linear-journey-progress', progress)

        const index = Math.min(
            MILESTONES.length - 1,
            Math.floor(progress * MILESTONES.length)
        )

        if(index !== this.currentIndex)
            this.updateMilestone(index)
    }

    updateMilestone(index)
    {
        this.currentIndex = index
        const milestone = MILESTONES[index]

        this.element.classList.remove('is-card-visible')

        if(this.cardTimeout !== null)
            window.clearTimeout(this.cardTimeout)

        this.cardTimeout = window.setTimeout(() =>
        {
            this.yearElement.textContent = milestone.year
            this.eyebrowElement.textContent = milestone.eyebrow
            this.titleElement.textContent = milestone.title
            this.copyElement.textContent = milestone.copy
            this.counterElement.textContent = `${String(index + 1).padStart(2, '0')} / ${String(MILESTONES.length).padStart(2, '0')}`

            for(let i = 0; i < this.dots.length; i++)
            {
                this.dots[i].classList.toggle('is-current', i === index)
                this.dots[i].classList.toggle('is-passed', i < index)
            }

            const careerYear = this.game.world.areas?.career?.year
            if(careerYear)
            {
                careerYear.current = parseInt(milestone.year)
                careerYear.updateDigits(careerYear.current)
            }

            this.element.classList.add('is-card-visible')
            this.cardTimeout = null
        }, 170)
    }

    startPortalSequence()
    {
        this.ending.active = true
        this.ending.pauseRemaining = 1.15
        this.pointerDirection = 0
        this.element.classList.add('is-portal-bound')

        const altar = this.game.world.areas?.altar
        altar?.animateBeam?.()
        altar?.animateBeamParticles?.()
    }

    finishPortalSequence()
    {
        if(this.ending.exiting)
            return

        this.ending.exiting = true
        document.documentElement.classList.add('linear-journey-exiting')

        this.ending.redirectTimeout = window.setTimeout(() =>
        {
            window.location.assign('/')
        }, 950)
    }

    getRoutePosition(distance)
    {
        let segment = this.route.segments[this.route.segments.length - 1]

        for(const candidate of this.route.segments)
        {
            if(distance <= candidate.endDistance)
            {
                segment = candidate
                break
            }
        }

        const t = clamp(
            (distance - segment.startDistance) / segment.length,
            0,
            1
        )

        this.routePosition.segment = segment
        this.routePosition.x = segment.start.x + segment.deltaX * t
        this.routePosition.z = segment.start.z + segment.deltaZ * t

        return this.routePosition
    }
}
