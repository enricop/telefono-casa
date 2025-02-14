import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_POLLING_INTERVAL = 5000

const timefmt = new Intl.DateTimeFormat('en-US', {
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
})

export function useInterval(callback: () => any, delay: number) {
	const savedCallback = useRef<() => any | undefined>()

	// Remember the latest callback.
	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	// Set up the interval.
	useEffect(() => {
		const tick = () => {
			if (savedCallback.current) {
				savedCallback.current()
			}
		}
		if (delay !== null) {
			const id = setInterval(tick, delay)
			return () => clearInterval(id)
		}
	}, [delay])
}

// Note: doesn't get updated when the callback function changes
export function usePolling(
	callback: (abortSignal: AbortSignal) => any,
	interval = DEFAULT_POLLING_INTERVAL,
) {
	const abortControllerRef = useRef(new AbortController())
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

	useEffect(() => {
		callback(abortControllerRef.current.signal)
		setLastUpdated(new Date())

		return () => {
			abortControllerRef.current.abort()
		}
	}, [])

	const intervalFn = useCallback(() => {
		if (document.hasFocus()) {
			callback(abortControllerRef.current.signal)
			setLastUpdated(new Date())
		}
	}, [])

	useInterval(intervalFn, interval)

	return lastUpdated ? timefmt.format(lastUpdated) : ''
}

export default usePolling;
