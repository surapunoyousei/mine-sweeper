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

const getRandomArbitrary = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const Home = () => {
  // const [samplePos, setSamplePos] = useState(0);
  // () => setSamplePos( p => (p + 1) % 14 )
  // `${-30 * samplePos}px 0px`

  // 0 -> 未クリック
  // 1 -> 左クリック
  // 2 -> はてな
  // 3 -> 旗
  const [userInputs, setUserInputs] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
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
  const [bombMap, setBombMap] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  const clonedUserInputs = structuredClone(userInputs);

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
    isBomb: number;
    nearByBombs: number;
  }[][] = [];
  userInputs.map((aArray, y) => {
    borad.push([]);
    aArray.map((value, x) => {
      borad[y].push({
        value,
        isOpend: value === 1,
        isBomb: bombMap[y][x],
        nearByBombs: getNearByBombs(x, y),
      });
    });
  });

  /*
  const isUnInitializedBoard = () => {
    return borad.every((row) => row.every((aObj) => aObj.value === 0));
  };
  */

  return (
    <div className={styles.container}>
      <div id={styles.header} />
      <div id={styles.board}>
        {borad.map((row, y) =>
          row.map((value, x) => (
            <div
              className={styles.cell}
              key={`${x} + ${y}`}
              data-state={userInputs[y][x]}
              onClick={(e) => {
                clonedUserInputs[y][x] = 1;
                setUserInputs(clonedUserInputs);
              }}
            >
              <div
                className={styles.displayIcons}
                data-state={userInputs[y][x]}
                style={{
                  backgroundPosition: `${
                    borad[y][x].isBomb === 1
                      ? 10 * -30
                      : borad[y][x].nearByBombs !== 0
                        ? (borad[y][x].nearByBombs - 1) * -30
                        : 30
                  }px 0px`,
                }}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default Home;
