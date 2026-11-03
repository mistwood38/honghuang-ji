# 洪荒纪

一款在浏览器里玩的洪荒神话文字游戏：应答混沌、穿过大事件、决定自己的一生；也可以独立阅读《混沌本纪》与天书。

本分支完成六个核心页面的美术重建：开天封面、剧情场景、山河图鉴、灵识立绘、纸本古籍与分类天书。当前版采用玄玉漆金界面，加入四根骨形象、九器物图标、天地舆图、封神场景与完整结局收束。保留原剧情、数值、结局与 v1 本地存档。所有新增原画和中文字体均保存在项目内。

## 本地运行

建议使用 Node.js 22.18+ 或 24（原项目使用 Node 22，本次实测 Node 24）。

```bash
npm ci
npm run dev
```

开发服务默认在 `http://localhost:8080`，无需账户、外部图片服务或数据库配置。存档保存在当前浏览器的 `honghuang-ji-save`；请保持原访问域名和浏览器数据，存档不会跨域名自动转移。手机安装包的做法见 [Android 安装说明](docs/android.md)。


```bash
npm run typecheck
npm run build
npm run lint
npm test
node --experimental-strip-types --test src/lib/honghuang/balance.test.ts
```

原 `npm test` 未包含洪荒玩法测试，因此最后一条应单独运行。第二轮已隔离原有平台测试夹具并清理两处 Lint 问题；当前完整测试和 Lint 均通过，具体结果见 [当前版验收](docs/premium-upgrade.md)。

## 浏览器验收

安装 Playwright Chromium，或设置系统 Chromium 路径，再启动开发服务：

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium node scripts/art-browser-qa.mjs
```

追加 `--refinement` 会运行原有全部流程及第二轮专项检查，并仅保存少量新增截图。

默认检查 `http://127.0.0.1:8080/`，覆盖 390px、320px 手机与 1440px 桌面。脚本支持用第一个参数指定目标 URL、第二个参数指定截图目录，详见脚本。它使用独立浏览器上下文，不会访问真实用户的存档。

当前版全套检查可运行 `node --experimental-strip-types scripts/premium-browser-qa.mjs`，会先复用上述50项回归，再验证新界面、四根骨、九器物、14地志和9结局展示。

## 美术与兼容性记录

- [美术规范、素材与授权](docs/art-direction.md)
- [当前版全界面升级、素材与实拍](docs/premium-upgrade.md)
- [第二轮验收结果与新增截图](docs/refinement-validation.md)
- [第一轮验收与原始前后对照](docs/art-validation.md)
- [原 v1 存档契约与回归夹具](docs/compatibility-review.md)
- [场景原画来源与提示词](public/art/scenes.md)
- [人物及器物来源与提示词](public/art/pilgrim-relics.md)
- [地域原画一](public/art/regional-scenes-a.md) / [地域原画二](public/art/regional-scenes-b.md)
- [根骨立绘来源](public/art/origin-portraits.md) / [器物图集与舆图来源](public/art/premium-artkit.md)
- [正文字体授权](public/fonts/OFL.txt) / [字标字体授权](public/fonts/MaShanZheng-OFL.txt)

`src/lib/honghuang/visuals.ts` 负责既有场景/地点到美术的映射；引擎、存档、故事、小说和世界数据保持原样。地图只供地志浏览，不提供移动或传送；人物形象按既有根骨选择，器物图标按既有ID选择。血海、东海、娲皇、人族火塘、蓬莱、幽冥已补充专属意象原画；其他场景仍部分共用，尚未为每名神灵或物品制作独立原画。

`screenshots/premium/` 提供当前界面实拍；`screenshots/before/`、`screenshots/after/` 与 `screenshots/refinement/` 保留前轮对照。此次仅提交独立开发分支及 PR，不自动合并或发布。
