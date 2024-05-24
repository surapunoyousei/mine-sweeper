import { useState, useEffect, useRef } from 'react';
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

const defaultConfigs: {
  [key: number]: { width: number; height: number; bombs: number };
} = {
  0: {
    width: 9,
    height: 9,
    bombs: 10,
  },
  1: {
    width: 16,
    height: 16,
    bombs: 40,
  },
  2: {
    width: 30,
    height: 16,
    bombs: 99,
  },
};

const items: [
  { level: number; item: string },
  { level: number; item: string },
  { level: number; item: string },
  { level: number; item: string },
] = [
  { level: -1, item: 'カスタム' },
  { level: 0, item: '初級' },
  { level: 1, item: '中級' },
  { level: 2, item: '上級' },
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
  // Timer の実装
  // タイマーの実装
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerFunctions = {
    resetTimer: () => {
      setSeconds(0);
      setIsRunning(false);
    },

    startTimer: () => {
      if (seconds < 999) {
        setIsRunning(true);
      }
    },

    stopTimer: () => {
      setIsRunning(false);
    },
  };

  useEffect(() => {
    if (isRunning && seconds < 999) {
      timerRef.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, seconds]);

  // ゲームの設定保存
  const [mineSweeperConfig, setMineSweeperConfig] = useState({
    level: -1,
    width: 9,
    height: 9,
    bombs: 10,
  });
  const clonedMineSweeperConfig = structuredClone(mineSweeperConfig);

  // ゲームの設定呼び出し用
  const config: {
    level: number;
    width: number;
    height: number;
    bombs: number;
    isCustom: boolean;
  } = {
    level: clonedMineSweeperConfig.level,
    get width() {
      return clonedMineSweeperConfig['level'] === -1
        ? clonedMineSweeperConfig['width']
        : defaultConfigs[clonedMineSweeperConfig['level']]['width'];
    },
    get height() {
      return clonedMineSweeperConfig['level'] === -1
        ? clonedMineSweeperConfig['height']
        : defaultConfigs[clonedMineSweeperConfig['level']]['height'];
    },
    get bombs() {
      return clonedMineSweeperConfig['level'] === -1
        ? clonedMineSweeperConfig['bombs']
        : defaultConfigs[clonedMineSweeperConfig['level']]['bombs'];
    },
    get isCustom() {
      return clonedMineSweeperConfig['level'] === -1;
    },
  };

  const getBoard = () => {
    return Array.from({ length: config.height }, () =>
      Array.from({ length: config.width }, () => 0),
    );
  };

  // 0 -> 未クリック
  // 1 -> 左クリック
  // 2 -> はてな
  // 3 -> 旗
  // 4 -> クリック済み
  const [userInputs, setUserInputs] = useState(getBoard());

  // 0 -> 爆弾なし
  // 1 -> 爆弾あり
  // 2 -> ゲームオーバーの原因の爆弾
  const [bombMap, setBombMap] = useState(getBoard());

  const clonedUserInputs = structuredClone(userInputs);
  const clonedBombMap = structuredClone(bombMap);

  const getNearByBombs = (x: number, y: number) => {
    let count = 0;
    directions.map((direction) => {
      const nx = x + direction[0];
      const ny = y + direction[1];
      if (nx < 0 || nx >= config.width || ny < 0 || ny >= config.height) {
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
    return (
      clonedUserInputs.flat().filter((value) => value === 4).length ===
      config.width * config.height - config.bombs
    );
  };

  const shouldBeDisableInput = isGameOver() || isUserWon();

  /*セルのクリック処理。左右クリック両方とも*/
  const handleCellClick = (x: number, y: number) => {
    if (shouldBeDisableInput || borad[y][x].value === 3) {
      return;
    }

    if (isFirstInput) {
      setBomb(x, y).then(() => {
        digcell(x, y);
      });
      timerFunctions.startTimer();
    } else {
      digcell(x, y);
    }
  };

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
      config.bombs,
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
      x >= config.width ||
      y < 0 ||
      y >= config.height ||
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
      timerFunctions.stopTimer();
      return;
    }

    if (isUserWon()) {
      timerFunctions.stopTimer();
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
    setUserInputs(getBoard());
    setBombMap(getBoard());
    timerFunctions.resetTimer();
  };

  return (
    <div className={styles.container}>
      <div id={styles.objects}>
        <div id={styles.config}>
          <div id={styles.customConfig}>
            <div>
              <label className={styles.labelConfigs}>横セル：</label>
              <input
                className={styles.inputConfigs}
                disabled={!config.isCustom}
                value={config.width}
                type="number"
                min={8}
                max={40}
                onChange={(e) => {
                  clonedMineSweeperConfig['width'] = Number(e.target.value);
                  setMineSweeperConfig(clonedMineSweeperConfig);
                  resetGame();
                }}
              />
            </div>
            <div>
              <label className={styles.labelConfigs}>縦セル：</label>
              <input
                className={styles.inputConfigs}
                disabled={!config.isCustom}
                value={config.height}
                type="number"
                min={8}
                max={40}
                onChange={(e) => {
                  clonedMineSweeperConfig['height'] = Number(e.target.value);
                  setMineSweeperConfig(clonedMineSweeperConfig);
                  resetGame();
                }}
              />
            </div>
            <div>
              <label className={styles.labelConfigs}>爆弾数：</label>
              <input
                className={styles.inputConfigs}
                disabled={!config.isCustom}
                value={config.bombs}
                type="number"
                min={1}
                max={config.height * config.width - 1}
                onChange={(e) => {
                  clonedMineSweeperConfig['bombs'] = Number(e.target.value);
                  setMineSweeperConfig(clonedMineSweeperConfig);
                  resetGame();
                }}
              />
            </div>
          </div>
          <div id={styles.customConfig}>
            {items.map((item) => {
              return (
                <label key={item.level}>
                  <input
                    type="radio"
                    value={item.item}
                    onChange={() => {
                      clonedMineSweeperConfig['level'] = item.level;
                      setMineSweeperConfig(clonedMineSweeperConfig);
                      resetGame();
                    }}
                    checked={config.level === item.level}
                  />
                  {item.item}
                </label>
              );
            })}
          </div>
        </div>
        <div id={styles.contents}>
          <div id={styles.leftSidePanel} className={styles.hSidePanels} />
          <div
            id={styles.center}
            style={{
              width: `${30 * config.width + 10}px`,
            }}
          >
            <div id={styles.topSidePanel} className={styles.vSidePanels} />
            <div id={styles.header}>
              <div id={styles.bcounter} className={styles.counters}>
                <div className={styles.numberCounts} id={styles.first_bcounter_number}>
                  {isUserWon()
                    ? 0
                    : config.bombs - clonedUserInputs.flat().filter((value) => value === 3).length}
                </div>
              </div>
              <div
                id={styles.fbutton}
                onClick={() => resetGame()}
                style={{ backgroundPosition: `${isGameOver() ? 38 : isUserWon() ? 73 : 108}px` }}
              />
              <div id={styles.tcounter} className={styles.counters}>
                <div className={styles.numberCounts} id={styles.first_bcounter_number}>
                  {seconds < 999 ? seconds : 999}
                </div>
              </div>
            </div>
            <div id={styles.topSidePanel} className={styles.vSidePanels} />
            <div id={styles.main}>
              <div
                id={styles.board}
                style={{
                  height: `${30 * config.height + 10}px`,
                  width: `${30 * config.width + 10}px`,
                }}
              >
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
    </div>
  );
};

export default Home;
