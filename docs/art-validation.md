# 美术重建验收

本文件保留第一轮验收记录。后续原画、交互和检查修复请见 [第二轮验收](refinement-validation.md)。

日期：2026-11-02。原 main 基线 `71dda56`；工作分支 `art/primordial-rebuild`。没有合并 main 或发布正式版本。

## 实际完成

| 页面 | 交付行为                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 开始 | 开天原画封面、古金标题入场、云气/符文/天光、继续旧因果、声音开关、三类世界阅览                         |
| 入世 | 既有剧情到原画的映射、场景转场、明暗分层、纸本叙事、印章选项、原属性提示、桌面人物状态栏与手机紧凑六相 |
| 山河 | 山河意象图、地名点选、完整14地志、地域分类、已至/当前标记、四重天地说明；没有移动功能                  |
| 我的 | 匿名灵识立绘、根骨印记、境界与六属性、道号、器物静物、原物品说明、因果时间线、前尘、原存档操作         |
| 本纪 | 全14章原文、卷册目录、手机折叠目录、纸本阅读、字号、章节跳转和原阅读进度                               |
| 天书 | 全9类18篇原设定、原画扉页、分类、全文检索、数量、空结果恢复、批量展卷与单篇展开                        |

四组场景、人物与器物两组，共六幅原创原画、十二个本地 WebP 文件，另含本地授权宋体。云雾等装饰由少量 CSS 层实现；没有增加游戏渲染引擎或第三方动效依赖。

## 自动检查

| 检查                   | 结果与范围                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 干净安装               | 独立目录复制 package.json/lock，`npm ci --ignore-scripts --no-audit --no-fund` 成功（423 packages）。原 lock 缺项已修复，依赖声明未改 |
| `npm run typecheck`    | 通过                                                                                                                                  |
| `npm run build`        | 通过；Nitro/Vercel 构建成功。无 DATABASE_URL 时原 migrate 脚本按既定设计跳过，游戏不用数据库                                          |
| 改动文件 ESLint        | 通过，含新增浏览器回归脚本                                                                                                            |
| 原玩法测试             | `node --experimental-strip-types --test src/lib/honghuang/balance.test.ts`，6/6通过                                                   |
| 原独立 TypeScript 测试 | 59/59通过（原 npm test 的第二段，因第一段失败而另行执行）                                                                             |
| `npm test`             | 脚本测试189/197通过，8项失败，与原 main 基线一致；详见下方                                                                            |
| `npm run lint`         | 2项错误，与原 main 基线一致；详见下方                                                                                                 |
| 核心不变性             | `git diff --exit-code main -- src/lib/honghuang/{store,engine,story,world,novel,types}.ts` 无差异                                     |

原平台脚本失败均位于 `scripts/grok-pwa-plugin.test.mjs`：测试隐式读取项目已有 `src/lib/og/site.json`，但夹具断言仍期待平台默认标题/分享卡。失败测试起始行105、246、258、296、348、373、395、432。本次保留平台实现和品牌资源，未为美术重建重写平台测试。

原 Lint 错误为 `src/lib/app-data/client.server.ts:281` 的 `no-empty`、`src/lib/honghuang/balance.test.ts:44` 的 `prefer-const`；均未由本次修改产生。没有将这两项命令宣称为通过。

构建仍有框架依赖的 `use client` 指令打包提示；构建成功且实际浏览器复测。构建产物沿用原流程生成，不将本次机器生成的 `.vercel/output` 差异提交为源代码。

## 浏览器回归

使用项目 Playwright 与系统 Chromium，真实渲染开发版及生产构建。当前环境没有 Grok `agent-browser`，采用 Playwright 完成交互，不依赖纯 HTTP 状态码。可复现脚本：`scripts/art-browser-qa.mjs`。

视口：390×844、320×740、1440×1000。检查六个核心页面、开天、不周折与旧档恢复；逐屏检查可见内容、图片、控制台、页面异常与横向溢出。

- 从无存档开始，道号、根骨、点击选择与数字键推进，结果逐项等于原引擎计算。
- 全部导航可用；地图分类及地名点选不改变 sceneId、seen、stats、log、items、flags。
- 本纪14章目录、前后章、字号和第8章的保存恢复正常；天书分类、全文检索、无结果清除、展开收拢正常。
- 道号、静音偏好刷新后保留；静音推进不会创建 AudioContext，音频不要求自动播放许可。
- 将原版真实 v1 路线夹具写入隔离浏览器，逐字段核对属性、道具、因果、生平、所至、阅读、静音及前尘。
- 系统减少动态效果时，采样标题和氛围动画均为 none。

开发版结果见 `screenshots/after/verdict.json`。生产构建结果及结局/重开检查另见 `screenshots/production/verdict.json`。

## 前后对照

以下是同一手机/桌面视口的实拍；长页面为完整滚动截图，因此固定底栏显示在初始视口底部。

| 页面        | 修改前                                          | 修改后                                         |
| ----------- | ----------------------------------------------- | ---------------------------------------------- |
| 封面 · 手机 | [原图](../screenshots/before/title-mobile.png)  | [新图](../screenshots/after/title-mobile.png)  |
| 入世 · 手机 | [原图](../screenshots/before/play-mobile.png)   | [新图](../screenshots/after/play-mobile.png)   |
| 山河 · 桌面 | [原图](../screenshots/before/land-desktop.png)  | [新图](../screenshots/after/land-desktop.png)  |
| 我的 · 手机 | [原图](../screenshots/before/self-mobile.png)   | [新图](../screenshots/after/self-mobile.png)   |
| 本纪 · 手机 | [原图](../screenshots/before/novel-mobile.png)  | [新图](../screenshots/after/novel-mobile.png)  |
| 天书 · 桌面 | [原图](../screenshots/before/codex-desktop.png) | [新图](../screenshots/after/codex-desktop.png) |

其他视口与关键场景保留在同目录。

## 尚未覆盖与素材限制

四幅场景按既有地点和事件共用，未完成每个地点、每名神灵、每件法宝的专属插画，也没有逐帧角色动画。地图是意象地志，不是精确地图。人物是统一的匿名灵识视觉，根骨仅影响印记与状态表现。

尚未使用实体安卓机测试，也未做低端手机的长时间内存/帧率实测；当前证据是 Chromium 三种视口的布局与功能验证。音效采用程序合成铜磬，已验证音频开关、手势和静音行为，未做实体扬声器听感验收。不将以上范围之外的质量宣称为已验证。
