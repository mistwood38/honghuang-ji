# 原版机制与存档兼容性验收

审查基线：`71dda56`（重建开始时的 main）。本次目标是展示层重建，原有剧情、规则及持久化协议保持不变。

## 不变量

- Zustand 存储键 `honghuang-ji-save`，备份键 `honghuang-ji-save-bak`。
- 外层 JSON 为 `{ "state": { ... }, "version": 1 }`，内层 `state.version` 也是 `1`。
- `SaveData` 的 14 个字段：`version`、`screen`、`started`、`name`、`origin`、`sceneId`、`stats`、`items`、`flags`、`log`、`seen`、`novelIndex`、`sound`、`pastLives`。
- `stats` 六字段与数值上限：dao 400、qi/kill/virtue 160、demon/life 100；下限均为 0。
- 根骨 dao/wu/yao/ren，原有 scene/place/item/flag ID；图像映射仅依赖这些 ID，不写入存档。
- `begin` 对已有进度仅切换 `screen`，不会创建新人生或跳过选择。
- `restart` 归档当前人生，仅保留最后 8 世，保留阅读章节和声音偏好。
- 地图选中地点仅查看，不能改变 sceneId、seen、log、stats。
- 章节浏览仅通过原 `setNovelIndex` 保存阅读位置。
- 所有原小说、天书、地点与剧情正文必须完整保留。装饰与筛选不能改变故事数据。

## 已执行的原版测试

`node --experimental-strip-types --test src/lib/honghuang/balance.test.ts`

6/6 通过：证道路线、承重耗尽道躯、人族守火、心魔结局、紫霄资格隐藏、各门派只出现一次。注意：原有 `npm test` 未包含这个文件，必须单独运行。

## 高价值浏览器回归

1. 无存档时进入游戏，原觉醒选项、道号输入均可用；点击及数字键选择产生相同结果。首次选择后不能因动画重复触发。
2. 从原版 v1 JSON 恢复到 `road`，核对下方夹具；刷新后 sceneId、六属性、物品、因果、历史、章节与声音偏好不变。
3. 分别切换入世、本纪、天书、山河、我。地图点选另一个地点后当前剧情与历史不得变化。
4. 阅读第 8 章，切换前后章，再刷新，阅读位置正确；14 章均可通过目录访问。天书分类筛选与搜索可清除，正文可展开。
5. 声音关闭后选择不发声；打开后仅由用户手势激活音频；浏览器禁止自动播放时游戏仍可选择。
6. 通过 `dao → help → listen → sit → kunlun → disciple → peace → hold → offer → shield → end-dao` 完成一生；验证结局、再入混沌、前尘归档。
7. 手机 360/390 宽、桌面 1280 宽验证无横向溢出、底部导航可触达、长文可滚动、选项不被遮挡。启用系统减少动态效果后，持续装饰动画应停止。

## 原版恢复夹具

以下夹具由未改动的原版 `fresh` 和 `chooseById` 生成；序列为 `dao/help/listen/sit`。执行时设 started=true、screen=play、初始 seen=[awaken]。

```json
{
  "state": {
    "version": 1,
    "screen": "play",
    "started": true,
    "name": "玄澄",
    "origin": "dao",
    "sceneId": "road",
    "stats": { "dao": 70, "qi": 8, "kill": 4, "virtue": 28, "demon": 0, "life": 72 },
    "items": ["purple-qi"],
    "flags": ["bore-axe", "listened-breath", "heard-hongjun"],
    "log": [
      { "sceneId": "awaken", "title": "未名", "choice": "你以道应混沌，道号玄澄。" },
      { "sceneId": "cleave", "title": "斧落", "choice": "你扑上斧脊，替盘古压住那道裂口。" },
      {
        "sceneId": "fall",
        "title": "身化山河",
        "choice": "你追着盘古最后一口气，听见半句没说完的话。"
      },
      { "sceneId": "lecture", "title": "紫霄", "choice": "你在紫霄入座，接到一缕紫气。" }
    ],
    "seen": ["awaken", "cleave", "fall", "lecture", "road"],
    "novelIndex": 7,
    "sound": false,
    "pastLives": []
  },
  "version": 1
}
```

## 原有边界

原存档清理器对损坏的嵌套属性、未知 origin/screen 的校验有限；这不是本次美术重建引入的问题。不应借本次重建擅改存档迁移与错误恢复语义。原版 `hydrated` 字段未被 rehydrate 回调设置，原界面未用它阻塞渲染。本次 GameApp 在原 rehydrate 完成后设置该既有标记，避免恢复前闪现封面；存档字段与协议未变，并已测试恢复后正常进入。
