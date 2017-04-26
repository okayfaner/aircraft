interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};

module game {
  export let $rootScope: angular.IScope = null;
  export let $timeout: angular.ITimeoutService = null;
  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  export let proposals: number[][] = null;
  export let remain_score : number[] = [10,10];
  //export let yourPlayerInfo: IPlayerInfo = null;

  export function init($rootScope_: angular.IScope, $timeout_: angular.ITimeoutService) {
    $rootScope = $rootScope_;
    $timeout = $timeout_;
    registerServiceWorker();
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    resizeGameAreaService.setWidthToHeight(2);
    gameService.setGame({
      updateUI: updateUI,
      getStateForOgImage: null,
    });
  }

  function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker
    // (because iOS doesn't support serviceWorker, so we have to use appCache)
    // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
    if (!window.applicationCache && 'serviceWorker' in navigator) {
      let n: any = navigator;
      log.log('Calling serviceWorker.register');
      n.serviceWorker.register('service-worker.js').then(function(registration: any) {
        log.log('ServiceWorker registration successful with scope: ',    registration.scope);
      }).catch(function(err: any) {
        log.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  function getTranslations(): Translations {
    return {};
  }


  export function getCellStyle(row: number, col: number) {
    let scale = 1.0;
    let opacity = 0.5;
    return {
      transform: `scale(${scale}, ${scale})`,
      opacity: "" + opacity,
    };
  }
  
  export function updateUI(params: IUpdateUI): void {
    log.info("Sue got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    clearAnimationTimeout();
    state = params.state;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
      log.info(currentUpdateUI);
      let move:IMove = {
        turnIndex: 0,
        state: state,
        endMatchScores:null,
      };
      //makeMove(move);
    }
    // We calculate the AI move only after the animation finishes,
    // because if we call aiService now
    // then the animation will be paused until the javascript finishes.
    animationEndedTimeout = $timeout(animationEndedCallback, 500);
  }

  function animationEndedCallback() {
    log.info("Animation ended");
  }

  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    didMakeMove = true;
    remain_score[turnIndex] = gameLogic.getPTW(turnIndex);
    log.info(["let go",gameLogic.getPTW(turnIndex)]);
    log.info(["lets go",remain_score[turnIndex]]);
    gameService.makeMove(move,null,"TODO");
  }

  function isFirstMove() {
    return !currentUpdateUI.state;
  }

  export function cellClicked(row: number, col: number): void {
    log.info("Clicked on cell:", row, col);
    let nextMove: IMove;
    try {
      nextMove = gameLogic.createMove(
          state,  row,col, currentUpdateUI.turnIndex);
    } catch (e) {
      //log.info(e);
      log.info(["Cell has been explored:", row,col]);
      return;
    }

    // Move is legal, make it!
    makeMove(nextMove);
  }

  // export function cellHover(row: number, col: number): void{
  //   log.info("Hover on cell: ", row, col);
  //   if(gameLogic.)
  // }

  // function isPiece(row: number, col: number, turnIndex: number, pieceKind: string): boolean {
  //   return state.board[row][col] === pieceKind || (isProposal(row, col) && currentUpdateUI.turnIndex == turnIndex);
  // }

  //<------ add game control two functions by:jam
  export function isPieceHit(row: number, col: number): boolean{
    let temp_pro: boolean;
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    log.info(state.board[turnIndex]);
    if(state.board[turnIndex][row][col] < -1){
      return true;
    }
    else
      return false;
  }

  export function isPieceBlank(row: number, col:number): boolean{
    let temp_pro: boolean;
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if(state.board[turnIndex][row][col] == -1){
      return true;
    }else
      return false;
  }

  export function showCraft(row: number, col:number): boolean{
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    //if(state.board[1-turnIndex][row][col] > 1 || state.board[1-turnIndex][row][col] < -1)
    if(state.board[1-turnIndex][row][col] >= 1)
      return true;
    else
      return false;
  }
  export function showBlank(row: number, col:number): boolean{
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if(state.board[1-turnIndex][row][col] == 0)
      return true;
    else
      return false;
  }
  export function showDamagedCraft(row:number, col:number): boolean{
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if(state.board[1-turnIndex][row][col] < -1)
      return true;
    else
      return false;
  }
  export function showDamagedBlank(row:number, col:number): boolean{
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    if(state.board[1-turnIndex][row][col] == -1)
      return true;
    else
      return false;
  }

  export function showHp(i : number){
    return gameLogic.getPTW(1 - i);
  }
  //--------->



  export function shouldShowImage(row: number, col: number): boolean {
    let turnIndex: number;
    turnIndex = currentUpdateUI.yourPlayerIndex;
    return state.board[turnIndex][row][col] <= -1;
  }

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    return state.delta &&
        state.delta.row === row && state.delta.col === col;
  }
}

angular.module('myApp', ['gameServices'])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IScope, $timeout: angular.ITimeoutService) {
      $rootScope['game'] = game;
      $rootScope['hp'] = ()=>game.remain_score[game.currentUpdateUI.yourPlayerIndex];
      game.init($rootScope, $timeout);
    }]);
    
    // var myapp = angular.module('myHp',[]);
// myapp.controller('myCtrl_2',function ($scope) {
//   $scope.score =game.remain_score[game.currentUpdateUI.yourPlayerIndex];
// });
