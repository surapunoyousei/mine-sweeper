import { useState } from 'react';
import styles from './index.module.css';

const directions = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

const generateRandomNum = (min: number, max: number) => {
  const result = Math.floor(Math.random() * (max + 1 - min) + min);
  return result;
};

const generateRandomNumArray = (maxNumber: number, length: number, excludeNum: number) => {
  const result: number[] = [];
  for (let i = 0; i < length; i++) {
    const num = generateRandomNum(0, maxNumber);
    if (result.includes(num) || num === excludeNum) {
      i--;
      continue;
    }
    result.push(num);
  }
  return result;
};

const Home = () => {
  // 0 -> 未クリック
  // 1 -> 左クリック
  // 2 -> はてな
  // 3 -> 旗
  // 4 -> クリック済み
  const [userInputs, setUserInputs] = useState(
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0)),
  );

  const clonedUserInputs = structuredClone(userInputs);

  const maxBombCount = 2;
  // 0 -> 爆弾なし
  // 1 -> 爆弾あり
  // 2 -> ゲームオーバーの原因の爆弾
  const [bombMap, setBombMap] = useState(
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0)),
  );

  const clonedBombMap = structuredClone(bombMap);

  const getNearByBombs = (x: number, y: number) => {
    let count = 0;
    directions.map((direction) => {
      const nx = x + direction[0];
      const ny = y + direction[1];
      if (nx < 0 || nx >= 9 || ny < 0 || ny >= 9) {
        return;
      }
      count += clonedBombMap[ny][nx] >= 1 ? 1 : 0;
    });
    return count;
  };

  // セルの情報保存用。参照はなるべくこちら側を使う
  const borad: {
    value: number;
    isOpend: boolean;
    isBomb: boolean;
    isGameOverCauseBomb: boolean;
    isUsrMisreadFlagPut: boolean;
    nearByBombs: () => number;
    hasUserInput: () => boolean;
  }[][] = userInputs.map((aArray, y) => {
    return aArray.map((value, x) => {
      return {
        value,
        isOpend: value === 4,
        isBomb: clonedBombMap[y][x] >= 1,
        isGameOverCauseBomb: value === 4 && clonedBombMap[y][x] === 2,
        isUsrMisreadFlagPut: clonedBombMap[y][x] < 1 && value === 3,
        nearByBombs: () => getNearByBombs(x, y),
        hasUserInput: () => value !== 0,
      };
    });
  });

  /* ゲームの進行状態確認 */
  const isGameOver = () => {
    return userInputs
      .flat()
      .some((value, index) => value === 4 && clonedBombMap.flat()[index] >= 1);
  };

  const isUserWon = () => {
    return clonedUserInputs.flat().filter((value) => value === 4).length === 9 * 9 - maxBombCount;
  };

  const shouldBeDisableInput = isGameOver() || isUserWon();

  /*セルのクリック処理。左右クリック両方とも*/
  const handleCellClick = (x: number, y: number) => {
    if (shouldBeDisableInput) {
      return;
    }

    if (isFirstInput) {
      setBomb(x, y).then(() => {
        digcell(x, y);
      });
    } else {
      digcell(x, y);
    }
  };

  // Add an onContextMenu handler for flagging bombs
  const handleRightClick = (ev: React.MouseEvent<HTMLDivElement>, x: number, y: number) => {
    ev.preventDefault();
    if (shouldBeDisableInput || borad[y][x].isOpend) {
      return;
    }
    putFlag(x, y);
  };

  /* ゲームの進行のためのコード */
  const setBomb = async (x: number, y: number) => {
    const randomArray = generateRandomNumArray(
      borad.length * borad[0].length - 1,
      maxBombCount,
      x + y * borad[0].length,
    );
    const oneArrayNums = borad[0].length;
    randomArray.map((value) => {
      const y = Math.floor(value / oneArrayNums);
      const x = value % oneArrayNums;
      clonedBombMap[y][x] = 1;
    });
    setBombMap(clonedBombMap);
  };
  const isFirstInput = bombMap.every((row) => row.every((value) => value === 0));

  function digcell(x: number, y: number, recursive: boolean = false) {
    if (
      x < 0 ||
      x >= 9 ||
      y < 0 ||
      y >= 9 ||
      (recursive && clonedUserInputs[y][x] !== 3 && clonedUserInputs[y][x] !== 0) ||
      borad[y][x].isOpend
    ) {
      return;
    }
    clonedUserInputs[y][x] = 4;

    if (borad[y][x].isBomb) {
      clonedBombMap[y][x] = 2;
      clonedUserInputs[y][x] = 4;
      digAllBombCells();
      setBombMap(clonedBombMap);
      setUserInputs(clonedUserInputs);
      return;
    }

    if (borad[y][x].nearByBombs() === 0) {
      directions.forEach((direction) => {
        digcell(x + direction[0], y + direction[1], true);
      });
    }
    setUserInputs(clonedUserInputs);
  }

  function digAllBombCells() {
    clonedUserInputs.map((aArray, y) => {
      aArray.map((_, x) => {
        if (borad[y][x].isBomb) {
          clonedUserInputs[y][x] = 4;
        }
      });
    });
    setUserInputs(clonedUserInputs);
  }

  const putFlag = (x: number, y: number) => {
    if (clonedUserInputs[y][x] === 3) {
      clonedUserInputs[y][x] = 0;
    } else {
      clonedUserInputs[y][x] = 3;
    }
    setUserInputs(clonedUserInputs);
  };

  // ゲームの初期化
  const resetGame = () => {
    setUserInputs(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0)));
    setBombMap(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0)));
  };

  return (
    <div className={styles.container}>
      <div id={styles.contents}>
        <div id={styles.leftSidePanel} className={styles.hSidePanels} />
        <div id={styles.center}>
          <div id={styles.topSidePanel} className={styles.vSidePanels} />
          <div id={styles.header}>
            <div id={styles.bcounter} className={styles.counters}>
              <div className={styles.numberCounts} id={styles.first_bcounter_number}>
                {maxBombCount - clonedUserInputs.flat().filter((value) => value === 3).length}
              </div>
            </div>
            <div
              id={styles.fbutton}
              onClick={() => resetGame()}
              style={{ backgroundPosition: `${isGameOver() ? 38 : isUserWon() ? 73 : 108}px` }}
            />
            <div id={styles.tcounter} className={styles.counters} />
          </div>
          <div id={styles.topSidePanel} className={styles.vSidePanels} />
          <div id={styles.main}>
            <div id={styles.board}>
              {borad.map((row, y) =>
                row.map((value, x) => (
                  <div
                    className={styles.cell}
                    key={`${x} + ${y}`}
                    data-opening-state={value.isOpend}
                    data-isGameOverCauseBomb={value.isGameOverCauseBomb}
                    data-isUsrMisreadFlagPut={
                      shouldBeDisableInput ? value.isUsrMisreadFlagPut : false
                    }
                    data-user-input={isUserWon() && value.isBomb ? 3 : userInputs[y][x]}
                    onClick={() => handleCellClick(x, y)}
                    onContextMenu={(ev) => handleRightClick(ev, x, y)}
                  >
                    <div
                      className={styles.displayIcons}
                      data-state={userInputs[y][x]}
                      style={{
                        backgroundPosition: `${
                          value.isOpend
                            ? borad[y][x].isBomb
                              ? 10 * -30
                              : borad[y][x].nearByBombs() !== 0
                                ? (borad[y][x].nearByBombs() - 1) * -30
                                : 30
                            : 30
                        }px 0px`,
                      }}
                    />
                  </div>
                )),
              )}
            </div>
          </div>
          <div id={styles.bottomSidePanel} className={styles.vSidePanels} />
        </div>
        <div id={styles.leftSidePanel} className={styles.hSidePanels} />
      </div>
    </div>
  );
};

export default Home;
