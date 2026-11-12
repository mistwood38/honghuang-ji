# Painted narrative choice panels

Generated on 2026-11-09 using the available OpenAI `image_gen.imagegen` tool. These are original empty painted panel textures; no external artwork, screenshot, wordmark, button lettering or icon sheet was used. No transparency was requested.

## Source and generation history

- Initial atlas: `/workspace/generated_images/exec-96728e19-84d4-46e2-a488-28dc3928a08c.png`, 1254 × 1254 RGB.
- The initial atlas was visually inspected with `view_image`. Four complete frames and dark centers passed, but the large corner ornaments extended beyond the requested nine-slice protection area. It was rejected for that geometric defect.
- One permitted correction, editing that initial atlas: `/workspace/generated_images/exec-d4078ded-00fd-4984-a07c-5be240c46483.png`, 1254 × 1254 RGB, 1,956,295 bytes.
- The correction was visually inspected with `view_image` and selected. No third generation was performed. Original source images remain in place.
- Export proof: `/workspace/generated_images/painted-choices-export-proof.png`.
- Nine-slice proof: `/workspace/generated_images/painted-choices-nine-slice-proof.png`, four 420 × 90 examples at slice 48 / border 14.

## Full initial prompt

> Create an original square 1024 by 1024 production game asset atlas, containing exactly four equal-width equal-height long rectangular blank choice plaques stacked vertically in four exact quarter-height rows: each plaque is 1024 by 256, with its COMPLETE thin frame entirely inside its own row, straight-on orthographic, no perspective, no gap between rows and no extra canvas margin. Paint these as refined, ancient East Asian creation-myth artifacts in a unified dark ink-wash and richly brushed material style: the top plaque is deep cyan jade with very fine gold lotus carvings, the second is black basalt with aged bronze mountain carvings, the third is dusky teal feather material with antique gold flowing-cloud carvings, and the bottom is charred wood and red copper with warm golden ember-seed carvings. All four have a very restrained thin delicate rim, the same exact rectangular geometry, the same near-black blue-green outer canvas color, and clear softly textured dark teal centers ready to hold two lines of bright Chinese dialogue and a small existing emblem; the center must have subtle real material texture, never bright decorations, lettering or a large solid-black void. Confine all characteristic sculpted corner ornament to the outermost 48 pixels at the four corners, keep the long middle spans of each edge smooth, uniform and stretchable for nine-slice UI rendering, keep the borders about 14 pixels visually thin, and keep every corner and frame fully visible inside the row even at its outermost pixel. This is an empty reusable painted panel asset sheet only: absolutely no text, no numbers, no writing, no pseudo-calligraphy, no glyphs, no logos, no watermarks, no pictorial emblems in the centers, no other objects, no mockup or game screenshot, no thick exaggerated mobile-game frames, no transparency.

## Full correction prompt

> Edit this exact four-panel square asset atlas and preserve its four equal horizontal quarters, complete straight rectangular thin frames, dark textured centers, brush-painted material style, and top-to-bottom palette order. The current corner carvings are MUCH TOO LARGE for nine-slice UI use: replace every big lotus, mountain, cloud, or ember branch with a TINY detailed sculpted corner stud, barely larger than the width of the frame, occupying only a small square in each extreme corner, approximately one twenty-fourth of the entire canvas width and one sixth of one panel's height; no decorative vine, stem, leaf, wing, mountain or curl may extend farther than this tiny corner square into a long edge. Make the top panel's tiny corner studs cyan jade with a small gold lotus, the second basalt with a small old-bronze mountain, the third dark teal feather material with a small antique-gold cloud, and the fourth charred wood/red copper with a small warm-gold ember-seed, while every edge BETWEEN the tiny corner studs becomes a smooth slender regular straight gold or copper strip with ABSOLUTELY NO ornaments along it. Keep all four main centers blank and softly textured dark teal, subdue the strong central feather patterns and ridges to provide clean legibility for real UI text later; the final full square image contains four equal 4:1 empty panels only, with no text, symbols, glyphs, labels, lettering, numbers, logos, watermarks, large center emblems or mockup. Every frame must be completely visible inside its own equal-height quarter of the square canvas, matching the original geometry exactly.

## Export method and files

Pillow: convert selected source to RGB, resize the complete square to 1024 × 1024 with Lanczos, then crop four exact 1024 × 256 quarters in order. Encode each quarter as lossy WebP quality 85 / method 6. No repainting, compositing from external art, color grading, text insertion or transparency was applied. Every frame lies entirely within its own crop.

| File | Material | Dimensions | Bytes |
| --- | --- | --- | ---: |
| `choice-dao.webp` | Deep cyan jade, tiny fine-gold lotus corner studs | 1024 × 256 | 10,110 |
| `choice-wu.webp` | Black basalt, old-bronze mountain corner studs | 1024 × 256 | 10,618 |
| `choice-yao.webp` | Dusky teal, subdued feather-like grain, antique-gold cloud corner studs | 1024 × 256 | 8,906 |
| `choice-ren.webp` | Charred wood and red copper, warm-gold ember-seed corner studs | 1024 × 256 | 12,900 |
| **Total** | | | **42,534 bytes / 41.54 KiB** |

## Nine-slice integration

Recommended initial values:

```css
border: 14px solid transparent;
border-image-source: url('/art/choice-dao.webp');
border-image-slice: 48 fill;
border-image-width: 14px;
border-image-repeat: stretch;
```

Use the appropriate material file for each choice. Source-space corners fit within the 48-pixel protected square; the sides and top/bottom spans have uniform straight rims with no extended ornament. Keep the real label, second line and existing 44-pixel emblem as DOM content in the center. A dedicated behind-content pseudo-element is suitable when the parent must preserve its existing content padding. The 420 × 90 nine-slice proof has been visually checked; the rim stays fine, the tiny corner ornaments stay undistorted, and the dark texture stretches without conspicuous seams.

## Quality checks and boundaries

- Actual inspection performed on initial source, selected source, exported WebP contact sheet, and nine-slice proof.
- Four equally sized full rectangular frames; no cut-off corners or neighboring frame intrusion.
- No visible text, numbers, pseudo-calligraphy, watermark, logo, or central emblem.
- Dark textured centers provide room for real two-line Chinese option labels and the existing painted emblem.
- Complete corner motifs are deliberately tiny. At 14-pixel rendered borders they read as small material accents, not as detailed standalone illustrations.
- The selected feather treatment is subtle textured grain rather than a large literal feather. The human panel center is charcoal with warm wood/copper undertones rather than the cooler teal used by the other three.
- These assets provide the normal material appearance. Hover, focus, selected, disabled and contrast behavior are supplied by the consuming UI; no separately generated interaction-state geometry was introduced.
- Original full-resolution atlas files are workspace provenance, not extra public payload. Production delivery consists only of the four WebP files and this source record.
