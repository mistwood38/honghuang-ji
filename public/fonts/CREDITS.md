# 正文字体

`honghuang-song.woff2` 是 Noto Serif CJK SC Regular 2.003 的横排网页子集。

- 原项目：https://github.com/notofonts/noto-cjk/tree/main/Serif
- 原版权：© 2017–2024 Adobe (http://www.adobe.com/).
- 授权：SIL Open Font License 1.1，见同目录 [OFL.txt](OFL.txt)。
- 本轮来源：环境安装的 `NotoSerifCJK-Regular.ttc`，字体索引 2（SC）。
- 使用 fontTools 子集化，合并上一版本全部 1,197 个 Unicode 码位与 `src/` 中 TS、TSX、CSS 的汉字；保留共 1,954 个码位，新增 757 个，既有字符零丢失。
- 横排保留 `kern, liga, clig, calt`，去除本游戏未用的竖排／本地化替换字形闭包；输出 WOFF2 为 487,716 字节，旧版为 537,904 字节。

游戏仍为未收录的新文字配置系统中文字体回退。字标子集 `honghuang-title.woff2` 的许可另见 `MaShanZheng-OFL.txt`。
