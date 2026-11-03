# 全界面升级与现有内容收尾

日期：2026-11-03。基于第二轮 `ee3be4c`，继续使用 `art/primordial-rebuild` 与 [PR #1](https://github.com/mistwood38/honghuang-ji/pull/1)。不合并 main、不发布正式版本。

## 最终界面方向

六个核心页面统一为“玄玉漆金、电影叙事”：场景原画延伸进克制的背景层，界面使用深青漆面、嵌铜边缘、苍玉文字和古金层级。入世采用暗色阅读与抉择面板，本纪保留纸本长文。手机采用安全区底部玉签导航，桌面采用悬浮章签。

| 页面 | 本轮实际改动                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| 开始 | 本地授权书法字标、细金外框、开天原画的构图与标题比例；手机三字保持同排                                       |
| 入世 | 一体化电影场景与玄玉叙事台、嵌铜抉择、四根骨印记、逐项属性变化牌、可回看的剧情定位条、按根骨变化的桌面人物栏 |
| 山河 | 真正绘制的天地分层舆图、原六浮标、全部14地志的场景缩图、所至与当前标识、完整四重天地说明                     |
| 我的 | 四根骨专属匿名立绘、姓名/境界题签、首屏六相玉册、9器物原画图标卡、暗玉因果时间线及完整前尘                   |
| 本纪 | 书脊、纸页切口、章头铭牌、卷册与当前卷标记；原14章、卷首、字号、目录与翻章保留                               |
| 天书 | 玉简式篇目、镶铜分类、编号简牌与完整检索区；原9类18篇、搜索高亮和展卷状态保留                                |
| 结局 | 全9个原结局统一增加归处印、此生计数与抄录/轮回收束；原文、条件旁白和操作均完整保留                           |

## 本轮真实素材

新增6组原创图片，每组均有手机版：

- `origin-wu`、`origin-yao`、`origin-ren`：巫骨、妖形、人愿的匿名象征立绘。与既有道胎 `pilgrim` 合为四组，不固定玩家性别，不新增身份、装备或属性。
- `relic-icons`：严格3×3的9器物绘画图集，对应混沌气、盘古骨、紫气、诛仙剑意、巫血、钟声、息壤、不周石、人族香火。物名与说明仍读取原ITEMS，未新增稀有度。图标是象征性视觉，剑意不是新增实体武器。
- `world-atlas`：天宫、大地山海与幽冥的分层宇宙意象图，不宣称精确地理比例。
- `fengshen`：空白长卷与封神古台，用于封神台、空白的榜、最终抉择、上榜结局和本纪封神章。

现共18组本地图片、36个WebP，约5.3MB；并非首屏全部加载。新立绘手机图约65–75KB；9图标共用一个手机图集约51KB；书法字标字体子集约2.1KB。舆图细节较多，手机图约137KB、桌面图约485KB。

来源、完整提示词、尺寸与限制见 [根骨立绘记录](../public/art/origin-portraits.md)、[舆图/封神/器物记录](../public/art/premium-artkit.md)。均在本任务原创生成，没有商业游戏素材或运行时图片外链。

字标使用 Ma Shan Zheng，仅取“洪荒纪”三字；Copyright 2018 The Ma Shan Zheng Project Authors，SIL Open Font License 1.1。原上游 <https://github.com/google/fonts/tree/main/ofl/mashanzheng>，授权附于 `public/fonts/MaShanZheng-OFL.txt`；正文继续使用已附OFL授权的本地Noto Serif子集。

## 验证

| 检查                | 结果                                                     |
| ------------------- | -------------------------------------------------------- |
| `npm run typecheck` | 通过                                                     |
| `npm run lint`      | 通过，0错误/0警告                                        |
| `npm test`          | 256/256通过，包含197项脚本和59项TS                       |
| 原玩法测试          | 单独6/6通过                                              |
| `npm run build`     | 通过，沿用Nitro/Vercel与原迁移流程                       |
| 核心不变性          | store、engine、story、world、novel、types 与 main 无差异 |

高级浏览器脚本 `scripts/premium-browser-qa.mjs` 先运行上一轮完整50项检查，再增加10组专项：

1. 320×740、390×844、1440×1000、844×390四视口的六页布局、真实图片解码、底栏可达和横向溢出。
2. 剧情、选项主句、小说与天书正文的计算对比度采样。开发版16个样本为9.52–11.87，均高于4.5；这不是全站无障碍认证。
3. 四种根骨分别恢复、正确加载立绘并验证原数据不变。
4. 9个原器物名称与图集九格位置、手机/桌面真实图片加载。
5. 全部14地志逐一查看，地图不改变剧情或属性。
6. 封神三个页面使用真实新原画，原状态不变。
7. 全部9个既有结局的原文、条件旁白、动作和展示存档不变。

九结局检查使用原格式展示夹具，验证页面完整性；实际完整玩法通关与归档由原50项里的证道路线覆盖，不宣称九条路线均通关。旧版v1逐字段恢复、数字键守卫、静音、减少动态效果、弹窗焦点与轮回继续由原50项验证。

开发版：[验收结果](../screenshots/premium/verdict.json) / [原50项结果](../screenshots/premium/base-verdict.json)。生产构建：[验收结果](../screenshots/premium-production/verdict.json)。

复现：

```bash
node --experimental-strip-types scripts/premium-browser-qa.mjs http://127.0.0.1:8080/ screenshots/premium
```

生产构建执行 `npm run preview:restart`，将目标换为8081、目录换为 `screenshots/premium-production`。浏览器使用项目Playwright与系统Chromium，未把HTTP200当成渲染成功。

## 实拍

| 画面     | 截图                                                          |
| -------- | ------------------------------------------------------------- |
| 手机封面 | [书法字标与开天封面](../screenshots/premium/title-mobile.png) |
| 桌面封面 | [封面全景](../screenshots/premium/title-desktop.png)          |
| 手机入世 | [玄玉叙事台](../screenshots/premium/play-mobile.png)          |
| 山河     | [分层天地舆图](../screenshots/premium/land-desktop.png)       |
| 人物     | [根骨立绘与六相](../screenshots/premium/self-desktop.png)     |
| 器物     | [九器物图标卡](../screenshots/premium/self-items-mobile.png)  |
| 本纪     | [纸本装帧](../screenshots/premium/novel-mobile.png)           |
| 天书     | [玉简百科](../screenshots/premium/codex-desktop.png)          |
| 结局     | [归处与收束](../screenshots/premium/ending-mobile.png)        |

前轮纸本入世、地图、人物与阅读截图仍保留在 `screenshots/refinement/` 和 `screenshots/after/`，原 main 在 `screenshots/before/`。

## 验收边界

本轮已把现有六页、四根骨、九器物和九结局的表现统一完成。没有新增剧情、属性、任务、传送、账号或存档协议；立绘与图标只由原字段选择。未知器物保留原ID文字，未知根骨使用原匿名形象。

部分山岳、天界与混沌仍共用主题原画，未为每一名设定人物绘制NPC立绘，也未制作逐帧角色动画。未在实体安卓机上进行长期帧率/内存和扬声器听感测试；当前证据是资源规格与真实Chromium验证，不把模拟视口等同实体设备测试。
