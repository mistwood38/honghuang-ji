# 洪荒纪

一款可以离线游玩的洪荒文字 RPG。保留原有互动本纪、小说和天书，同时提供独立于主线的修行、探索、回合斗法、宗门委托和长期因果。网页与 Android 测试包共用游戏规则。

## 当前可玩内容

- 六个核心页面使用本地场景、人物和器物美术；行动采用青铜铭牌与落印反馈。选择后展示结果，阅读衔接由玩家控制。
- 九门功法可择一主修、两门辅修，并在炼气、筑基后参悟；手动和挂机战斗使用同一套招式规则与三种战策。
- 九件既有器物可在储物页御使，分别参与修炼、护身、突破、药圃或战后恢复。御器不消耗收藏，同一时间只生效一件。
- 十三个地区各有可交互的物产、遗迹和歇脚地；修补、取用与休养会留下持续状态。四位行旅人物有原创肖像、行程、托付与关系记录；可问沿途、谈往事、说牵挂，对话回应当地状态和托付进展。
- 灵、巫、妖、人各六章族脉，共八种结局；章节配四幅独立场景，后续叙事记得先前选择。五方势力有随游戏日推进的补给、护路与争执，结局后仍能自由修行。
- 六首本地原创器乐配乐与六种短音效，音乐、音效分别调音和静音。采样音源许可及制作方法见 [音频记录](docs/reviews/audio-loading-renewal.md)。实际听感仍需玩家试听。

这不是完整商业游戏的验收声明。当前完成、待完善和未验证的项目统一列在 [完成情况](docs/completion-status.md)，旧报告保留各轮当时的结论。

## 本地运行

使用 Node.js 22.18+ 或 24：

```bash
npm ci
npm run dev
```

开发服务为 `http://localhost:8080`。游戏无需账户或数据库；存档保存在当前浏览器的 `honghuang-ji-save`。旧版人物、器物和剧情记录会保留，新字段补默认值。换域名、浏览器或安装包时，请通过游戏内「存档搬移」导出、导入。

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run build:android
```

`npm test` 已包含原平台测试、洪荒存档与玩法回归、长程模拟。未配置 `DATABASE_URL` 时，正式构建按原项目规则跳过外部数据库迁移。安卓离线构建见 [Android 安装说明](docs/android.md)。

## 浏览器验收

启动开发服务后，用 Playwright Chromium 或系统 `/usr/bin/chromium` 运行：

```bash
node --experimental-strip-types scripts/growth.browser.mjs
node --experimental-strip-types scripts/epic-encounters.browser.mjs
node --experimental-strip-types scripts/reading-flow.browser.mjs
node --experimental-strip-types scripts/roam-feedback.browser.mjs
```

脚本可用第一个参数指定本机目标 URL，覆盖 320、360、412px 手机及桌面，使用独立测试存档。最新剧情、美术验收见 [本轮报告](docs/reviews/epic-encounters.md)，御器、参悟见 [上一轮报告](docs/reviews/relics-insight.md)。APK 工作流另包含 Android 模拟器断网启动、音频与存档检查，不将模拟器当作真机测试。本轮只验证 Android 离线网页构建，既有 APK 下载仍对应上一轮版本。

## 美术、来源与历史验收

- [美术规范与资源](docs/art-direction.md)、[六页重建](docs/premium-upgrade.md)、[青铜选项与共用战斗](docs/reviews/bronze-actions-combat.md)
- [配乐、加载与图标](docs/reviews/audio-loading-renewal.md)、[境内探索](docs/reviews/living-regions.md)、[族脉与世局](docs/reviews/factions-lineages.md)、[阅读衔接](docs/reviews/reading-flow.md)
- [原画提示词](public/art/scenes.md)、[人物及器物](public/art/pilgrim-relics.md)、[根骨立绘](public/art/origin-portraits.md)、[器物与地图](public/art/premium-artkit.md)
- [四位行旅与四族山河原画](public/art/epic-encounters.md)、[正文字体来源与新增字形](public/fonts/CREDITS.md)
- [音频许可](public/audio/CREDITS.txt)、[正文字体许可](public/fonts/OFL.txt)、[字标字体许可](public/fonts/MaShanZheng-OFL.txt)

旧篇「山河」保留地志浏览；开放游历的行路由原有游戏规则处理。原小说正文没有因新玩法被删改。`screenshots/` 保存各轮截图及部分自动化结果。开发使用独立分支和 PR，不自动合并 main 或发布正式版本。
