type Board = number[][]; 
//>=0:blank
// == -1:grey
//<-1:red

interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;

interface IState {
  board: Board[];
  delta: BoardDelta;
}
// head info
interface HeadPosi{
  index: number;
  x:number;
  y:number;
  direct:number;
}

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 6;
  export const COLS = 6;
  export let points_to_win = [10,10];
  let head : HeadPosi[] = [];
  head[0] = getInitialHP();
  head[1] = getInitialHP();
  export function getInitialHP(){
    let temp :HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
    return temp;
  }
    //  HeadPosi = {index : Math.floor(Math.random() * 20) + 1, x :0, y :0, direct :0};
  /** Returns the initial AirCraft board, which is a ROWSxCOLS matrix containing ''. */
  export function getInitialBoard(i:number): Board {
    let board: Board = [];
    // generate random craft head
    //head.index = Math.floor(Math.random() * 20) + 1;

    //choose a direction based on the head position
    if(head[i].index >=17 && head[i].index <=20){
      let rand: number = Math.floor(Math.random() * 2) +1;
      switch (head[i].index){
        case 17:
          if(rand == 1){
            head[i].direct = 1;
          }else{
            head[i].direct =2;
          }
          head[i].x = 2;
          head[i].y = 2;
          break;
        case 18:
          if(rand == 1){
            head[i].direct = 1;
          }else{
            head[i].direct =3;
          }
          head[i].x = 3;
          head[i].y = 2;
          break;
        case 19:
          if(rand == 1){
            head[i].direct = 2;
          }else{
            head[i].direct =4;
          }
          head[i].x = 2;
          head[i].y = 3;
          break;
        case 20:
          if(rand == 1){
            head[i].direct = 3;
          }else{
            head[i].direct = 4;
          }
          head[i].x = 3;
          head[i].y = 3;
          break;
      }
    }else if(head[i].index >=1 && head[i].index <=4){
      head[i].direct = 1;
      head[i].x = (head[i].index ===1 ||head[i].index == 3)?2:3;
      head[i].y = (head[i].index ===1 ||head[i].index == 2)?0:1;
    }else if(head[i].index >= 5 && head[i].index <=8){
      head[i].direct = 2;
      head[i].x = (head[i].index ===5 ||head[i].index == 7)?0:1;
      head[i].y = (head[i].index ===5 ||head[i].index == 6)?2:3;
    }else if(head[i].index >=9 && head[i].index <= 12){
      head[i].direct = 3;
      head[i].x = (head[i].index ===9 ||head[i].index == 11)?4:5;
      head[i].y = (head[i].index ===9 ||head[i].index == 10)?2:3;
    }else if(head[i].index >= 13 && head[i].index <=16){
      head[i].direct =4;
      head[i].x = (head[i].index ===13 ||head[i].index == 15)?2:3;
      head[i].y = (head[i].index ===13 ||head[i].index == 14)?4:5;
    }

    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = 0;
      }
    }
    let x = head[i].x;
    let y = head[i].y;

    //initial aircraft in board
    switch (head[i].direct){
      case 1:
        board[x][y] = 10;
        //body
        board[x][y+1] = 5;
        board[x][y+2] = 5;
        //wing
        board[x-2][y+1] = 2;
        board[x-1][y+1] = 2;
        board[x+1][y+1] = 2;
        board[x+2][y+1] = 2;
        //tail
        board[x-1][y+3] = 3;
        board[x][y+3] = 3;
        board[x+1][y+3] = 3;
        break;
      case 2:
        board[x][y] = 10;
        //body
        board[x+1][y] = 5;
        board[x+2][y] = 5;
        //wing
        board[x+1][y-2] = 2;
        board[x+1][y-1] = 2;
        board[x+1][y+1] = 2;
        board[x+1][y+2] = 2;
        //tail
        board[x+3][y-1] = 3;
        board[x+3][y+1] = 3;
        board[x+3][y] = 3;
        break;
      case 3:
        board[x][y] = 10;
        //body
        board[x-1][y] = 5;
        board[x-2][y] = 5;
        //wing
        board[x-1][y-2] = 2;
        board[x-1][y-1] = 2;
        board[x-1][y+1] = 2;
        board[x-1][y+2] = 2;
        //tail
        board[x-3][y-1] = 3;
        board[x-3][y+1] = 3;
        board[x-3][y] = 3;
        break;
      case 4:
        board[x][y] = 10;
        //body
        board[x][y-1] = 5;
        board[x][y-2] = 5;
        //wing
        board[x-2][y-1] = 2;
        board[x-1][y-1] = 2;
        board[x+1][y-1] = 2;
        board[x+2][y-1] = 2;
        //tail
        board[x-1][y-3] = 3;
        board[x][y-3] = 3;
        board[x+1][y-3] = 3;
        break;
    }


    return board;
  }

  export function getPTW(turnIndex: number): number {
    return points_to_win[turnIndex];
  }

  export function getInitialState(): IState {
    let temp_board_0 : Board = getInitialBoard(0);
    let temp_board_1 : Board = getInitialBoard(1);
    return {board: [temp_board_0, temp_board_1], delta: null};
  }

  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
   * E.g., getWinner returns 'X' for the following board:
   *     [['X', 'O', ''],
   *      ['X', 'O', ''],
   *      ['X', '', '']]
   */
  function winOrNot(turnIndexBeforeMove: number): boolean {
    if (points_to_win[turnIndexBeforeMove] <= 0) return true;
    else return false;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(stateBeforeMove: IState,  row: number,col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    //same index = move board; otherwise show board
    let board: Board = stateBeforeMove.board[turnIndexBeforeMove];

    if (board[row][col] < 0) {
      throw new Error("One can only make a move in an empty position!");
    }
    if (winOrNot(turnIndexBeforeMove)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board);
    if (boardAfterMove[row][col] > 0) {
      points_to_win[turnIndexBeforeMove] -= boardAfterMove[row][col];
      boardAfterMove[row][col] = -boardAfterMove[row][col];
    }
    else {
      boardAfterMove[row][col] = -1;
    }
    let finalboard: Board[] = [];
    finalboard[turnIndexBeforeMove] = boardAfterMove;
    finalboard[1-turnIndexBeforeMove] = stateBeforeMove.board[1-turnIndexBeforeMove];

    let winner = winOrNot(turnIndexBeforeMove);
    let turnIndex: number = turnIndexBeforeMove;
    let temp_score =[0,0];
    if (winner) {
      turnIndex = -1;
      temp_score[turnIndexBeforeMove] = 10 - points_to_win[turnIndexBeforeMove];
      temp_score[1-turnIndexBeforeMove] = 10 - points_to_win[1-turnIndexBeforeMove];
    }
    else {
      turnIndex = 1 - turnIndex;
      temp_score = null;
    }

    let delta: BoardDelta = {row: row, col: col};
    let state: IState = {delta: delta, board: finalboard};

    //endMatchScores: number[];
    return {turnIndex: turnIndex, state: state, endMatchScores: temp_score};
  }
  
  export function createInitialMove(): number {
    return 0;
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
  }
}
