# 族脉与行旅 · 原创美术资产

日期：2026-11-08。为《洪荒纪》剧情与相遇界面制作，使用本次会话的 OpenAI 图片生成工具原创生成。未下载、临摹或复制商业游戏美术；不把生成作品声明为公共领域或第三方开源授权。

## 文件与加载预算

| 文件 | 尺寸 | 字节 | 用途 |
| --- | --- | ---: | --- |
| `wayfarers.webp` | 1254 × 1254 | 325802 | 桌面四人物肖像图集 |
| `wayfarers-small.webp` | 1024 × 1024 | 157040 | 手机四人物肖像图集 |
| `lineage-vistas.webp` | 1672 × 940 | 432572 | 桌面四族章节场景图集 |
| `lineage-vistas-small.webp` | 1280 × 720 | 196960 | 手机四族章节场景图集 |

手机两套合计 **354000 字节，约 346 KiB**；按进入相应界面加载，不要求首屏下载。所有文件保存在项目本地，离线客户端可直接随包使用。WebP 导出保留画面内容，移除非必要元数据，大图质量 86、小图质量 78；未做自动锐化、描边或改画。

## 象限与构图

均为两列两行，没有嵌入文字、界面边框或间隔。以左上、右上、左下、右下顺序使用：

| 图集 | 左上 | 右上 | 左下 | 右下 |
| --- | --- | --- | --- | --- |
| 行旅人物 | `qingxing` 青荇 | `wuwei` 雾尾 | `pansheng` 磐生 | `axin` 阿薪 |
| 族脉场景 | `dao` 灵 · 昆仑巨门 | `wu` 巫 · 负石天柱 | `yao` 妖 · 扶桑海潮 | `ren` 人 · 雨夜火塘 |

人物格为正方形，大图每格 627 × 627，小图每格 512 × 512。场景大图每格 836 × 470，小图每格 640 × 360。可用 200% 图集布局并按象限定位；不应把整张图集压进单格，也不应把人物强行横向拉宽。场景可在约 2:1 的窗口中轻微上下裁切，正文另置于清晰深色阅读面板。

青荇用旧青衣、草药与药囊建立身份；雾尾用灰狐耳尾、靛袍与盐包区分；磐生是肩负石锤、衣料沾灰的石匠；阿薪捧守火陶罐，赤褐衣物与余烬呼应。角色是成年行旅者，未新增性别或数值属性，也没有改动人物 ID。

四族场景以小人物与巨大环境的比例增强洪荒尺度：门阙与散灵、山骨与负石者、巨木与海潮、雨中荒野与人间微火。无现代城镇、科技设施或虚构的游戏 UI。

## 原始生成与导出

原始 PNG 保留在制作工作区，不是游戏运行依赖：

- 人物：`/workspace/generated_images/exec-b6bf0cc4-d9fe-47b5-bfe6-23af629f73c0.png`，1254 × 1254。
- 场景：`/workspace/generated_images/exec-ceb553ab-0dc3-470f-98ec-9cc28e0c8c54.png`，1672 × 941；导出把总高度规范为偶数 940，消除图集半格的半像素尺寸，未裁去画面。

只用 ImageMagick 做集成所需的尺寸规范与 WebP 压缩；画面构图、人物形象和场景本身均来自图片生成工具。未重新处理原有封面、图标、OG、美术或音频。

人物生成提示词：

> Create a premium original Chinese primordial mythology RPG CHARACTER PORTRAIT ATLAS, a perfectly aligned two-by-two grid filling the entire square canvas, four equal square cells with absolutely no gutters, borders, letters or text. Each cell contains ONE exquisitely painted adult character from waist/chest upward, all faces and essential props comfortably inside their own cell, with dark atmospheric ink mist behind them; cinematic painterly realism, layered Chinese ink-and-mineral-pigment texture, deep teal black, restrained antique bronze, jade and ember accents, highly designed ancient clothing and believable anatomy, detailed expressive eyes, neither glossy anime nor mobile-game glamour. TOP LEFT: Qingxing, an adult female spirit herbalist with black hair pinned by a simple jade twig, weathered blue-green robes, a medicine satchel and a few fresh water plants held naturally, gentle tired eyes and unyielding resolve; TOP RIGHT: Wuwei, an adult male fox-spirit wayfarer with visible silver-grey fox ears, long dark hair, an old indigo traveling robe, one silver-grey tail curling behind his shoulder and a knotted cloth salt parcel, a perceptive restrained expression, elegant and worldly rather than cute. BOTTOM LEFT: Pansheng, a broad adult male primordial clan stonemason with grounded strong features, stone-dust work clothes, mineral-like markings on a bare forearm, a worn bronze-riveted shoulder brace and stoneworking mallet resting safely, practical artisan rather than armored demon; BOTTOM RIGHT: Axin, an adult young human woman with tied black hair, a soot-smudged face, rust-red coarse hemp layers and knotted cords, carefully cradling a small glowing clay ember vessel, bright tenacious eyes. Give each face a distinct human identity and silhouette; nuanced skin, tactile fabric and metal, low-detail smoky backgrounds, brushwork strongest at the silhouettes, museum-quality mythological concept painting.

场景生成提示词：

> A premium ORIGINAL primordial Chinese mythological RPG environment atlas: FOUR separate wide cinematic landscape paintings in an exact two-by-two grid, equal quadrants, no borders, no gutters, no inscriptions or text, fill the entire wide landscape canvas. A coherent masterwork of Chinese ink landscape fused with richly detailed digital oil painting, monumental spatial depth, small human-scale subjects to convey enormous mountains and gods' age, atmospheric perspective, charcoal teal and muted antique gold, tactile mineral pigments, restrained dramatic light; four distinct compositions, never a modern UI or a collage of icons. TOP LEFT: the spirit path, an unimaginably tall ancient Kunlun bronze-and-stone mountain gate emerging through icy jade clouds, a fine shaft of pale morning light illuminates many tiny floating seed-like spirit lights making their way around worn steps; TOP RIGHT: the primordial clan path, a colossal dark mountain pillar splitting into layered stone ribs above a misty ravine, warm ancient mineral veins, a tiny line of stone-bearers with ropes laboring on a causeway beneath it, sober strength and physical weight. BOTTOM LEFT: the demon-kind path, a huge gnarled Fusang tree rising over an emerald storm-tide estuary at gold dusk, branches supporting migrating dark birds, wild coast and swirling mist with freedom and danger, not a palace; BOTTOM RIGHT: the human path, a boundless rain-washed prehistoric wilderness of jagged mountains at blue twilight, a small inhabited settlement of timber shelters with woven roofs in the foreground, human figures gathered around a protected cinnabar-orange communal fire, smoke and rain, fragile warmth against vastness. Each quadrant must read as a finished panoramic painting with its own complete horizon and restrained peripheral detail, keep the main subject and small figures within its central horizontal belt so a game can lightly crop the top and bottom, all composition stays inside its respective quadrant.

## 目视检查与边界

已查看原图及最终手机 WebP：四格顺序正确；四人脸型、衣料、轮廓和携物有明确差异；可见手与药草、肩带、石锤及陶罐接触合理，未发现明显多指或漂浮物；画面未出现文字、水印、图集边框。压缩后眼神、织物与道具轮廓仍能辨认。四场景均具有独立远近层次，巨门/天柱/扶桑/火塘清楚分离。

这两套是**静态绘画图集**，不是逐帧角色动画；角色呼吸、火光与场景雾动若使用 CSS，应另外尊重减少动态效果设置，不宣称原画本身是动画。头像内部有自然雾景，属于人物肖像，不是透明战斗精灵。场景不表示精确地理地图，也不代表新传送规则。

原品牌资源未改，`node scripts/brand-check.mjs --game` 返回 0 警告。界面集成后的遮挡、文字对比、按需加载和手机表现由页面浏览器验收确认。
