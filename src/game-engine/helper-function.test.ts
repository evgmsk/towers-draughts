// import {describe, expect, test} from '@jest/globals';
import { equalArrays, includesArray } from './gameplay-helper-functions'

describe('testing game helper function', () => {
    test('test compare array function', () => {
        const arr1 = ['a1, a2', 'a3']
        const arr2 = ['a1, a2', 'a3']
        const arr3 = ['a1, a2', 'a4']
        expect(equalArrays(arr1, arr2)).toBe(true)
        expect(equalArrays(arr1, arr3)).toBe(false)
    })
    test('includes array function', () => {
        const arr1 = [['q'], ['d'], ['f']]
        const arr2 = ['q']
        const arr3 = ['g']
        expect(includesArray(arr1, arr2)).toBe(true)
        expect(includesArray(arr1, arr3)).toBe(false)
    })
})
