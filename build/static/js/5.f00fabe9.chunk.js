(this["webpackJsonptowers-draughts-client"]=this["webpackJsonptowers-draughts-client"]||[]).push([[5],{87:function(e,t,o){},91:function(e,t,o){},98:function(e,t,o){"use strict";o.r(t),o.d(t,"AnalysisPage",(function(){return R}));var r=o(3),a=o.n(r),n=o(31),s=o(80),i=o(38),c=o(78),l=o(47),d=o(26);function u(e){return{type:d.a.REVERSE_BOARD,payload:e}}o(87);var p=o(4),b={downloadGame:c.b,settingBoard:c.j,reverseBoard:u,setGameVariant:l.f,setDepth:c.h,evaluatePosition:c.c,analyzeLastGame:c.a,removePiece:c.g,setStartPosition:c.i},v=Object(n.b)((function(e){return{analysis:e.analyze,towerTouched:e.board.towerTouched,reversedBoard:e.boardOptions.reversedBoard,history:e.analyze.gameResult.movesHistory||[],GV:e.gameOptions.gameVariant}}),b)((function(e){var t=e.setGameVariant,o=e.settingBoard,r=e.reverseBoard,a=e.reversedBoard,n=e.evaluatePosition,s=e.analysis,i=e.history,c=e.analyzeLastGame,l=e.removePiece,d=e.GV,u=e.setStartPosition,b=e.towerTouched,v=s.settingPosition,m=s.analyzeLastGame,h=function(e){if(!b)switch(e){case"remove":return console.log("remove"),l(!s.removePiece);case"setup":return o(!v);case"dowload":return;case"startPosiotn":return u;case"analyze":return c(!0);case"reverse":return r(!a);case"eval":return n(!0)}};return Object(p.jsxs)("ul",{className:"game-analyze-menu",children:[i.length?Object(p.jsx)("li",{className:"game-analyze-menu_item",title:"analyze last game",children:Object(p.jsx)("button",{type:"button",onClick:function(){return h("analyze")},children:Object(p.jsx)("span",{className:"material-icons",children:"zoom_in"})})}):null,Object(p.jsx)("li",{className:"game-analyze-menu_item",title:s.removePiece?"delete":"drag pieces",children:Object(p.jsx)("button",{type:"button",onClick:function(){return h("remove")},children:Object(p.jsx)("span",{className:"material-icons",children:s.removePiece?"pan_tool":"delete"})})}),Object(p.jsx)("li",{className:"game-analyze-menu_item",title:"setup-start-board",children:Object(p.jsx)("button",{type:"button",onClick:function(){return h("startPositon")},children:"sb"})}),Object(p.jsx)("li",{className:"game-analyze-menu_item",title:"reverse board",children:Object(p.jsx)("button",{type:"button",name:"reverse-board",onClick:function(){return h("reverse")},children:Object(p.jsx)("span",{className:"material-icons",children:"change_circle"})})}),Object(p.jsx)("li",{className:"game-analyze-menu_item",title:"dowload game result",children:Object(p.jsx)("button",{type:"button",onClick:function(){return h("download")},children:Object(p.jsx)("span",{className:"material-icons",children:"file_download"})})}),Object(p.jsx)("li",{className:"game-analyze-menu_item",title:v?"analize position":"setup position",children:Object(p.jsx)("button",{type:"button",name:"game",onClick:function(){return h("setup")},children:Object(p.jsx)("span",{className:"material-icons",children:v?"construction":"grid_on"})})}),Object(p.jsx)("li",{className:"game-analyze-menu_item",title:"evaluate position",children:Object(p.jsx)("button",{type:"button",name:"evaluate",onClick:function(){return h("eval")},children:Object(p.jsx)("span",{className:"material-icons",children:"calculate"})})}),Object(p.jsx)("li",{className:"game-analyze-menu_item gv",title:"Choose game variant. International: I Rusian: R Towers: T",children:Object(p.jsxs)("select",{className:"gv",name:"gv",defaultValue:d,onChange:function(e){var o=e.target.value;t(o)},disabled:m,children:[Object(p.jsx)("option",{value:"international",children:"I"}),Object(p.jsx)("option",{value:"russian",children:"R"}),Object(p.jsx)("option",{value:"towers",children:"T"})]})})]})})),m=o(81),h=o(0),O=o(23),w=o(28),y=o(30),j=o(29),g=o(17),f=o(6),P=o(77),T=o(9),M=o(16),B=o(19),x=o(42),S=o(82),k=o(83),z=o(79),C=o(84),D=function(e){var t=e.color,o=e.towers,r=t===f.b.w?"oW":"oB",a=Object(g.a)(o.keys()).filter((function(e){return e.includes(r)})).length;return Object(p.jsx)("span",{className:"unused-".concat(t),children:a})},N={updateAnalysisState:c.m,makeMove:P.f,makeNewMove:c.e,updateBoardState:z.c,reverseBoard:u,clearHistory:P.b,finishGameSetup:l.c},Q=Object(n.b)((function(e){return{gameOptions:e.gameOptions,windowSize:e.app.windowSize,analysis:e.analyze,board:e.board,boardOptions:e.boardOptions}}),N)(function(e){Object(y.a)(o,e);var t=Object(j.a)(o);function o(e){var r;Object(O.a)(this,o),(r=t.call(this,e)).boardRef=a.a.createRef(),r.mmr=x.a,r.tur=B.a,r.bms=C.a,r.createBoardToAnalysis=function(){var e,t=r.props,o=t.analysis,a=o.analyzeLastGame,n=o.gameResult.movesHistory,s=o.settingPosition,i=t.boardOptions,c=t.board.positionsTree,l=t.updateBoardState,d=t.clearHistory;s&&i.reversedBoard&&u(!1),a&&n&&(null===c||void 0===c?void 0:c.size)?e=Object(M.a)({boardOptions:i}):(console.log("clear history"),d("sdsf"),e=Object(M.d)({boardOptions:i})),l(Object(h.a)({},e))},r.updateCurrentPositionWhileSettingBoard=function(e){console.log("update current position");var t=r.props,o=t.board,a=t.updateBoardState,n=e.wPiecesQuantity,s=e.bPiecesQuantity,i=e.currentColor,c=e.currentType,l=e.onBoardPosition,d=Object(h.a)(Object(h.a)({},Object(M.g)(i,c)),{},{wPiecesQuantity:n,bPiecesQuantity:s,key:l}),u=Object(T.f)(o.currentPosition);u[l].tower=d,a({currentPosition:u})},r.handleUpToMove=function(e){var t,o=r.props,a=o.board,n=a.currentPosition,s=a.towerTouched,i=a.mandatoryMoves,c=a.mandatoryMoveStep,l=o.makeNewMove,d=o.updateBoardState,u=o.gameOptions.gameVariant,p=o.board,b=r.props.board.mouseDown,v=s.key,m="".concat(v,"-").concat(e),h=n,O=[],w=0;if(null===i||void 0===i?void 0:i.length){m="".concat(v,":").concat(e);var y=i.filter((function(e){return e.move.includes(m)}));if(y[0].move.split(":").length===c+2){var j=y[0].takenPieces,g="towers"===u?[j[c]]:j,f=y[0];t=r.tur.updateTowersOnMandatoryMoveStep(v,e,p,g,!0),l({moveToSave:f}),h=y[0].position,b=!1}else{var P=y[0].takenPieces[c];O=y,w=c+1,t=r.tur.updateTowersOnMandatoryMoveStep(v,e,p,[P])}}else h=r.mmr.makeFreeMove(v,e,n),l({moveToSave:{move:m,position:h}}),t=r.tur.updateTowersAfterMoveAnimation(v,e,p,!1,!0),b=!1;d({currentPosition:h,mouseDown:b,towers:t,mandatoryMoves:O,mandatoryMoveStep:w,towerTouched:null})},r.handleMouseUp=function(e){var t=r.props,o=t.analysis.settingPosition,a=t.boardOptions.reversedBoard,n=t.board,s=n.towerTouched,i=n.moveDone,c=n.cellsMap,l=n.cellSize,d=n.towers,u=t.board;if(s&&!i){var p="touchend"===e.type?e.changedTouches[0]:e,b=p.clientX,v=p.clientY,m=s.possibleMoves;o&&(m=c);var O=Object(T.b)({x:b,y:v},m,l,r.boardRef);O?o?d.get(O)||r.handleSettingPieces(O):r.handleUpToMove(O):(console.log("out of board"),r.tur.cancelTowerTransition(Object(h.a)(Object(h.a)({},u),{},{reversed:a})))}},r.mergeTowers=function(e, t){var o=r.props.board.towers,a=Object(T.f)(e);return a.wPiecesQuantity=e.wPiecesQuantity+t.wPiecesQuantity,a.bPiecesQuantity=e.bPiecesQuantity+t.bPiecesQuantity,e.currentColor!==t.currentColor&&(a.currentColor=t.currentColor),o.delete(t.onBoardPosition),o.set(a.onBoardPosition,a),r.updateCurrentPositionWhileSettingBoard(a),o},r.setTowerOnBoard=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],o=r.props.board,a=o.towers,n=o.cellsMap,s=o.cellSize,i=r.props.board.towerTouched,c=a.get(i.key);c.positionInDOM=r.tur.calcTowerPosition(e,n,s,t),c.onBoardPosition=e;var l=Object(T.e)(a);return l.set(e,c),l.delete(i.key),r.updateCurrentPositionWhileSettingBoard(c),l},r.handleSettingTowers=function(e){var t=r.props,o=t.analysis.removePiece,a=t.updateBoardState,n=t.boardOptions.reversedBoard,s=t.board,i=s.towerTouched,c=s.towers,l=t.board,d=c.get(i.key),u=e.bPiecesQuantity>0&&e.wPiecesQuantity>0&&d.wPiecesQuantity>0&&d.bPiecesQuantity>0,p=e.currentColor===d.currentColor&&d.wPiecesQuantity>0&&d.bPiecesQuantity>0,b=e.currentColor!==d.currentColor&&e.bPiecesQuantity>0&&e.wPiecesQuantity>0;if(u||p||b||e.onBoardPosition===(null===d||void 0===d?void 0:d.onBoardPosition))r.tur.cancelTowerTransition(Object(h.a)(Object(h.a)({},l),{},{reversed:n}));else{console.log(e,d);var v=r.mergeTowers(e,d),m=null;if(!o){var O=i.key,w=parseInt(O.slice(4));if(w>0){var y="".concat(O.slice(0,4)).concat(w-1);a({towers:v,towerTouched:m=Object(h.a)(Object(h.a)({},i),{},{key:y})})}else a({towers:v,mouseDown:!1,towerTouched:m})}}},r.handleSettingPieces=function(e){var t=r.props,o=t.updateBoardState,a=t.board,n=a.towerTouched,s=a.towers,i=t.board,c=s.get(e),l=r.props.boardOptions.reversedBoard;if(c)"towers"===r.props.gameOptions.gameVariant?r.handleSettingTowers(c):r.tur.cancelTowerTransition(Object(h.a)(Object(h.a)({},i),{},{reversed:l}));else{var d=r.setTowerOnBoard(e,l),u=Object(T.f)(i.currentPosition),p=d.get(e),b=p.currentColor,v=p.currentType;u[e].tower=Object(M.g)(b,v);var m=null,O=n.key,w=parseInt(O.slice(4));if(w>0){var y="".concat(O.slice(0,4)).concat(w-1);o({towers:d,currentPosition:u,towerTouched:m=Object(h.a)(Object(h.a)({},n),{},{key:y})})}else o({towers:d,mouseDown:!1,currentPosition:u,towerTouched:m})}},r.handleRemoveTower=function(e){var t=Object(T.e)(r.props.board.towers),o=r.props,a=o.boardOptions.reversedBoard,n=o.updateBoardState,s=o.board.cellSize,i=o.board,c=e.onBoardPosition,l=e.wPiecesQuantity,d=e.bPiecesQuantity,u=Object(g.a)(r.props.board.towers.keys()),p=u.filter((function(e){return e.includes("oW")})).length,b=u.filter((function(e){return e.includes("oB")})).length,v=Object(T.f)(i.currentPosition);v[c].tower=null,n({currentPosition:v}),t.delete(c);for(var m=0; m<l; m++){var h="oW w".concat(p+m),O=r.tur.calcPositionOutboardTowers(h,s,a),w=new f.c({currentColor:f.b.w,positionInDOM:O,onBoardPosition:h});console.log(O,h,a,w),t.set(h,w)}for(var y=0; y<d; y++){var j="oB b".concat(b+y),P=r.tur.calcPositionOutboardTowers(j,s,a),M=new f.c({currentColor:f.b.b,positionInDOM:P,onBoardPosition:j});console.log(P,j,a,M),t.set(j,M)}n({towers:t})},r.handleRemovePiece=function(e){var t=r.props,o=t.board.cellSize,a=t.board,n=t.boardOptions.reversedBoard,s=t.updateBoardState,i=Object(T.f)(a.currentPosition);if(!i[e])return r.props.board.towerTouched&&r.tur.cancelTowerTransition(Object(h.a)(Object(h.a)({},a),{},{reversed:n})),console.error(e,i);i[e].tower=null;var c=Object(T.e)(r.props.board.towers),l=c.get(e);if("towers"===r.props.gameOptions.gameVariant&&l.wPiecesQuantity+l.bPiecesQuantity>1)return r.handleRemoveTower(l);var d=l.currentColor===f.b.w?"oW w":"oB b",u=Object(g.a)(c.values()).filter((function(e){return e.onBoardPosition.includes(d)})).length;d="".concat(d).concat(u),l.onBoardPosition=d,l.currentType=f.d.m,l.positionInDOM=r.tur.calcPositionOutboardTowers(d,o,n),c.set(d,l),c.delete(e),s({towers:c,currentPosition:i,mouseDown:!1,towerTouched:null})},r.handleMouseMove=function(e){var t=r.props,o=t.board,a=o.towerTouched,n=o.moveDone,s=o.mouseDown,i=t.analysis.settingPosition,c=t.updateBoardState;if(a&&!n&&(s||i)){var l=a.key,d=a.startCursorPosition,u=a.startTowerPosition,p="touchmove"===e.type?e.changedTouches[0]:e,b=p.clientX,v=p.clientY,m=Object(T.e)(r.props.board.towers),h=Object(T.f)(m.get(l)),O={x:u.x+b-d.x,y:u.y+v-d.y},w=h.positionInDOM;h.positionInDOM=O,Math.abs(w.x-O.x)+Math.abs(w.y-O.y)>=6&&(m.set(l,h),c({towers:m}))}},r.handleSettingPositionMouseDown=function(e){var t=r.props,o=t.analysis.removePiece,a=t.board,n=t.board,s=n.cellSize,i=n.cellsMap,c=n.towers,l=t.updateBoardState,d=e.target,u=e.clientX,p=e.clientY,b=r.props.boardOptions.reversedBoard,v=d.getAttribute("data-indexes");if(v||r.tur.cancelTowerTransition(Object(h.a)(Object(h.a)({},a),{},{reversed:b})),console.log(d,o),o)return r.handleRemovePiece(v);if(!o&&r.props.board.towerTouched){var m=Object(T.b)({x:u,y:p},i,s,r.boardRef);return m?r.handleSettingPieces(m):void 0}var O=c.get(v);l({towerTouched:{key:v,posibleMoves:new Map,startCursorPosition:{x:u,y:p},startTowerPosition:O.positionInDOM,towerColor:O.currentColor,towerType:O.currentType},mouseDown:!0})},r.handleMouseDown=function(e){console.log(e);var t=r.props,o=t.analysis,a=o.pieceOrder,n=o.settingPosition,s=t.board,i=s.mandatoryMoves,c=s.cellsMap,l=s.towers,d=s.currentPosition,u=t.updateBoardState,p="touchstart"===e.type?e.changedTouches[0]:e,b=p.target,v=p.clientX,m=p.clientY,h=b.classList;if(h.contains("checker-tower")){if(n)return r.handleSettingPositionMouseDown({target:b,clientX:v,clientY:m});if(h.contains(a)){var O,w=b.getAttribute("data-indexes"),y=l.get(w);if((O=(null===i||void 0===i?void 0:i.length)?Object(T.k)(r.props.board,w):y.currentType===f.d.m?r.mmr.manTowerFreeMoves(y,d,c):r.mmr.kingTowerFreeMoves(w,d,c)).size)u({towerTouched:{key:w,posibleMoves:O,startCursorPosition:{x:v,y:m},startTowerPosition:y.positionInDOM,towerColor:y.currentColor,towerType:y.currentType},mouseDown:!0})}}},r.contextMenuHandler=function(e){var t=r.props,o=t.analysis.settingPosition,a=t.updateBoardState;if(e.preventDefault(),o){var n=e.target;if(n.classList.contains("checker-tower")){var s=n.getAttribute("data-indexes"),i=Object(T.f)(r.props.board.towers.get(s));i.currentType=i.currentType===f.d.m?f.d.k:f.d.m;var c=Object(T.e)(r.props.board.towers);c.set(s,i),a({towers:c})}}},console.log(e);var n={GV:e.gameOptions.gameVariant,size:e.boardOptions.boardSize};return r.mmr.setProps(n),r.tur.setProps(n),r.tur.setCalBack(r.props.updateBoardState),r}return Object(w.a)(o,[{key:"componentDidMount",value:function(){var e=this;if(window){this.props.finishGameSetup(!1),this.createBoardToAnalysis();var t=this.props.analysis.depth;setTimeout((function(){var t=e.props,o=t.board,r=t.boardOptions;console.log(e.props),e.tur.updateCellsPosition(o,r,e.boardRef.current)}),0);var o={bestMoveCB:z.c,maxDepth:t,evaluationStarted:!0};C.a.resetProps(o)}}},{key:"componentDidUpdate",value:function(e){var t=this.props,o=t.updateBoardState,r=t.gameOptions.gameVariant,a=t.boardOptions.reversedBoard,n=t.analysis,s=n.analyzeLastGame,i=n.settingPosition,c=n.pieceOrder,l=n.startPosition,d=n.lastMove,u=t.boardOptions,p=t.board,b=p.currentPosition,v=p.cellSize,m=p.cellsMap,h=t.board;console.log(this.props);var O=this.mmr.lookForMandatoryMoves(c,b);if((s&&!e.analysis.analyzeLastGame||i&&!e.analysis.settingPosition||l&&!e.analysis.startPosition)&&this.tur.updateCellsPosition(h,u,this.boardRef.current),!i&&e.analysis.settingPosition)if(JSON.stringify(e.board.currentPosition)!==JSON.stringify(b)){var w=this.tur.updateTowersToBoard(b);o({currentPosition:b,towers:w=this.tur.updateTowersPosition(v,w,m,a),mandatoryMoves:O,mandatoryMoveStep:0})}else{var y=this.mmr.lookForMandatoryMoves(c,b);y.length&&o({mandatoryMoveStep:0,mandatoryMoves:y})}if(r!==e.gameOptions.gameVariant){var j=this.props,g=j.updateBoardState,f=j.boardOptions,P=Object(M.d)({boardOptions:f});g(P),this.tur.updateCellsPosition(P,f,this.boardRef.current)}if(!i&&c!==e.analysis.pieceOrder||d.move!==e.analysis.lastMove.move||u.reversedBoard!==e.boardOptions.reversedBoard){var T=this.props.boardOptions.reversedBoard;o({currentPosition:b,mandatoryMoves:O,mandatoryMoveStep:0,towers:this.tur.updateTowersPosition(v,h.towers,m,T)})}}},{key:"componentWillUnmount",value:function(){var e=this.props,t=e.updateAnalysisState,o=e.boardOptions,r=e.updateBoardState;t({analyzeLastGame:!1,movesMainLine:[],settingPosition:!0,movesCurrentLine:[]});var a=Object(M.c)(o.boardSize),n=new Map;n.set("sp",a),r({currentPosition:a,positionsTree:n})}},{key:"render",value:function(){var e=this.props,t=e.boardOptions,o=e.board.towerTouched,a=e.board,n=a.towers,s=a.mandatoryMoves,i=a.mandatoryMoveStep,c=a.lastMoveSquares,l={boardOptions:t,posibleMoves:null===o||void 0===o?void 0:o.possibleMoves,lastMove:c},d=t.boardSize,u=t.boardTheme,b=t.reversedBoard,v="board__wrapper ".concat(u," h").concat(d,"v").concat(d).concat(b?" reversed":""),m=(s||[]).map((function(e){return e.move.split(":")[i||0]})),O=Array.from(n.values()).map((function(e, t){var o=m.includes(e.onBoardPosition);return Object(r.createElement)(S.a,Object(h.a)(Object(h.a)({},e),{},{key:e.onBoardPosition,mandatory:o}))}));return Object(p.jsxs)("section",{onContextMenu:this.contextMenuHandler,onMouseMove:this.handleMouseMove,onMouseUp:this.handleMouseUp,onMouseDown:this.handleMouseDown,onTouchStart:this.handleMouseDown,onTouchMove:this.handleMouseMove,onTouchEnd:this.handleMouseUp,className:v,ref:this.boardRef,children:[Object(p.jsxs)("div",{className:"piece-boxes-container",children:[Object(p.jsx)("div",{className:"pieces-box white-b",children:Object(p.jsx)(D,{color:f.b.w,towers:n})}),Object(p.jsx)("div",{className:"pieces-box black-b",children:Object(p.jsx)(D,{color:f.b.b,towers:n})})]}),O,Object(p.jsx)(k.a,Object(h.a)({},l))]})}}]),o}(a.a.Component)),R=(o(91),function(e){var t=Object(n.c)((function(e){return e.app.portrait})),o=Object(n.c)((function(e){return e.boardOptions.boardSize})),a="".concat(t?"portrait":""," h").concat(o,"v").concat(o);return Object(p.jsx)(r.Suspense,{fallback:Object(p.jsx)(i.a,{}),children:Object(p.jsxs)("div",{className:t?"portrait page analyze-page noselect":"page analyze-page noselect",children:[Object(p.jsx)(s.a,{side:"left",children:Object(p.jsx)(v,{})}),Object(p.jsx)("main",{className:a,children:Object(p.jsx)(Q,{})}),Object(p.jsx)(s.a,{side:"right",children:Object(p.jsx)(m.a,{})})]})})});t.default=R}}]);
//# sourceMappingURL=5.f00fabe9.chunk.js.map
