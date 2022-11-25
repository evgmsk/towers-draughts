;(this['webpackJsonptowers-draughts-client'] =
    this['webpackJsonptowers-draughts-client'] || []).push([
    [0],
    {
        77: function (e, n, t) {
            'use strict'
            t.d(n, 'b', function () {
                return r
            }),
                t.d(n, 'i', function () {
                    return o
                }),
                t.d(n, 'h', function () {
                    return i
                }),
                t.d(n, 'c', function () {
                    return s
                }),
                t.d(n, 'j', function () {
                    return c
                }),
                t.d(n, 'e', function () {
                    return l
                }),
                t.d(n, 'f', function () {
                    return u
                }),
                t.d(n, 'a', function () {
                    return v
                }),
                t.d(n, 'd', function () {
                    return h
                }),
                t.d(n, 'g', function () {
                    return d
                })
            var a = t(10)

            function r() {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : null
                return { type: a.a.CLEAR_HISTORY, payload: e }
            }

            function o(e) {
                return { type: a.a.SURRENDER, payload: e }
            }

            function i(e) {
                return { type: a.a.SET_GAME_MODE, payload: e }
            }

            function s(e) {
                return { type: a.a.CONFIRM_START_GAME, payload: e }
            }

            function c(e) {
                return { type: a.a.INEFFECTIVE_MOVE, payload: e }
            }

            function l(e) {
                return { type: a.a.END_GAME, payload: e }
            }

            function u(e) {
                return { type: a.a.MAKE_MOVE, payload: e }
            }

            function v() {
                return { type: a.a.CANCEL_GAME }
            }

            function h(e) {
                return { type: a.a.DECLINE_DRAW, payload: e }
            }

            function d() {
                return { type: a.a.OFFER_DRAW }
            }
        },
        78: function (e, n, t) {
            'use strict'
            t.d(n, 'i', function () {
                return r
            }),
                t.d(n, 'e', function () {
                    return o
                }),
                t.d(n, 'm', function () {
                    return i
                }),
                t.d(n, 'c', function () {
                    return s
                }),
                t.d(n, 'h', function () {
                    return c
                }),
                t.d(n, 'l', function () {
                    return l
                }),
                t.d(n, 'g', function () {
                    return u
                }),
                t.d(n, 'k', function () {
                    return v
                }),
                t.d(n, 'f', function () {
                    return h
                }),
                t.d(n, 'd', function () {
                    return d
                }),
                t.d(n, 'b', function () {
                    return m
                }),
                t.d(n, 'a', function () {
                    return f
                }),
                t.d(n, 'j', function () {
                    return g
                })
            var a = t(11)

            function r() {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : null
                return { type: a.a.SET_START_POSITION, payload: e }
            }

            function o(e) {
                return { type: a.a.MAKE_NEW_MOVE, payload: e }
            }

            function i(e) {
                return { type: a.a.UPDATE_ANALYSIS_STATE, payload: e }
            }

            function s(e) {
                return { type: a.a.EVALUATE_POSITION, paylaod: e }
            }

            function c(e) {
                return { type: a.a.SET_DEPTH, paylaod: e }
            }

            function l() {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : 0
                return { type: a.a.STEP_FORWARD, payload: e }
            }

            function u(e) {
                return { type: a.a.REMOVE_PIECE, payload: e }
            }

            function v() {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : 0
                return { type: a.a.STEP_BACK, payload: e }
            }

            function h() {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : null
                return { type: a.a.PLAY_MOVES, payload: e }
            }

            function d(e) {
                return { type: a.a.GO_TO_POSITION, payload: e }
            }

            function m(e) {
                return { type: a.a.DOWNLOAD_GAME, payload: e }
            }

            function f(e) {
                return { type: a.a.ANALYZE_LAST_GAME, payload: e }
            }

            function g(e) {
                return { type: a.a.SETTING_BOARD, payload: e }
            }
        },
        79: function (e, n, t) {
            'use strict'
            t.d(n, 'c', function () {
                return r
            }),
                t.d(n, 'a', function () {
                    return o
                }),
                t.d(n, 'b', function () {
                    return i
                })
            var a = t(13)

            function r(e) {
                return { type: a.a.UPDATE_BOARD_STATE, payload: e }
            }

            function o(e) {
                return { type: a.a.TURN, payload: e }
            }

            function i() {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : null
                return { type: a.a.UNDO_LAST_MOVE, payload: e }
            }
        },
        80: function (e, n, t) {
            'use strict'
            t.d(n, 'a', function () {
                return r
            })
            t(3), t(86)
            var a = t(4),
                r = function (e) {
                    var n = 'side-bar_'.concat(e.side)
                    return Object(a.jsx)('div', {
                        className: n,
                        children: e.children,
                    })
                }
        },
        81: function (e, n, t) {
            'use strict'
            t.d(n, 'a', function () {
                return h
            })
            var a = t(3),
                r = t.n(a),
                o = t(31),
                i = t(18),
                s = t(9),
                c = t(78),
                l = (t(88), t(4)),
                u = {
                    analyzeLastGame: c.a,
                    stepBack: c.k,
                    stepForward: c.l,
                    goToPosition: c.d,
                    playMoves: c.f,
                },
                v = Object(o.b)(function (e) {
                    return {
                        movesHistory: e.game.history,
                        gameMode: e.game.gameMode,
                        movesMainLine: e.analyze.movesMainLine,
                        lastMove: e.analyze.lastMove,
                        analyzingLastGame: e.analyze.analyzePosition,
                    }
                }, u),
                h = r.a.memo(
                    v(function (e) {
                        var n = r.a.createRef(),
                            t = e.movesHistory,
                            o = e.gameMode,
                            c = e.lastMove,
                            u = e.movesMainLine,
                            v = e.analyzeLastGame,
                            h = e.analyzingLastGame,
                            d = e.stepBack,
                            m = e.stepForward,
                            f = e.goToPosition,
                            g = e.playMoves
                        Object(a.useEffect)(
                            function () {
                                !(function () {
                                    var e = n.current
                                    e && e.scroll(0, e.scrollHeight)
                                })()
                            },
                            [t, n]
                        )
                        var b = Object(i.f)(),
                            p = 'isPlaying' === o ? t : u,
                            y = null === p || void 0 === p ? void 0 : p.length,
                            j = Object(s.d)(p),
                            w = function (e, n) {
                                e.preventDefault(),
                                    'isPlaying' !== o &&
                                        ('/game' === b.location.pathname &&
                                            b.push('/analysis'),
                                        f({
                                            index: n,
                                            move: p[n],
                                        }))
                            },
                            M = c.index,
                            O = 'moves-history-menu__item to-start'.concat(
                                M < 0 ? ' disabled' : ''
                            ),
                            T = 'moves-history-menu__item step-back'.concat(
                                M ? '' : ' disabled'
                            ),
                            B = 'moves-history-menu__item step-forward'.concat(
                                M >= y - 1 ? ' disabled' : ''
                            ),
                            _ = 'moves-history-menu__item to-end'.concat(
                                M >= y - 1 ? ' disabled' : ''
                            )
                        return Object(l.jsxs)('div', {
                            className: 'moves-history-wrapper',
                            children: [
                                Object(l.jsx)('div', {
                                    className: 'moves-history-menu',
                                    children:
                                        'isPlaying' !== o && h
                                            ? Object(l.jsxs)('ul', {
                                                  onClick: function (e) {
                                                      e.preventDefault()
                                                      var n = e.target.classList
                                                      if (
                                                          !n.contains(
                                                              'disabled'
                                                          )
                                                      )
                                                          switch (
                                                              ('/game' ===
                                                                  b.location
                                                                      .pathname &&
                                                                  b.push(
                                                                      '/analysis'
                                                                  ),
                                                              h || v(!0),
                                                              !0)
                                                          ) {
                                                              case n.contains(
                                                                  'to-start'
                                                              ):
                                                                  f({
                                                                      index: -1,
                                                                      move: '',
                                                                  })
                                                                  break
                                                              case n.contains(
                                                                  'step-back'
                                                              ):
                                                                  return d()
                                                              case n.contains(
                                                                  'step-forward'
                                                              ):
                                                                  return m()
                                                              case n.contains(
                                                                  'to-end'
                                                              ):
                                                                  return f({
                                                                      index:
                                                                          y - 1,
                                                                      move: p.slice(
                                                                          -1
                                                                      )[0],
                                                                  })
                                                              case n.contains(
                                                                  'play-moves'
                                                              ):
                                                                  return g()
                                                          }
                                                  },
                                                  children: [
                                                      Object(l.jsx)('li', {
                                                          className: O,
                                                          children: Object(
                                                              l.jsx
                                                          )('i', {
                                                              className:
                                                                  'material-icons',
                                                              children:
                                                                  'first_page',
                                                          }),
                                                      }),
                                                      Object(l.jsx)('li', {
                                                          className: T,
                                                          children: Object(
                                                              l.jsx
                                                          )('i', {
                                                              className:
                                                                  'material-icons',
                                                              children:
                                                                  'chevron_left',
                                                          }),
                                                      }),
                                                      Object(l.jsx)('li', {
                                                          className:
                                                              'moves-history-menu__item play-moves',
                                                          children: Object(
                                                              l.jsx
                                                          )('i', {
                                                              className:
                                                                  'material-icons',
                                                              children:
                                                                  'slideshow',
                                                          }),
                                                      }),
                                                      Object(l.jsx)('li', {
                                                          className: B,
                                                          children: Object(
                                                              l.jsx
                                                          )('i', {
                                                              className:
                                                                  'material-icons',
                                                              children:
                                                                  'chevron_right',
                                                          }),
                                                      }),
                                                      Object(l.jsx)('li', {
                                                          className: _,
                                                          children: Object(
                                                              l.jsx
                                                          )('i', {
                                                              className:
                                                                  'material-icons',
                                                              children:
                                                                  'last_page',
                                                          }),
                                                      }),
                                                  ],
                                              })
                                            : Object(l.jsx)('p', {
                                                  children: 'moves:',
                                              }),
                                }),
                                Object(l.jsx)('div', {
                                    className: 'moves-container',
                                    ref: n,
                                    children: j.map(function (e, n) {
                                        var t =
                                                (h ? M : p.length - 1) ===
                                                2 * n,
                                            a =
                                                (h ? M : p.length - 1) ===
                                                2 * n + 1,
                                            r = 'white-rivalMove'.concat(
                                                t ? ' current-rivalMove' : ''
                                            ),
                                            o = 'black-rivalMove'.concat(
                                                a ? ' current-rivalMove' : ''
                                            )
                                        return Object(l.jsxs)(
                                            'div',
                                            {
                                                className: 'rivalMove-wrapper',
                                                children: [
                                                    Object(l.jsx)('div', {
                                                        className:
                                                            'rivalMove-number',
                                                        children: n + 1,
                                                    }),
                                                    Object(l.jsxs)('div', {
                                                        className: 'move',
                                                        children: [
                                                            Object(l.jsx)(
                                                                'div',
                                                                {
                                                                    className:
                                                                        r,
                                                                    onClick:
                                                                        function (
                                                                            e
                                                                        ) {
                                                                            return w(
                                                                                e,
                                                                                2 *
                                                                                    n
                                                                            )
                                                                        },
                                                                    children:
                                                                        e.white,
                                                                }
                                                            ),
                                                            Object(l.jsx)(
                                                                'div',
                                                                {
                                                                    className:
                                                                        o,
                                                                    onClick:
                                                                        function (
                                                                            e
                                                                        ) {
                                                                            return w(
                                                                                e,
                                                                                2 *
                                                                                    n +
                                                                                    1
                                                                            )
                                                                        },
                                                                    children:
                                                                        e.black,
                                                                }
                                                            ),
                                                        ],
                                                    }),
                                                ],
                                            },
                                            n
                                        )
                                    }),
                                }),
                            ],
                        })
                    })
                )
        },
        82: function (e, n, t) {
            'use strict'
            var a = t(0),
                r = t(23),
                o = t(28),
                i = t(30),
                s = t(29),
                c = t(3),
                l = t.n(c),
                u = t(31),
                v = t(7),
                h = t(6),
                d = (t(89), t(4)),
                m = function (e) {
                    var n = e.w,
                        t = e.b,
                        a = e.colorW,
                        r = e.king
                    if (!e.towers) {
                        var o = ''
                            .concat(a ? 'white-checker' : 'black-checker')
                            .concat(r ? ' king' : '')
                        return Object(d.jsx)('div', {
                            className: o,
                            children:
                                r &&
                                Object(d.jsx)('span', {
                                    className: 'king-mark',
                                    children: 'K',
                                }),
                        })
                    }
                    var i = new Array(t).fill(0),
                        s = new Array(n).fill(1),
                        c = a ? s.concat(i) : i.concat(s),
                        l = Math.floor(c.length / 2),
                        u = a
                            ? Object(d.jsxs)('p', {
                                  className: 'numbers-on-hover',
                                  children: [
                                      Object(d.jsx)('span', {
                                          className: 'white-top',
                                          children: n,
                                      }),
                                      Object(d.jsx)('span', {
                                          className: 'black-down',
                                          children: t,
                                      }),
                                  ],
                              })
                            : Object(d.jsxs)('p', {
                                  className: 'numbers-on-hover',
                                  children: [
                                      Object(d.jsx)('span', {
                                          className: 'black-top',
                                          children: t,
                                      }),
                                      Object(d.jsx)('span', {
                                          className: 'white-down',
                                          children: n,
                                      }),
                                  ],
                              }),
                        v = c.map(function (e, n) {
                            var t = Math.abs(n - l),
                                a = e ? 'white-piece' : 'black-piece',
                                o = n <= l ? 'up'.concat(t) : 'down'.concat(t),
                                i = r && !n ? ' king' : '',
                                s = ''.concat(a, ' ').concat(o).concat(i)
                            return Object(d.jsx)(
                                'div',
                                {
                                    className: s,
                                    children: Object(d.jsx)('span', {
                                        className: 'king-mark',
                                        children: r && !n ? 'K' : null,
                                    }),
                                },
                                n
                            )
                        })
                    return Object(d.jsxs)('div', {
                        className: 'tower-wrapper',
                        children: [v, u],
                    })
                },
                f = function (e) {
                    var n = e.w,
                        t = e.b,
                        a = e.colorW,
                        r = e.king,
                        o = a ? n : t,
                        i = a ? t : n,
                        s = 'checker-tower__quantity'.concat(
                            r ? ' with-crown' : ''
                        )
                    return Object(d.jsxs)('div', {
                        className: s,
                        children: [
                            Object(d.jsx)('span', { children: o }),
                            '\xa0/\xa0',
                            Object(d.jsx)('span', { children: i }),
                        ],
                    })
                },
                g = Object(u.b)(function (e) {
                    return {
                        towers: 'towers' === e.gameOptions.gameVariant,
                        bs: e.boardOptions.boardSize,
                    }
                }, {}),
                b = (function (e) {
                    Object(i.a)(t, e)
                    var n = Object(s.a)(t)

                    function t() {
                        return Object(r.a)(this, t), n.apply(this, arguments)
                    }

                    return (
                        Object(o.a)(t, [
                            {
                                key: 'shouldComponentUpdate',
                                value: function (e) {
                                    return (
                                        JSON.stringify(e) !==
                                        JSON.stringify(this.props)
                                    )
                                },
                            },
                            {
                                key: 'componentDidUpdate',
                                value: function () {},
                            },
                            {
                                key: 'render',
                                value: function () {
                                    var e = this.props,
                                        n = e.positionInDOM,
                                        t = e.currentColor,
                                        r = e.currentType,
                                        o = e.veiw,
                                        i = e.wPiecesQuantity,
                                        s = e.bPiecesQuantity,
                                        c = e.onBoardPosition,
                                        l = this.props.mandatory,
                                        u = this.props.bs,
                                        g = this.props.towers,
                                        b = n,
                                        p = b.x,
                                        y = b.y,
                                        j = 'checker-tower '
                                            .concat(r, ' ')
                                            .concat(t, ' ')
                                            .concat(o, ' board-')
                                            .concat(u)
                                            .concat(l ? ' mandatory-tower' : '')
                                            .concat(
                                                g ? ' towers' : ' classic',
                                                ' ratio-'
                                            )
                                            .concat(10 * v.d),
                                        w = {
                                            top: ''.concat(y, 'px'),
                                            left: ''.concat(p, 'px'),
                                        },
                                        M = i + s > 1 && 'face' !== o,
                                        O = {
                                            w: i,
                                            b: s,
                                            colorW: t === h.b.w,
                                            king: r === h.d.k,
                                            towers: g,
                                        }
                                    return Object(d.jsx)('div', {
                                        className: j,
                                        'data-indexes': c,
                                        style: w,
                                        children: M
                                            ? Object(d.jsx)(
                                                  f,
                                                  Object(a.a)({}, O)
                                              )
                                            : Object(d.jsx)(
                                                  m,
                                                  Object(a.a)({}, O)
                                              ),
                                    })
                                },
                            },
                        ]),
                        t
                    )
                })(l.a.Component)
            n.a = g(b)
        },
        83: function (e, n, t) {
            'use strict'
            t.d(n, 'a', function () {
                return s
            })
            t(3)
            var a = t(6),
                r = t(7),
                o = (t(90), t(4)),
                i = function (e) {
                    return Object(o.jsx)('div', {
                        className: e.className,
                        'data-indexes': e.indexes,
                        children: e.children,
                    })
                },
                s = function (e) {
                    var n = e.boardOptions,
                        t = n.boardSize,
                        s = n.boardNotation,
                        c = n.reversedBoard,
                        l = e.lastMove,
                        u = e.posibleMoves,
                        v = void 0 === u ? new Map() : u,
                        h = r.l.slice(0, t),
                        d = r.j.slice(0, t),
                        m = c ? d : d.reverse(),
                        f = c ? h.reverse() : h,
                        g = c ? 51 : 0,
                        b = m.map(function (e, n) {
                            return f.map(function (t, r) {
                                g = c
                                    ? (n + r) % 2
                                        ? g - 1
                                        : g
                                    : (n + r) % 2
                                    ? g + 1
                                    : g
                                var u = (n + r) % 2 ? 'dark' : 'light',
                                    h = ''.concat(t).concat(e),
                                    d = v.get(h) ? 'marked' : '',
                                    b = l.indexOf(h),
                                    p = b >= 0 ? 'highlighted'.concat(b) : '',
                                    y = 'board__cell '
                                        .concat(u, ' ')
                                        .concat(d, ' ')
                                        .concat(p)
                                        .trim()
                                return Object(o.jsxs)(
                                    i,
                                    {
                                        indexes: h,
                                        className: y,
                                        children: [
                                            s === a.a.i && (n + r) % 2
                                                ? Object(o.jsx)('span', {
                                                      className:
                                                          'board__cell-number',
                                                      children: g,
                                                  })
                                                : null,
                                            s !== a.a.r || r
                                                ? null
                                                : Object(o.jsx)('span', {
                                                      className:
                                                          'board__label-value ver',
                                                      children: m[n],
                                                  }),
                                            s === a.a.r && n + 1 === m.length
                                                ? Object(o.jsx)('span', {
                                                      className:
                                                          'board__label-value hor',
                                                      children: f[r],
                                                  })
                                                : null,
                                        ],
                                    },
                                    n + '-' + r
                                )
                            })
                        })
                    return Object(o.jsx)('div', {
                        className: 'board__body',
                        children: b,
                    })
                }
        },
        84: function (e, n, t) {
            'use strict'
            var a = t(85),
                r = t(0),
                o = t(20),
                i = t(23),
                s = t(6),
                c = t(9),
                l = t(42),
                u = ['branchValue'],
                v = {
                    international: [
                        'd4-e5',
                        'd4-e5',
                        'd4-e5',
                        'd4-c5',
                        'd4-c5',
                        'h4-g5',
                        'h4-i5',
                    ],
                    russian: [
                        'c3-d4',
                        'c3-d4',
                        'c3-d4',
                        'c3-b4',
                        'c3-b4',
                        'e3-f4',
                        'a3-b4',
                    ],
                    towers: [
                        'c3-d4',
                        'c3-d4',
                        'c3-d4',
                        'c3-b4',
                        'c3-b4',
                        'e3-f4',
                        'a3-b4',
                    ],
                },
                h = new (function e() {
                    var n = this
                    Object(i.a)(this, e),
                        (this.GV = l.a.GV),
                        (this.mmr = l.a),
                        (this.engineTowers = 0),
                        (this.rivalTowers = 0),
                        (this.engineKings = 0),
                        (this.enginePieces = 0),
                        (this.rivalKings = 0),
                        (this.rivalPieces = 0),
                        (this.engineMoves = 0),
                        (this.rivalMoves = 0),
                        (this.color = s.b.w),
                        (this.setEvaluatingColor = function (e) {
                            n.color = e
                        }),
                        (this.handlePieces = function (e) {
                            var t = e.currentType,
                                a = e.currentColor,
                                r = n.rivalKings,
                                o = n.engineKings,
                                i = n.rivalPieces,
                                c = n.enginePieces
                            t === s.d.m
                                ? a === n.color
                                    ? (n.enginePieces = c + 1)
                                    : (n.rivalPieces = i + 1)
                                : a === n.color
                                ? (n.engineKings = o + 1)
                                : (n.rivalKings = r + 1)
                        }),
                        (this.bottomTowersValue = function (e, n) {
                            var t =
                                arguments.length > 2 &&
                                void 0 !== arguments[2] &&
                                arguments[2]
                            return t ? n * (0.2 / e) : n * (0.4 / e)
                        }),
                        (this.calcTowersFactor = function () {
                            return n.engineTowers - n.rivalTowers
                        }),
                        (this.handleTower = function (e) {
                            var t = e.currentColor,
                                a = e.currentType,
                                r = e.wPiecesQuantity,
                                o = void 0 === r ? 0 : r,
                                i = e.bPiecesQuantity,
                                c = void 0 === i ? 0 : i
                            n.color === s.b.w
                                ? a === s.d.m
                                    ? t === s.b.w
                                        ? ((n.engineTowers += o),
                                          (n.rivalTowers += n.bottomTowersValue(
                                              o,
                                              c
                                          )))
                                        : ((n.rivalTowers += c),
                                          (n.engineTowers +=
                                              n.bottomTowersValue(c, o)))
                                    : t === n.color
                                    ? ((n.engineTowers += o + 1),
                                      (n.rivalTowers += n.bottomTowersValue(
                                          o,
                                          c,
                                          !0
                                      )))
                                    : ((n.rivalTowers += c + 1),
                                      (n.engineTowers += n.bottomTowersValue(
                                          c,
                                          o,
                                          !0
                                      )))
                                : a === s.d.m
                                ? t === s.b.w
                                    ? ((n.rivalTowers += o),
                                      (n.engineTowers += n.bottomTowersValue(
                                          o,
                                          c
                                      )))
                                    : ((n.engineTowers += c),
                                      (n.rivalTowers += n.bottomTowersValue(
                                          c,
                                          o
                                      )))
                                : t === s.b.w
                                ? ((n.rivalTowers += o),
                                  (n.engineTowers += n.bottomTowersValue(
                                      o,
                                      c,
                                      !0
                                  )))
                                : ((n.engineTowers += c),
                                  (n.rivalTowers += n.bottomTowersValue(
                                      c,
                                      o,
                                      !0
                                  )))
                        }),
                        (this.setDefault = function () {
                            ;(n.engineTowers = 0),
                                (n.rivalTowers = 0),
                                (n.engineKings = 0),
                                (n.enginePieces = 0),
                                (n.rivalKings = 0),
                                (n.rivalPieces = 0),
                                (n.engineMoves = 0),
                                (n.rivalMoves = 0)
                        }),
                        (this.calcMoves = function (e, t, a) {
                            var r = n.engineMoves,
                                o = n.rivalMoves,
                                i = n.mmr.lookForTowerFreeMoves(e, t, a).length
                            a === n.color
                                ? (n.engineMoves = r + i)
                                : (n.rivalMoves = o + i)
                        }),
                        (this.getBoardData = function (e) {
                            Object.values(e).forEach(function (t) {
                                var a = t.tower,
                                    r = t.boardKey
                                if (a)
                                    if (
                                        (n.calcMoves(r, e, a.currentColor),
                                        'towers' === n.GV)
                                    ) {
                                        var o = a.wPiecesQuantity,
                                            i = void 0 === o ? 0 : o,
                                            s = a.bPiecesQuantity
                                        i + (void 0 === s ? 0 : s) === 1
                                            ? n.handlePieces(a)
                                            : n.handleTower(a)
                                    } else n.handlePieces(a)
                            })
                        }),
                        (this.calcMovesNumber = function (e, t) {
                            return n.mmr.lookForAllPosibleMoves(e, t).length
                        }),
                        (this.advantageInNumberOfMoves = function () {
                            var e = n.engineMoves,
                                t = n.rivalMoves
                            return (2 * (e - t)) / (e + t)
                        }),
                        (this.caclAdvantageInPieces = function () {
                            return 0.9 * (n.enginePieces - n.rivalPieces)
                        }),
                        (this.caclAdvantageInKings = function () {
                            var e = n.engineKings,
                                t = n.rivalKings
                            return e > t
                                ? (e / (t + 1)) * 2
                                : (-t / (e + 1)) * 2
                        }),
                        (this.checkIfkingsNumberChanged = function (e) {
                            return n.getBoardData(e), n.caclAdvantageInKings()
                        }),
                        (this.evaluateCurrentPosition = function (e) {
                            n.setDefault(), n.getBoardData(e)
                            var t = n.advantageInNumberOfMoves(),
                                a = n.caclAdvantageInPieces(),
                                r = n.caclAdvantageInKings()
                            return 'towers' !== n.GV
                                ? t + a + r
                                : t + a + r + n.calcTowersFactor()
                        })
                })(),
                d = new (function e() {
                    var n = this
                    Object(i.a)(this, e),
                        (this.maxDepth = 6),
                        (this.bestMoveCB = function () {}),
                        (this.bestLinesCB = function () {}),
                        (this.evaluator = h),
                        (this.moveBranchesTree = new Map()),
                        (this.actualHistoryString = ''),
                        (this.lastPlayerMove = ''),
                        (this.historyLength = 0),
                        (this.engineColor = s.b.w),
                        (this.lastResult = {}),
                        (this.fullPath = !1),
                        (this.evaluationStarted = !0),
                        (this.game = !0),
                        (this.resetProps = function (e) {
                            ;(n.bestMoveCB = e.bestMoveCB),
                                (n.maxDepth = e.maxDepth),
                                (n.engineColor = e.engineColor || s.b.w),
                                (n.game = !!e.game),
                                (n.moveBranchesTree = new Map()),
                                e.engineColor &&
                                    n.evaluator.setEvaluatingColor(
                                        e.engineColor
                                    ),
                                (n.moveBranchesTree = new Map()),
                                (n.actualHistoryString = ''),
                                (n.historyLength = 0),
                                (n.lastPlayerMove = ''),
                                (n.lastResult = {}),
                                console.log('engine reseted', e)
                        }),
                        (this.startEvaluation = function (e) {
                            n.evaluationStarted = e
                        }),
                        (this.setEngieneColor = function (e) {
                            ;(n.engineColor = e),
                                n.evaluator.setEvaluatingColor(e)
                        }),
                        (this.setDepth = function (e) {
                            n.maxDepth = e
                        }),
                        (this.makeMove = function (e, t) {
                            if (n.evaluationStarted) {
                                if (e.includes(':'))
                                    return l.a.makeMandatoryMove(
                                        e.split(':'),
                                        t
                                    )
                                var a = e.split('-'),
                                    r = Object(o.a)(a, 2),
                                    i = r[0],
                                    s = r[1]
                                return l.a.makeFreeMove(i, s, t)
                            }
                        }),
                        (this.debuteResolver = function (e) {
                            var t
                            if (n.historyLength) {
                                var a = l.a.lookForAllPosibleMoves(
                                    n.engineColor,
                                    e
                                )
                                t = a[Math.floor(Math.random() * a.length)]
                            } else {
                                var r = v[l.a.GV]
                                t = r[Math.floor(Math.random() * r.length)]
                            }
                            var i = t.split('-'),
                                s = Object(o.a)(i, 2),
                                c = s[0],
                                u = s[1],
                                h = {
                                    move: t,
                                    position: l.a.makeFreeMove(c, u, e),
                                }
                            n.bestMoveCB(h)
                        }),
                        (this.filterBranches = function () {
                            var e = n.moveBranchesTree,
                                t = n.actualHistoryString,
                                a = n.lastPlayerMove,
                                r = new Map()
                            e.forEach(function (e, o) {
                                if (o.startsWith(t)) {
                                    var i = t.length - a.length,
                                        s = o.slice(i)
                                    r.set(s, e)
                                }
                                n.moveBranchesTree = r
                            })
                        }),
                        (this.getAvaliableMoves = function (e, t) {
                            var a,
                                r =
                                    null === (a = n.moveBranchesTree.get(e)) ||
                                    void 0 === a
                                        ? void 0
                                        : a.moves
                            return (
                                r ||
                                    (r = l.a
                                        .lookForAllMoves(n.engineColor, t)
                                        .map(function (e) {
                                            return {
                                                move: e.move,
                                                branchValue: -100,
                                                position: e.position,
                                            }
                                        })),
                                r.length ? r : null
                            )
                        }),
                        (this.setActualMovesBranchAfterMove = function (e) {
                            var t = e.history,
                                a = e.cP
                            if (
                                (console.log(e),
                                (n.historyLength = t.length),
                                t.length < 2 && n.game)
                            )
                                return n.debuteResolver(a)
                            n.lastPlayerMove = t.slice(-1)[0] || 'sp'
                            var r = n.lastPlayerMove
                            ;(n.actualHistoryString =
                                n.historyLength > 1
                                    ? t.join('_')
                                    : n.lastPlayerMove),
                                n.moveBranchesTree.size && n.filterBranches()
                            var o = n.moveBranchesTree,
                                i = n.getAvaliableMoves(r, a),
                                s = o.get(r)
                            if (!i)
                                return n.bestMoveCB({ move: '', position: {} })
                            var c = n.evaluator.evaluateCurrentPosition(a)
                            if (
                                (s
                                    ? (console.log('look forward'),
                                      (r = n.lookForUnevaluatedForward(
                                          n.lastPlayerMove
                                      )))
                                    : ((s = {
                                          moves: i,
                                          board: a,
                                          engineMoveLast: !1,
                                          value: c,
                                          baseValue: c,
                                      }),
                                      n.moveBranchesTree.set(r, s),
                                      console.log(
                                          'new branch at',
                                          r,
                                          o.get(r)
                                      )),
                                r)
                            )
                                n.stepForward(r)
                            else if (s.value < -5)
                                n.bestMoveCB({
                                    move: 'surrender',
                                    position: {},
                                })
                            else {
                                var l = n.getBestForEngine(s.moves),
                                    u = l.move,
                                    v = l.position
                                n.bestMoveCB({ move: u, position: v })
                            }
                        }),
                        (this.handleNoMovesBranch = function (e, t, a, r) {
                            if (n.evaluationStarted) {
                                var o = t.engineMoveLast ? -50 : 50
                                if (
                                    (n.moveBranchesTree.set(e, t),
                                    n.moveBranchesTree.set(a, r),
                                    e !== n.lastPlayerMove)
                                )
                                    n.updateParentBranches(e.split('_'), o),
                                        (n.lastResult = {
                                            movesBranch: e,
                                            value: o,
                                        }),
                                        o > 0
                                            ? n.stepBackForUnevaluatedBranchPlayer(
                                                  e.split('_').slice(0, -1)
                                              )
                                            : n.stepBackForUnevaluatedBranchEngine(
                                                  e.split('_').slice(0, -1)
                                              )
                                else {
                                    var i =
                                            t.engineMoveLast ||
                                            t.pieceOrder === n.engineColor,
                                        s = n.getBestMove(t.moves, i),
                                        c = s.move,
                                        l = s.position
                                    n.bestMoveCB({ move: c, position: l })
                                }
                            }
                        }),
                        (this.stepForward = function (e) {
                            if (
                                n.evaluationStarted &&
                                n.moveBranchesTree.get(e)
                            ) {
                                var t = n.moveBranchesTree.get(e)
                                t || console.error('no branch', e)
                                var a = t,
                                    o = a.moves,
                                    i = a.engineMoveLast,
                                    s = i
                                        ? n.engineColor
                                        : Object(c.j)(n.engineColor),
                                    u = o.filter(function (e) {
                                        return 100 === Math.abs(e.branchValue)
                                    })[0],
                                    v = u.move,
                                    h = u.position,
                                    d = n.evaluator.evaluateCurrentPosition(h),
                                    m = ''.concat(e, '_').concat(v),
                                    f = l.a.lookForAllMoves(s, h),
                                    g = i ? -100 : 100,
                                    b = {
                                        moves: f.map(function (e) {
                                            return {
                                                move: e.move,
                                                branchValue: g,
                                                position: e.position,
                                            }
                                        }),
                                        board: h,
                                        engineMoveLast: !i,
                                        value: d,
                                        baseValue: d,
                                    }
                                if (!f.length)
                                    return n.handleNoMovesBranch(e, t, m, b)
                                if (
                                    ((t = Object(r.a)(
                                        Object(r.a)({}, t),
                                        {},
                                        {
                                            moves: o.map(function (e) {
                                                return e.move === v
                                                    ? Object(r.a)(
                                                          Object(r.a)({}, e),
                                                          {},
                                                          { branchValue: d }
                                                      )
                                                    : e
                                            }),
                                        }
                                    )),
                                    n.moveBranchesTree.set(e, t),
                                    n.moveBranchesTree.set(m, b),
                                    !i)
                                )
                                    if (m.split('_').length >= n.maxDepth)
                                        return n.lastLineEvaluation(m)
                                n.stepForward(m)
                            }
                        }),
                        (this.lookForUnevaluatedForward = function (e) {
                            var t = n.moveBranchesTree.get(e)
                            if (!t) return ''
                            var a = t,
                                r = a.moves,
                                o = a.engineMoveLast
                            return r.filter(function (e) {
                                return 100 === Math.abs(e.branchValue)
                            }).length && !o
                                ? (console.log(
                                      'unevaluated endPosition found',
                                      t
                                  ),
                                  e)
                                : r.length
                                ? n.lookForUnevaluatedForward(
                                      ''.concat(e, '_').concat(r[0].move)
                                  )
                                : ''
                        }),
                        (this.stepBackForUnevaluatedBranchPlayer = function (
                            e
                        ) {
                            var t = e.length,
                                a = e.join('_')
                            if (
                                n.evaluationStarted &&
                                n.moveBranchesTree.get(a)
                            ) {
                                var r = n.moveBranchesTree
                                    .get(a)
                                    .moves.filter(function (e) {
                                        return 100 === Math.abs(e.branchValue)
                                    })
                                2 === t
                                    ? r.length
                                        ? setTimeout(function () {
                                              return n.stepForward(a)
                                          }, 0)
                                        : n.handlePlayerBranchEvaluationEnd(e)
                                    : t > 2
                                    ? r.length
                                        ? t <= 4
                                            ? setTimeout(function () {
                                                  return n.stepForward(a)
                                              }, 0)
                                            : n.stepForward(a)
                                        : n.stepBackForUnevaluatedBranchPlayer(
                                              e.slice(0, -2)
                                          )
                                    : console.error(
                                          'something wrong with back step engine',
                                          e,
                                          t,
                                          n.moveBranchesTree
                                      )
                            }
                        }),
                        (this.handlePlayerBranchEvaluationEnd = function (e) {
                            var t = n.moveBranchesTree.get(n.lastPlayerMove)
                            if (n.evaluationStarted && t) {
                                if (
                                    !t.moves.filter(function (e) {
                                        return 100 === Math.abs(e.branchValue)
                                    }).length
                                ) {
                                    console.log('evaluation finished', t)
                                    var a = n.getBestForEngine(t.moves),
                                        r = a.move,
                                        o = a.position
                                    return n.bestMoveCB({
                                        move: r,
                                        position: o,
                                    })
                                }
                                setTimeout(function () {
                                    return n.stepForward(n.lastPlayerMove)
                                }, 0)
                            }
                        }),
                        (this.stepBackForUnevaluatedBranchEngine = function (
                            e
                        ) {
                            var t = e.length,
                                r = e.join('_'),
                                o = n.moveBranchesTree.get(r)
                            if (n.evaluationStarted && o) {
                                var i = o.moves,
                                    s = i.filter(function (e) {
                                        return 100 === Math.abs(e.branchValue)
                                    })
                                if (1 === t) {
                                    if (!s.length) {
                                        var c = n.getBestForEngine(o.moves),
                                            l =
                                                (c.branchValue,
                                                Object(a.a)(c, u))
                                        return (
                                            console.log(
                                                'evaluation engine rivalMove finished',
                                                i,
                                                n.moveBranchesTree
                                            ),
                                            n.bestMoveCB(l)
                                        )
                                    }
                                    setTimeout(function () {
                                        return n.stepForward(r)
                                    }, 0)
                                } else
                                    t > 1
                                        ? s.length
                                            ? t - n.historyLength <= 3
                                                ? setTimeout(function () {
                                                      return n.stepForward(r)
                                                  }, 0)
                                                : n.stepForward(r)
                                            : n.stepBackForUnevaluatedBranchEngine(
                                                  e.slice(0, -2)
                                              )
                                        : console.error(
                                              'something wrong with back step engine'
                                          )
                            }
                        }),
                        (this.handleCaseValueChangedNotably = function (e) {
                            var t = n.moveBranchesTree.get(e)
                            if (!n.evaluationStarted || !t) return !1
                            if (e === n.lastPlayerMove) return !1
                            var a = e.split('_'),
                                r = a.slice(0, -1).join('_'),
                                o = n.moveBranchesTree.get(r)
                            if (
                                Math.abs(t.value - o.value) < 0.5 &&
                                r.length > 3
                            )
                                return n.handleCaseValueChangedNotably(r)
                            if (r === n.lastPlayerMove) return !1
                            var i = a.slice(0, -2).join('_')
                            return n.moveBranchesTree
                                .get(i)
                                .moves.filter(function (e) {
                                    return 100 === Math.abs(e.branchValue)
                                }).length
                                ? (n.stepForward(i), !0)
                                : i.length > 3 &&
                                      n.handleCaseValueChangedNotably(i)
                        }),
                        (this.stepBackward = function (e) {
                            var t = e.split('_'),
                                a = n.lastResult.value,
                                r = n.moveBranchesTree,
                                o = r.get(t.slice(0, -1).join('_')),
                                i = r.get(n.lastPlayerMove)
                            n.evaluationStarted &&
                                o &&
                                i &&
                                (i.baseValue <= a
                                    ? a > o.baseValue
                                        ? n.stepBackForUnevaluatedBranchPlayer(
                                              t.slice(0, -2)
                                          )
                                        : n.stepBackForUnevaluatedBranchEngine(
                                              t.slice(0, -1)
                                          )
                                    : (o.baseValue,
                                      n.stepBackForUnevaluatedBranchEngine(
                                          t.slice(0, -1)
                                      )))
                        }),
                        (this.updateMoves = function (e, n, t) {
                            var a = e.moves.map(function (e) {
                                return e.move === n
                                    ? Object(r.a)(
                                          Object(r.a)({}, e),
                                          {},
                                          { branchValue: t }
                                      )
                                    : Object(r.a)({}, e)
                            })
                            return Object(r.a)(
                                Object(r.a)({}, e),
                                {},
                                { moves: a }
                            )
                        }),
                        (this.updateParentBranches = function (e, t) {
                            var a = e.slice(0, -1).join('_'),
                                r = e.slice(-1)[0]
                            if (
                                n.evaluationStarted &&
                                n.moveBranchesTree.get(a)
                            ) {
                                var o = n.moveBranchesTree.get(a),
                                    i = n.updateMoves(o, r, t)
                                if (
                                    (n.moveBranchesTree.set(a, i),
                                    a !== n.lastPlayerMove)
                                ) {
                                    var s = o.engineMoveLast
                                        ? n.getBestForPlayer(i.moves)
                                              .branchValue
                                        : n.getBestForEngine(i.moves)
                                              .branchValue
                                    return n.updateParentBranches(
                                        e.slice(0, -1),
                                        s
                                    )
                                }
                            }
                        }),
                        (this.lastLineEvaluation = function (e) {
                            if (
                                n.evaluationStarted &&
                                n.moveBranchesTree.get(e)
                            ) {
                                var t = n.moveBranchesTree.get(e),
                                    a = t.moves.map(function (t) {
                                        var a = t.position,
                                            o =
                                                n.evaluator.evaluateCurrentPosition(
                                                    a
                                                ),
                                            i = ''
                                                .concat(e, '_')
                                                .concat(t.move),
                                            s = {
                                                moves: l.a
                                                    .lookForAllMoves(
                                                        n.engineColor,
                                                        a
                                                    )
                                                    .map(function (e) {
                                                        return {
                                                            move: e.move,
                                                            branchValue: 100,
                                                            position:
                                                                e.position,
                                                        }
                                                    }),
                                                board: a,
                                                engineMoveLast: !1,
                                                baseValue: o,
                                                value: o,
                                            }
                                        return (
                                            n.moveBranchesTree.set(i, s),
                                            Object(r.a)(
                                                Object(r.a)({}, t),
                                                {},
                                                { branchValue: o }
                                            )
                                        )
                                    })
                                ;(n.lastResult = {
                                    value: n.getBestForPlayer(a).branchValue,
                                    movesBranch: e,
                                }),
                                    n.updateParentBranches(
                                        e.split('_'),
                                        n.lastResult.value
                                    )
                                var o = Object(r.a)(
                                    Object(r.a)({}, t),
                                    {},
                                    { moves: a }
                                )
                                n.moveBranchesTree.set(e, o), n.stepBackward(e)
                            }
                        }),
                        (this.getBestMove = function (e, t) {
                            return t
                                ? n.getBestForPlayer(e)
                                : n.getBestForEngine(e)
                        }),
                        (this.getBestForPlayer = function (e) {
                            return e.slice(1).reduce(function (e, n) {
                                return (
                                    n.branchValue < e.branchValue && (e = n), e
                                )
                            }, e[0])
                        }),
                        (this.getBestForEngine = function (e) {
                            return e.slice(1).reduce(function (e, n) {
                                return (
                                    n.branchValue > e.branchValue && (e = n), e
                                )
                            }, e[0])
                        })
                })()
            n.a = d
        },
        85: function (e, n, t) {
            'use strict'
            t.d(n, 'a', function () {
                return r
            })
            var a = t(21)

            function r(e, n) {
                if (null == e) return {}
                var t,
                    r,
                    o = Object(a.a)(e, n)
                if (Object.getOwnPropertySymbols) {
                    var i = Object.getOwnPropertySymbols(e)
                    for (r = 0; r < i.length; r++)
                        (t = i[r]),
                            n.indexOf(t) >= 0 ||
                                (Object.prototype.propertyIsEnumerable.call(
                                    e,
                                    t
                                ) &&
                                    (o[t] = e[t]))
                }
                return o
            }
        },
        86: function (e, n, t) {},
        88: function (e, n, t) {},
        89: function (e, n, t) {},
        90: function (e, n, t) {},
    },
])
//# sourceMappingURL=0.4d3d44d7.chunk.js.map
