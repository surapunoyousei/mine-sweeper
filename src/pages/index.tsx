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

  const maxBombCount = 10;
  // 0 -> 爆弾なし
  // 1 -> 爆弾あり
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
      count += clonedBombMap[ny][nx];
    });
    return count;
  };

  const borad: {
    value: number;
    isOpend: boolean;
    isBomb: boolean;
    nearByBombs: () => number;
    hasUserInput: () => boolean;
  }[][] = userInputs.map((aArray, y) => {
    return aArray.map((value, x) => {
      return {
        value,
        isOpend: value === 4,
        isBomb: clonedBombMap[y][x] === 1,
        nearByBombs: () => getNearByBombs(x, y),
        hasUserInput: () => value !== 0,
      };
    });
  });

  const isGameOver = userInputs
    .flat()
    .some((value, index) => value === 4 && clonedBombMap.flat()[index] === 1);

  const handleCellClick = (x: number, y: number) => {
    if (isGameOver) {
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
    if (isGameOver || borad[y][x].isOpend) {
      return;
    }
    putFlag(x, y);
  };

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
      alert('Game Over');
      digAllBombCells();
      setUserInputs(clonedUserInputs);
      return;
    }

    if (borad[y][x].nearByBombs() === 0) {
      directions.forEach((direction) => {
        digcell(x + direction[0], y + direction[1], true);
      });
    }
    setUserInputs(clonedUserInputs);

    // Check for win condition
    if (clonedUserInputs.flat().filter((val) => val !== 4).length === maxBombCount) {
      alert('You win!');
    }
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
            <div id={styles.fbutton} />
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
                    data-opening-state={value.isOpend ? true : false}
                    data-is-bomb={value.isBomb ? true : false}
                    data-user-input={userInputs[y][x]}
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
