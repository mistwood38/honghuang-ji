# 漆金界面补充美术：器物图集、天地舆图、封神台

生成日期：2026-11-03。由本任务的 OpenAI `image_gen.imagegen` 原创生成；仅观察本项目既有 mountain、palace、relics 的色调与笔触来描述统一风格，没有使用第三方图片、商业游戏美术或现有商业角色。记录来源，不主张生成作品具有独占版权。

所有网页素材均为项目内 WebP。原始 PNG 保留于制作工作区 `/workspace/generated_images/`；ImageMagick 仅执行尺寸规格化、格式压缩与检查用缩图，没有拼贴、补绘或语义修改。图集的 1440px 版由1254px原图规格化，不宣称新增绘画细节。

| 文件                   | 尺寸      |   字节 |
| ---------------------- | --------- | -----: |
| relic-icons.webp       | 1440×1440 | 152782 |
| relic-icons-small.webp | 720×720   |  52690 |
| world-atlas.webp       | 1440×960  | 496422 |
| world-atlas-small.webp | 768×512   | 140752 |
| fengshen.webp          | 1440×810  | 237998 |
| fengshen-small.webp    | 768×432   |  73814 |

## 器物图集

一张无文字、无格线的3×3图集，背景为连续玄黑。CSS 可按 `background-size: 300% 300%`、x/y位置0%/50%/100%使用，勿将九件当作一张普通物品缩略图。

从左到右、从上到下的顺序固定如下：

| 行列 | 既有物品ID   | 视觉内容                   |
| ---- | ------------ | -------------------------- |
| 1,1  | chaos-qi     | 青黑混沌气旋               |
| 1,2  | pangu-bone   | 象牙色古骨碎片             |
| 1,3  | purple-qi    | 紫金气丝                   |
| 2,1  | zhuxian      | 刀锋形的剑意光痕，无实体剑 |
| 2,2  | wu-blood     | 朱色灵血滴                 |
| 2,3  | bell         | 古铜礼钟                   |
| 3,1  | xirang       | 金色活土团                 |
| 3,2  | buzhou-stone | 折断的苍玉柱石             |
| 3,3  | incense      | 暖色火种与细烟             |

这些是原有物品的视觉符号，不增加稀有度、装备、容器、数值或玩法。已将完整图集缩为96×96（每格32px）检查，九种剪影与颜色仍可区分；紫气是最纤细的轮廓，推荐正常列表图标采用40px以上。主体均在各自格内，没有文字、额外图标或跨格边框。

原图：`exec-f6448ad7-257c-46a3-83d3-3660f4fa6360.png`。

生成提示：

> Create a finished premium Chinese primordial mythology game inventory atlas as one SQUARE image with an EXACT regular THREE by THREE grid of nine equally sized invisible square cells. There must be nine isolated, centered, unframed painted symbolic relics, one in each cell, each with generous equal dark margin, on one continuous near-black charcoal background; no dividers, no panels, no border, no words, no numbers, no lettering. In reading order left to right then next row: row one is a glowing cyan and ink-black primordial qi wisp, an irregular ivory ancient bone shard, a thin violet and gold spiritual qi filament; row two is a slim luminous blade-shaped slash of sword INTENT with no physical sword, one crimson spiritual blood drop, a small archaic Chinese bronze ritual bell; row three is a warm gold living clay clump, a broken dark jade pillar rock fragment, and one warm ember with a thin ascending curl of incense smoke. All nine have identical three-quarter directional warm upper-left lighting, matching hand-painted mineral pigments, deep jade shadows, antique bronze-gold accents, rich ink and fine impasto texture, bold clear silhouettes that read at 32 pixels, no cast scene or scenery, no extra objects or sparks outside their cell, no commercial game references. This is production artwork, not an interface mockup, no text or badges.

## 天地舆图

由上到下呈现云上天门、洪荒大地与天柱、海域与扶桑、朱色海、地底静河；外缘为混沌。它是神话意象舆图，不宣称准确地理比例、方向坐标或可移动路线。没有地名、文字和UI，地名由界面使用原有地点数据叠加。

该图笔触与地形密度较高，为保留层次大图约485KiB，手机图约137KiB；只应在地图页按需加载。

原图：`exec-722a5e0d-0e3a-4c23-9d2c-b9b7656f78f5.png`。

生成提示：

> Create a breathtaking ORIGINAL cosmographic painted map for the Chinese primordial mythology game Honghuang: a wide THREE to TWO composition with one layered ancient world suspended in a surrounding primordial dark cosmic rim. At the top, cloudbound heaven and a distant immense archaic bronze sacred gate; below it, an immense land with a straight central stone sky pillar, tall jade western peaks on the left and a turquoise eastern sea with a sacred golden tree on the right; low in the foreground a subtle cinnabar sea; at the lowest edge a silent underworld river visible under deep stone roots. Exquisite traditional Chinese ink wash merged with richly detailed digital impasto matte painting, mineral jade, charcoal, aged bronze and quiet gold sunlight, real mountain space, contours and tiny ancient pines, extraordinary scale, handcrafted natural forms. It is an imagined layered mythic atlas, not a modern topographic diagram, not exact geography, not SVG, not a flat map; no labels, no letters, no captions, no writing, no numbers, no logos, no interface.

## 封神台

金色空白卷轴悬于青铜石台、山谷与暮色之间。卷面只有织物纹理，没有字迹；用于原有封神台、空白之榜、末幕与上榜结局的氛围，不增加剧情或榜上名册。

原图：`exec-426d585c-4a66-4ba8-90cc-3d5000244aa2.png`。

生成提示：

> Create an ORIGINAL cinematic SIXTEEN to NINE landscape painting for a premium Chinese primordial mythology narrative game: a monumental ancient bronze and weathered stone fate altar in a vast quiet dusk valley, with one enormous absolutely UNWRITTEN pale-gold hanging silk scroll suspended between two archaic stone pillars above the dais. The scroll is completely blank, no symbols or marks at all; the valley recedes into immense dark teal mountain ranges and cloud banks, with distant divinity suggested only by tiny luminous cloud forms and a soft old-gold shaft of light touching the empty scroll. Exquisite traditional Chinese ink wash merged with fine richly detailed impasto matte painting, profound stillness, monumental space, mineral charcoal/jade, aged bronze, quiet antique gold, tiny natural foreground rocks, original archaic Chinese form language, no modern objects, no western architecture, no physical characters required. Center-safe composition for portrait crop, no text anywhere, no letters, no numbers, no logos, no watermarks, no interface, not photograph, not anime.
