import { GameVariants } from "../../store/app-interface"

export const getDebutes = (gv: GameVariants) => Debutes[gv]

export const FirstMoves: {[key:string]: string[]} = {
    international: ['d4-e5', 'd4-e5', 'd4-e5',  'd4-c5',  'd4-c5',  'h4-g5',  'h4-i5'],
    russian: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4',],
    towers: ['c3-d4', 'c3-d4', 'c3-d4', 'c3-b4', 'c3-b4', 'e3-f4', 'a3-b4', ]
}

const Debutes: {[key: string]: {[key: string]: any}} = {
    russian: {
        'c3-d4_f6-g5_g3-h4': {
            name: 'attack g5', 
            moves: ['c3-d4', 'f6-g5', 'g3-h4'], 
            continue: {}
        },
        'c3-d4_f6-e5_d4:f6_g7:e5_a3-b4': {
            name: 'subversive beginnig',
            moves: ['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5', 'a3-b4'],
            continue: {}
        },
        'c3-d4_d6-e5_g3-f4': {
            name: 'fork', 
            moves: ['c3-d4', 'd6-e5', 'g3-f4'],
            continue: {}
        },
        'c3-d4_d6-c5_b2-c3_f6-g5_c3-b4_g7-f6_b4:d6_e7:c5': {
            name: 'town game with g7-f6',
            moves: ['c3-d4', 'd6-c5', 'b2-c3', 'f6-g5', 'c3-b4', 'g7-f6', 'b4:d6', 'e7:c5']
        },
        'c3-d4_d6-c5_b2-c3_f6-g5_c3-b4_b6-a5': {
            name: 'town game with b6-a5',
            moves: ['c3-d4', 'd6-c5', 'b2-c3', 'f6-g5', 'c3-b4', 'b6-a5']
        },
        'c3-d4_d6-c5_d2-c3_f6-g5_c3-b4_g5-h4': {
            name: 'town game with d2-c3',
            moves: ['c3-d4', 'd6-c5', 'd2-c3', 'f6-g5', 'c3-b4', 'g5-h4']
        },
        'c3-d4_d6-c5_b2-c3_f6-g5_c3-b4_g5-f4': {
            name: 'town game with g5-f4',
            moves: ['c3-d4', 'd6-c5', 'b2-c3', 'f6-g5', 'c3-b4', 'g5-f4']
        },
        'a3-b4_h6-g5_g3-h4_g5-f4': {
            name: 'double pole',
            moves: ['a3-b4', 'h6-g5', 'g3-h4', 'g5-f4']
        },
        'c3-d4_f6-g5_d4-c5_d6:b4_a3:c5_b6:d4_e3:c5_g5-f4_g3:f5_c7-b6': {
            name: 'kukuev gambit d4',
            moves: ['c3-d4', 'f6-g5', 'd4-c5', 'd6:b4', 'a3:c5', 'b6:d4', 'e3:c5', 'g5-f4', 'g3:f5', 'c7-b6']
        },
        'c3-b4_f6-g5_b4-c5_d6:b4_a3:c5_b6:d4_e3:c5_g5-f4_g3:f5_c7-b6': {
            name: 'kukuev gambit b4',
            moves: ['c3-d4', 'f6-g5', 'd4-c5', 'd6:b4', 'a3:c5', 'b6:d4', 'e3:c5', 'g5-f4', 'g3:f5', 'c7-b6']
        },
    }
}
