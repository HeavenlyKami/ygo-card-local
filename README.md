自用印卡器

此repo基于https://github.com/ymssx/ygo-card/wiki, 是为了能够简单灵活地打印官方游戏王卡(而非DIY卡)而设计。
为了代码整洁，其它个人不需要的功能皆已去除。

我们在原repo能够根据卡片数据合成卡片的canvas图像的基础上，实现了如下功能：
1. 根据输入的一系列卡片编号，一键生成所有卡片jpg 
    (卡片数据基于YGOPRO，卡面图像来自YMSSX与YGOPRO的数据库)
2. 根据1.的输入与输出，一键生成可供打印的A4尺寸图像或者pdf文件，包括已对齐的卡背图像
3. 为了减少裁剪时的白边，为卡框增加了溢出效果
4. 使用者可以为某张卡手动指定卡面图像（只有卡图或整张卡面的图像皆可）

使用环境：
操作系统：我个人使用的是linux，mac应该也可。windows环境下有可能出现字体无法正确加载的问题。
// TODO：解决windows平台下canvas无法正确loadFont的问题
npm与node: 我个人使用的是npm 8 与 node 14，但只要是适当的版本应该皆可
sqlite3(可选)：此repo内包含了一个YGOPRO的卡片数据库。但如果要印非常新的卡片，请考虑使用sqlite3更新此数据库(方法写在后文)

使用方法：
1.运行npm install 安装依赖
2.(可选) 如果用户更改了source文件夹下的代码，运行npm run-script build重新打包
3.在main/input.txt文件内填入需要打印的卡片编号，每行限一个
    （会自动舍弃非数字串的行，可以直接复制YDK进来）
4.运行npm run-script render，会在main/output文件夹下，生成每张卡的图片。
    卡面图像的选择次序为 用户自已找到的卡面 -> YMSSX的卡图库 -> YGOPRO的卡图库。卡面的选择会显示在log中
    其中YMSSX卡图库质量较高且为OCG卡图，所以优先度高于YGOPRO，但其只有老卡，不包含新卡
    YGOPRO的卡图最全，但质量不稳定
    所以用户可能会想替换某张卡片的卡面，以使用 
        ①异画卡面
        ②OCG/TCG版本的卡面 
        ③更高清的卡面
        ④自己喜爱的DIY卡面
    这时，请将自己找到的卡面放入main/imgLibrary下面，格式为[卡片编号].jpg或[卡片编号].png
    注意，如果卡片编号以'0'为开头，请将'0'去除
5.检查main/output下生成的图片。如果发生了字体加载失败、找不到卡片信息/卡图等错误，可以在log中找到线索。
6.运行npm run-script print，会读取main/output文件夹下的卡片卡图，合成为用来直接打印的A4尺寸图像。
    如果用户想替换某张卡片的整张卡的图像，也可以在这一步之前用自己的图片替换main/output下的对应图。
    可以在to-print.js内开关出血效果(默认为开)，与调整输出格式到pdf(默认为jpg)
7.输出的图片同样位于main/output下，包括卡背的图像
8.目前只打印中文卡。若想打印日文卡，可以从 https://ygobbs.com/t/游戏王高清日语卡图/143511 下载卡图放到main/output下，并用print指令打印。


TODO：添加更改卡名颜色的设置，以打印闪卡
TODO：添加打印英文版卡片的途径 
TODO：添加打印Token卡片的功能(目前无法打印Token)



更新YGO卡片数据库的方法：
1.在其它地方clone这个repo https://github.com/mycard/ygopro-database
2.进入此repo并git branch dump
3.安装sqlite3，然后运行 sqlite3 YgoText.db < locales/zh-CN/cards.cdb.sql
    这个指令会运行设置好的sql命令，生成一个db文件
4.将这个文件拷贝到本repo的根目录下，替换已有的YgoText.db文件