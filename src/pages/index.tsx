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

const Home = () => {
  // 0 -> 未クリック
  // 1 -> 左クリック
  // 2 -> はてな
  // 3 -> 旗
  // 4 -> クリック済み
  const [userInputs, setUserInputs] = useState([
    [0, 4, 0, 0, 0, 0, 0, 0, 0],
    [4, 4, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const maxBombCount = 10;
  // 0 -> 爆弾なし
  // 1 -> 爆弾あり
  const [bombMap /*setBombMap*/] = useState([
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0],
  ]);
  const clonedUserInputs = structuredClone(userInputs);
  const clonedBombMap = structuredClone(bombMap);

  const getNearByBombs = (x: number, y: number) => {
    let count = 0;
    directions.map((direction) => {
      const nx = x + direction[0];
      const ny = y + direction[1];
      if (nx < 0 || nx >= 9 || ny < 0 || ny >= 9) {
        return;
      }
      count += bombMap[ny][nx];
    });
    return count;
  };

  const borad: {
    value: number;
    isOpend: boolean;
    isBomb: boolean;
    nearByBombs: number;
  }[][] = [];
  userInputs.map((aArray, y) => {
    borad.push([]);
    aArray.map((value, x) => {
      borad[y].push({
        value,
        isOpend: value === 4,
        isBomb: bombMap[y][x] === 1,
        nearByBombs: getNearByBombs(x, y),
      });
    });
  });

  function digcell(x: number, y: number) {
    if (x < 0 || x >= 9 || y < 0 || y >= 9 || clonedUserInputs[y][x] !== 0 || borad[y][x].isOpend) {
      return;
    }
    clonedUserInputs[y][x] = 4;
    if (borad[y][x].nearByBombs === 0) {
      directions.forEach((direction) => {
        digcell(x + direction[0], y + direction[1]);
      });
    }
    setUserInputs(clonedUserInputs);
  }

  return (
    <div className={styles.container}>
      <div id={styles.contents}>
        <div id={styles.leftSidePanel} className={styles.hSidePanels} />
        <div id={styles.center}>
          <div id={styles.topSidePanel} className={styles.vSidePanels} />
          <div id={styles.header} />
          <div id={styles.topSidePanel} className={styles.vSidePanels} />
          <div id={styles.main}>
            <div id={styles.board}>
              {borad.map((row, y) =>
                row.map((value, x) => (
                  <div
                    className={styles.cell}
                    key={`${x} + ${y}`}
                    data-opening-state={value.isOpend ? true : false}
                    onClick={() => {
                      digcell(x, y);
                      setUserInputs(clonedUserInputs);
                    }}
                  >
                    <div
                      className={styles.displayIcons}
                      data-state={userInputs[y][x]}
                      style={{
                        backgroundPosition: `${
                          value.isOpend
                            ? borad[y][x].isBomb
                              ? 10 * -30
                              : borad[y][x].nearByBombs !== 0
                                ? (borad[y][x].nearByBombs - 1) * -30
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
