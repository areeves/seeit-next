import { useState, useEffect } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedValue = localStorage.getItem(key)
            return storedValue ? JSON.parse(storedValue) : initialValue
        }
        return initialValue
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(value))
        }
    }, [key, value])

    return [value, setValue]
}

export default useLocalStorage

