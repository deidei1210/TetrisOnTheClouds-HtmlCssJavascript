
    // 常量
    // 步长
    var STEP = 30;
    // 分割容器
    // 18行 ， 10列
    var ROW_COUNT = 18;
    var COL_COUNT = 10;
    // 用于记录一共消灭了多少行，获得了多少分
    var score=0;
    var lines=0;
    // 定义16宫格的模型源
    var MODELS = [
        // 第一个样式(L)
        {
            0: {
                row: 2,
                col: 0
            },
            1: {
                row: 2,
                col: 1
            },
            2: {
                row: 2,
                col: 2
            },
            3: {
                row: 1,
                col: 2
            },
        },
        // 第二个样式(凸)
        {
            0: {
                row: 1,
                col: 1
            },
            1: {
                row: 0,
                col: 0
            },
            2: {
                row: 1,
                col: 0
            },
            3: {
                row: 2,
                col: 0
            },
        },
        //  第三个样式(田)
        {
            0: {
                row: 1,
                col: 1
            },
            1: {
                row: 2,
                col: 1
            },
            2: {
                row: 1,
                col: 2
            },
            3: {
                row: 2,
                col: 2
            },
        },
        // 第四个样式(一)
        {
            0: {
                row: 0,
                col: 0
            },
            1: {
                row: 0,
                col: 1
            },
            2: {
                row: 0,
                col: 2
            },
            3: {
                row: 0,
                col: 3
            },
        },
        // 第五个样式(Z)
        {
            0: {
                row: 1,
                col: 1
            },
            1: {
                row: 1,
                col: 2
            },
            2: {
                row: 2,
                col: 2
            },
            3: {
                row: 2,
                col: 3
            },
        }
    ]

    // 当前的模型源
   var currentModel = {}
    // 16宫格所在的位置
    var currentX = 0;
    var currentY = 0;
    // 保存所有已经被固定的模块
    // K=行数_列数 : V=元素
    var fixedBlocks = {}
    // 定时器
    var mInterval = null;

    // 再元素创建完成之后回调
    function init() {
        createModel();
        onKeyDown();
    }

    // 生成对应模型
    function createModel() {
        // 在创建新模型之前，判断游戏是否已经结束了
        if (isGameOver()) {
            // 如果游戏已经结束了，那么就不需要再自动降落模型了
            gameOver();
            return;
        };
        // 随机生成当前的模型，MODELS.length表示的是Models数组的长度
        currentModel = MODELS[_.random(0, MODELS.length - 1)];
        // 初始化 16宫格的位置
        currentX = 0;
        currentY = 0;
        // 根据当前的数据源来创建对应数量的块元素
        //该语句也可以替换成for(var key=0;key<currentModel;key++)，这两种写法是同理的
        for (var key in currentModel) {
            //document.createElement:此函数用于在HTML中动态的添加一个元素
            var divEle = document.createElement("div");
            //给动态生成的这个元素取名为activity_model
            divEle.className = "activity_model";
            document.getElementById("container").appendChild(divEle);
        }
        // 定位元素
        locationBlocks();

        // 自动降落
        autoDown();
    }

    // 定位每个模型的位置
    function locationBlocks() {
        // 判断模块是否越界了
        checkBound();

        var eles = document.getElementsByClassName("activity_model");
        // 首先拿到对应的块元素
        for (var i = 0; i < eles.length; i++) {
            var blockEle = eles[i];
            // 获得当前元素形状的每一个小方块在九宫格中的相对位置
            var blockModel = currentModel[i];
            // 定位小方块，每一个小方块的位置是
            // (16宫格的位置+每一个小方块相对于16宫格的位置）*每一个小方块的边长
            blockEle.style.top = (currentY + blockModel.row) * STEP + "px";
            blockEle.style.left = (currentX + blockModel.col) * STEP + "px";
        }
    }

    // 监听键盘事件
    function onKeyDown() {
        //读取键盘按下的键
        document.onkeydown = function (event) {
            //根据键盘按下的键来选取对于小方块应有的操作
            switch (event.keyCode) {
                //可以给大家演示以下，这边的键码是怎么获得的
                case 73:
                    //在操作台输出自己按下的键的名称，便于检查
                    console.log("上");
                    //进行操作
                    rotate();
                    break;
                case 76:
                    console.log("右");
                    move(1, 0);
                    break;
                case 75:
                    console.log("下");
                    move(0, 1);
                    break;
                case 74:
                    console.log("左");
                    move(-1, 0);
                    break;
                }
                   
             }
                   

        }
    // 移动模型
    // x 表示在 X 轴移动的步数
    // y 表示在 y 轴移动的步数
    function move(x, y) {
        // 当模块进行移动的时候，需要判断将要移动到的位置是否可以移动，是否会与其他元素发生碰撞
        if (isMeet(currentX + x, currentY + y, currentModel)) {
            // 将要移动到的位置会发生碰撞
            // 并且碰撞是来自于底部的碰撞
            if (y !== 0) {
                fixedBottomModel();
            }
            return;
        }

        // 表示 16 宫格移动之后的距离
        currentX += x;
        currentY += y;
        // 带动模型移动
        locationBlocks();
    }

    // 模型的旋转
    function rotate() {
        // 当模块进行旋转时，需要判断将要旋转到的位置是否可以进行旋转，即判断其是否会越界
        //这里的_.cloneDeep函数是lodash工具库里面的函数，旨在进行元素的深拷贝
        var cloneCurrentModel = _.cloneDeep(currentModel);

        // 遍历模型数据源
        for (var key in cloneCurrentModel) {
            // 拿到对应的块模型数据
            var blockModel = cloneCurrentModel[key];
            // 实现算法，
            // 移动后的行 = 移动前的列
            // 移动后的列 = 3 - 移动前的行
            var temp = blockModel.row;
            blockModel.row = blockModel.col;
            blockModel.col = 3 - temp;
        }
        //将要旋转到的位置会越界，那么就不旋转，即不改变currentModel 
        if (isMeet(currentX, currentY, cloneCurrentModel)) {
            return;
        }

        currentModel = cloneCurrentModel;

        // 重新定位模型
        locationBlocks();
    }

    // 控制模型只能在容器中移动
    function checkBound() {
        // 定义容器边界
        var leftBound = 0,
            rightBound = COL_COUNT,
            bottomBound = ROW_COUNT;
        // 当每次模型移动了之后，我们来判断模型是否超出了边界
        for (var key in currentModel) {
            var blcokModel = currentModel[key];
            // 左侧越界
            if ((blcokModel.col + currentX) < leftBound) {
                currentX++;
            }
            // 右侧越界
            if ((currentX + blcokModel.col) >= rightBound) {
                currentX--;
            }
            // 底部越界
            if ((currentY + blcokModel.row) >= bottomBound) {
                currentY--;
                //当到达最底部的时候，需要将其固定在底部
                fixedBottomModel();
            }
        }
    }

    // 让方块固定在底部
    function fixedBottomModel() {
        // 1、当模块与底部进行接触的时候，执行该方法
        // 2、修改模型的样式，变为灰白色，改变模型类名
        // 3、不再允许模型移动了

        var eles = document.getElementsByClassName("activity_model");
        for (var i = eles.length - 1; i >= 0; i--) {
            var activityModelEle = eles[i];
            //将可移动的模型的类名改名成“固定的模型”
            activityModelEle.className = "fixed_model";

            // 把该模型添加到数据源中
            var blockModel = currentModel[i];
            // X: 16宫格所在的 X坐标位置+ 快元素在16宫格中的列数
            // Y：16宫格所在的 Y坐标位置 + 块元素在16宫格中的一个行数
            fixedBlocks[(currentY + blockModel.row) + "_" + (currentX + blockModel.col)] = activityModelEle;
        }

        // 判断一行是否被铺满了
        isRemoveLine();

        // 创建新的模型
        createModel();
    }

    // 处理模块之间的碰撞
    // x，y：是16宫格将要移动到的位置
    function isMeet(x, y, model) {
        // 判断当前活动的模型和固定的模型坐标是否重叠了
        // 判断被固定的数据源中是否可以根据当前活动的块元素位置得到对应的元素

        // 遍历当前模型，将块进行依次的对比
        for (var key in model) {
            var blcokModel = model[key];
            // 判断当前块元素所在的位置上是否已经有了其他的块元素了
            if (fixedBlocks[(y + blcokModel.row) + "_" + (x + blcokModel.col)]) {
                return true;
            }
        }
        return false;
    }

    // 判断一行是否被铺满
    function isRemoveLine() {
        // 如果一行中每一列都存在块元素，那么就表示该行已经被铺满了

        // 遍历所有行
        for (var i = 0; i < ROW_COUNT; i++) {
            // 计数器,记录每一行存在的块元素的数量
            var count = 0;
            // 遍历所有列
            for (var j = 0; j < COL_COUNT; j++) {
                //  判断改行该列是否存在块元素
                if (fixedBlocks[i + "_" + j]) {
                    count++;
                }
            }
            // 如果每一行中存在的块元素数量 === 列数，表示一行中每一列都存在块元素
            if (count === COL_COUNT) {
                lines++;
                score+=100;
                // 删除该行
                removeLine(i);
            }
        }
    }

    // 删除指定行
    function removeLine(line) {
        // 拿到当前行所有的块元素
        for (var i = 0; i < COL_COUNT; i++) {
            // 1、从容器中删除元素
            document.getElementById("container").removeChild(fixedBlocks[line + "_" + i]);
            // 2、从数据源中删除元素
            fixedBlocks[line + "_" + i] = null;
        }
        downLine(line);
    }

    // 让指定行之上的块元素下落
    function downLine(line) {
        // 让指定行之上的所有行中的每一列的块元素，向下移动 1 个步长
        // 遍历指定行之上的所有行
        for (var i = (line - 1); i >= 0; i--) {
            // 这些行中每一列元素
            for (var j = 0; j < COL_COUNT; j++) {
                // 如果当前列没有数据进入下一次循环
                if (!fixedBlocks[i + "_" + j]) continue;
                // 如果当前行的当前列存在块元素的话
                // 1、平移数据，把当前行的数据给下一行
                fixedBlocks[(i + 1) + "_" + j] = fixedBlocks[i + "_" + j];
                // 2、平移元素，让当前行的元素到下一行
                fixedBlocks[(i + 1) + "_" + j].style.top = (i + 1) * STEP + "px";
                // 3、清理掉平移之前的数据
                fixedBlocks[i + "_" + j] = null;
            }
        }
    }

    // 让模型自动下落
    function autoDown() {
        if (mInterval) {
            clearInterval(mInterval);
        }
        //当使用setInterval(callback, timer)时，每经过timer毫秒时间，系统都将调用一次callback。
        mInterval = setInterval(function () {move(0, 1);}, 600);
    }

    // 判断游戏结束
    function isGameOver() {
        for (var i = 0; i < COL_COUNT; i++) {
            // 当第0行存在块元素表示游戏结束
            if (fixedBlocks["0_" + i]) {
                return true;
            }
        }
    }

    // 结束掉游戏
    function gameOver() {
        alert("游戏结束，您一共消除了"+lines+"行，得分为"+score+"分，按确认退出！");
        window.close();
    }

