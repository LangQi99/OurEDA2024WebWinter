/**
 * 本文件是在构建 Wordle 程序过程中需要使用的脚本
 * ! 在编写代码之前请您务必仔细阅读每一行注释
 * 其中部分函数已经给出，需要您根据实际需求进行补全
 * 函数的具体作用请参考注释
 * 请确保所有的 TODO 都被补全
 * 若无特殊需要请尽量不要定义新的函数
 */

/**
 * Global Variables
 *
 * 您的所有全局变量需要在此处定义
 * 我们已经预先为您定义了一部分全局变量
 *
 * 请思考：
 *
 * 1. 为什么使用 let/const 来定义变量而不是 var 关键字
 * 2. let 和 const 关键字定义的变量有什么区别
 * 3. 已经被预定义的全局变量分别有怎样的作用
 */
// uuid 本场游戏唯一标识 用于延迟动画的截断
let uuid = crypto.randomUUID();
// 读取静态数据
const staticData = await fetch("../static/words.json").then((res) =>
    res.json()
);
// 固定的答案长度
const answerLength = 5;
// 最多尝试次数
const maxGuessTime = 6;

// Wordle 中出现的三种颜色，更推荐使用枚举
// 此处 grey 用字母 b 表示，具体原因请参见代码任务
const grey = "b";
const yellow = "y";
const green = "g";

// 颜色序列，类型为 string[]
let colorSequence = [];
// 单词序列，类型为 string[]
let wordSequence = [];

// 本次 Wordle 的答案
let answer = "";
// 当前猜测的答案
let guess = "";
// 当前已经使用的猜测次数
let currentGuessTime = 0;

/**
 * 程序当前的状态，更推荐使用枚举
 *
 * 预计会使用到的状态：
 * 1. "UNFINISHED": 表示 Wordle 未被解决即仍有剩余猜测次数
 * 2. "SOLVED": 表示当前 Wordle 已被解决
 * 3. "FAILED": 表示当前 Wordle 解决失败
 * 可以根据需要设计新的状态
 */
let state = "UNFINISHED";

/**
 * 预定义的 JavaScript 程序的入口
 * 请不要额外定义其他的程序入口
 */
start();

/**
 * start()
 *
 * 整个程序的入口函数，这里为了简化程序的运行逻辑违背了单一指责原则和最小权限原则，在实际开发时不推荐这样处理
 *
 * 您需要完成的任务：
 * 1. 初始化程序的运行状态
 * 2. 接收交互信息后改变内部状态并作出反馈
 *
 * 请思考：
 * 1. 在怎样的时刻需要调用 initialize 函数
 * 2. 程序的交互信息是什么（猜测的单词？）
 * 3. 内部状态会如何根据交互信息而改变（state 变量的作用？）
 * 4. 程序内部状态变化之后会作出怎样的反馈（页面重新渲染？）
 * 5. 如何读取交互信息
 * 6. 程序在什么时候会终止
 */
function start() {
    initialize();
    render();

    // 添加键盘点击事件监听
    document.querySelectorAll(".key").forEach((key) => {
        key.addEventListener("click", (e) => {
            const keyValue = e.target.getAttribute("data-key");
            handleKeyPress(keyValue);
        });
    });

    // 添加重新开始按钮事件监听
    document.getElementById("restart").addEventListener("click", () => {
        initialize();
        render();
    });
}

/**
 * render()
 *
 * 根据程序当前的状态渲染对应的用户页面
 *
 * 您需要完成的任务：
 * 1. 基于 DOM 实现程序状态和 HTML 组件的绑定
 * 2. 当程序内部状态发生改变时需要重新渲染页面
 *
 * 请思考：
 * 1. 什么是 DOM，这项技术有怎样的作用
 * 2. 如何实现程序内部状态和 HTML 组件的绑定，为什么要这么设计
 * 3. 应该在怎样的时刻调用 render 函数
 */
function render() {
    // 更新棋盘显示
    const board = document.getElementById("board");
    const rows = board.getElementsByClassName("row");

    // 渲染已猜测的单词
    for (let i = 0; i < currentGuessTime; i++) {
        const word = wordSequence[i];
        const colors = colorSequence[i];
        const tiles = rows[i].getElementsByClassName("tile");

        for (let j = 0; j < answerLength; j++) {
            const tile = tiles[j];
            tile.textContent = word[j].toUpperCase();
            // 添加翻转动画类

            // 使用延迟来创建连续翻转效果
            let delay = (j + 1) * 200; // 每个字母之间间隔200毫秒
            setTimeout(
                (animId) => {
                    if (animId !== uuid) return;
                    // 设置颜色样式
                    tile.classList.add("flip");
                },
                delay - 200,
                uuid
            );
            setTimeout(
                (animId) => {
                    if (animId !== uuid) return;
                    // 设置颜色样式
                    tile.classList.add("reveal");
                    if (colors[j] === green) {
                        tile.classList.add("correct");
                    } else if (colors[j] === yellow) {
                        tile.classList.add("present");
                    } else {
                        tile.classList.add("absent");
                    }
                },
                delay,
                uuid
            );
        }
    }
    // 清空未轮到的行
    for (let i = currentGuessTime; i < maxGuessTime; i++) {
        const tiles = rows[i].getElementsByClassName("tile");
        for (let j = 0; j < answerLength; j++) {
            tiles[j].textContent = "";
            tiles[j].classList = "tile";
        }
    }
    // 渲染当前输入
    if (currentGuessTime < maxGuessTime) {
        const tiles = rows[currentGuessTime].getElementsByClassName("tile");
        for (let i = 0; i < answerLength; i++) {
            tiles[i].textContent =
                i < guess.length ? guess[i].toUpperCase() : "";
        }
    }

    // 更新键盘颜色
    const keyElements = document.querySelectorAll(".key");
    const keyColors = new Map();

    // 收集所有已使用字母的最终颜色状态
    for (let i = 0; i < colorSequence.length; i++) {
        const word = wordSequence[i];
        const colors = colorSequence[i];

        for (let j = 0; j < word.length; j++) {
            const letter = word[j].toUpperCase();
            const color = colors[j];

            if (
                !keyColors.has(letter) ||
                color === green ||
                (color === yellow && keyColors.get(letter) === grey)
            ) {
                keyColors.set(letter, color);
            }
        }
    }

    keyElements.forEach((key) => {
        const letter = key.getAttribute("data-key");
        const color = keyColors.get(letter);

        key.className = "key";
        if (color === green) {
            key.classList.add("correct");
        } else if (color === yellow) {
            key.classList.add("present");
        } else if (color === grey) {
            key.classList.add("absent");
        }
    });
}

/**
 * initialize()
 *
 * 初始化程序的状态
 *
 * 请思考：
 * 1. 有哪些状态或变量需要被初始化
 * 2. 初始化时 state 变量处于怎样的状态
 */
function initialize() {
    uuid = crypto.randomUUID();
    answer = generateRandomAnswer();
    // TODO
    state = "UNFINISHED";
    currentGuessTime = 0;
    guess = "";
    wordSequence = [];
    colorSequence = [];
}

/**
 * generateRandomAnswer()
 *
 * 从题库中随机选取一个单词作为答案
 *
 * 单词文件位于 /static/words.json 中
 *
 * 请思考：
 * 1. 如何读取 json 文件
 * 2. 如何随机抽取一个单词
 *
 * @return {string} answer
 */
function generateRandomAnswer() {
    const words = staticData.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

/**
 * isValidWord()
 *
 * 判断一个单词是否合法
 *
 * 请思考：
 * 1. 判断一个单词是否合法的规则有哪些
 * 2. 是否存在多条判断规则
 * 3. 如果上条成立，那么这些规则执行的先后顺序是怎样的，不同的执行顺序是否会对单词的合法性判断造成影响
 * 4. 如果单词不合法，那么程序的状态会如何变化，程序应当作出怎样的反馈
 *
 * @param {string} word
 * @return {boolean} isValid
 */
function isValidWord(word) {
    const words = staticData.words;
    return words.includes(word);
}

/**
 * handleAnswer()
 *
 * 处理一次对单词的猜测，并根据其猜测结果更新程序内部状态
 *
 * 请思考：
 * 1. 是否需要对 guess 变量的字符串作某种预处理，为什么
 *
 * @param {string} guess
 */
function handleAnswer(guess) {
    guess = guess.toLowerCase();
    const color = calculateColorSequence(guess, answer);
    wordSequence.push(guess);
    colorSequence.push(color);
    const correctColor = Array(answerLength).fill(green).join("");
    if (color === correctColor) {
        state = "SOLVED";
    } else if (currentGuessTime >= maxGuessTime) {
        state = "FAILED";
    }
}

/**
 * calculateColorSequence()
 *
 * 计算两个单词的颜色匹配序列
 *
 * 例如：
 * 给定 answer = "apple", guess = "angel"
 *
 * 那么返回结果为："gbbyy"
 *
 * 请思考：
 * 1. Wordle 的颜色匹配算法是如何实现的
 * 2. 有哪些特殊的匹配情况
 *
 * @param {string} guess
 * @param {string} answer
 * @return {string} colorSequence
 */
function calculateColorSequence(guess, answer) {
    // Time: 1019ms Passed: 213 Failed: 0
    // https://www.codewars.com/kata/62013b174c72240016600e60/train/javascript
    let colorSequence = Array(answerLength).fill(grey);
    let matchDict = {};
    let countDict = {};
    for (let c = "a"; c <= "z"; c = String.fromCharCode(c.charCodeAt(0) + 1)) {
        matchDict[c] = 0;
        countDict[c] = 0;
    }
    for (let i = 0; i < answer.length; i++) {
        countDict[answer[i]]++;
    }
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === answer[i]) {
            colorSequence[i] = green;
            matchDict[guess[i]]++;
        }
    }
    for (let i = 0; i < guess.length; i++) {
        if (
            guess[i] !== answer[i] &&
            answer.includes(guess[i]) &&
            matchDict[guess[i]] < countDict[guess[i]]
        ) {
            colorSequence[i] = yellow;
            matchDict[guess[i]]++;
        }
    }
    return colorSequence.join("");
}

function handleKeyPress(key) {
    if (state === "FAILED" || state === "SOLVED") return;
    if (key === "ENTER") {
        if (!isValidWord(guess)) {
            return;
        }
        handleAnswer(guess);
        guess = "";
        currentGuessTime++;
        render();
    } else if (key === "BACKSPACE") {
        guess = guess.slice(0, -1);
        render();
    } else if (guess.length < answerLength) {
        guess += key.toLowerCase();
        render();
    }
}
