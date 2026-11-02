import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Compass, i as Library, o as BookOpen, r as ScrollText, t as UserRound } from "../_libs/lucide-react.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B7zZCHeJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var APP_NAME = "洪荒纪";
var NOVEL_NAME = "混沌本纪";
var STAT_LABEL = {
	dao: "道行",
	qi: "气运",
	kill: "杀伐",
	virtue: "仁德",
	demon: "心魔",
	life: "道躯"
};
var STAT_ORDER = [
	"dao",
	"qi",
	"kill",
	"virtue",
	"demon",
	"life"
];
var ORIGINS = {
	dao: {
		name: "道胎",
		seal: "道",
		daoName: "玄澄",
		line: "以悟为骨。听得见，也容易被大道理压折。"
	},
	wu: {
		name: "巫骨",
		seal: "巫",
		daoName: "刑岳",
		line: "以力承天。转弯慢，撞得动不该撞的东西。"
	},
	yao: {
		name: "妖形",
		seal: "妖",
		daoName: "照黎",
		line: "以形借气运。善变，也容易被钟声归类。"
	},
	ren: {
		name: "人愿",
		seal: "人",
		daoName: "薪禾",
		line: "以护持为种。起初最弱，香火以后会来找你。"
	}
};
var REALMS = [
	{
		min: 0,
		name: "混沌灵",
		line: "尚未成形的记得。"
	},
	{
		min: 12,
		name: "炼气",
		line: "能把一口气留住。"
	},
	{
		min: 26,
		name: "筑基",
		line: "在新世界里有了站处。"
	},
	{
		min: 44,
		name: "金丹",
		line: "道在体内结成一粒，不借日月。"
	},
	{
		min: 66,
		name: "元婴",
		line: "灵识可以短时间离开道躯去听。"
	},
	{
		min: 92,
		name: "化神",
		line: "神意能盖过一方山水。"
	},
	{
		min: 122,
		name: "炼虚",
		line: "触到盘古没说完的那一句。"
	},
	{
		min: 156,
		name: "合体",
		line: "内外不再互相拆台。"
	},
	{
		min: 196,
		name: "大乘",
		line: "再进一步，就是圣人的门缝。"
	},
	{
		min: 240,
		name: "准圣",
		line: "门缝里的风已经像你的呼吸。此生极难真正站稳。"
	}
];
function realmOf(dao) {
	let cur = REALMS[0];
	for (const realm of REALMS) if (dao >= realm.min) cur = realm;
	return cur;
}
function nextRealm(dao) {
	return REALMS.find((realm) => realm.min > dao) ?? null;
}
var ITEMS = {
	"chaos-qi": {
		name: "混沌气",
		lore: "开天时吞下的一口未分之夜。它记得斧子以前，也记得饿。"
	},
	"pangu-bone": {
		name: "盘古骨",
		lore: "一块未冷的骨。山的祖形，也很沉。"
	},
	"purple-qi": {
		name: "紫气一缕",
		lore: "紫霄灯里溢出来的。被世界允许了一点点的感觉。"
	},
	zhuxian: {
		name: "诛仙剑意",
		lore: "还没有剑。意已经够伤人。"
	},
	"wu-blood": {
		name: "巫血",
		lore: "承重的方法，写在血里，不写在口诀里。"
	},
	bell: {
		name: "钟声一缕",
		lore: "东皇钟没有借你，只是有一响落进了识海。形会短暂归类。"
	},
	xirang: {
		name: "息壤",
		lore: "会自己长的土。女娲抟人时用过同类的湿。"
	},
	"buzhou-stone": {
		name: "不周石",
		lore: "天柱折下来的碎。直的东西留下的最后一点直。"
	},
	incense: {
		name: "人族香火",
		lore: "不是神位。是有人在吃饭时想起你，气便往上走。"
	}
};
var FLAG_LABEL = {
	"bore-axe": "压过开天斧",
	swallowed: "吞过混沌",
	watcher: "旁观开天",
	bone: "取过盘古骨",
	"listened-breath": "听过盘古最后一口气",
	"blood-sea": "随血入海",
	"heard-hongjun": "紫霄入座",
	"heard-partial": "末座断续而听",
	outside: "立在紫霄门外",
	"sought-clay": "循泥与火而下",
	"faction-kunlun": "走近昆仑",
	"faction-jie": "走近血海",
	"faction-wu": "走近祖巫",
	"faction-yao": "走近妖庭",
	"faction-ren": "走向未生的人",
	"kunlun-disciple": "昆仑戒律加身",
	"kunlun-guest": "借昆仑修行",
	"left-kunlun": "自昆仑门前离开",
	"jie-sword": "接了诛仙剑意",
	"jie-array": "学了截教阵法",
	stained: "血海里越洗越深",
	"wu-wrestled": "与祖巫角力",
	"wu-blood": "学了巫血承重",
	"warned-zhou": "曾警告天柱",
	"heard-bell": "听过东皇钟",
	"true-form": "扶桑下长出真形",
	"stole-for-humans": "把温热送往人族",
	"helped-nuwa": "助女娲抟土",
	"blood-in-clay": "先天之物入泥",
	"watched-creation": "远观造人",
	retreated: "曾闭关",
	"side-wu": "战中偏巫",
	"side-yao": "战中偏妖",
	"side-peace": "试图劝住不周",
	"side-ren": "先去护人",
	"held-sky": "扛过倾天",
	looted: "取过天倾的石头",
	"saved-clay": "从天河里捞起泥人",
	"offered-stone": "把物投入补天炉",
	"entered-flame": "灵识入过补天火",
	"stood-aside": "袖手补天",
	"tore-board": "撕过封神榜",
	"shielded-humans": "护住人族香火",
	"entered-board": "走入封神局",
	"walked-away": "走出量劫"
};
var CODEX_CATEGORIES = [
	"总纲",
	"宇宙",
	"时间",
	"法则",
	"众生",
	"势力",
	"山河",
	"法宝",
	"凡例"
];
var CODEX = [
	{
		id: "what",
		category: "总纲",
		title: "这一方洪荒",
		paragraphs: [
			"洪荒在这里不是形容词。它是一间屋子的名字。屋子是盘古用斧在混沌上开出来的，天是顶，地是底，众生是暂时的家具。家具有时以为自己是屋子。",
			"这一方的正史叫《混沌本纪》。它从「没有名字」写到「名字开始伤人」：开天、讲道、巫妖、造人、补天、薪火、封神。大事件不会因你而改写。盘古仍会倒下，不周仍会折，女娲仍会补天，榜仍会出现。",
			"你是本纪第二章里那类极小的灵：开天时不肯散的一粒。正史不写你的名字。入世，就是把这粒灵走完。"
		]
	},
	{
		id: "bounds",
		category: "总纲",
		title: "世界的边界",
		paragraphs: [
			"骨血取自公共神话：盘古开天、女娲造人补天、山海诸神、封神之榜、人皇画卦尝草。人物关系与情节是本纪自定的，不复述任何一部网络小说。",
			"本纪止于封神之后、人族开始有史。西方两位教主只在天边有一个位置，取经不是这个故事。三皇五帝之后的朝代，交给「史」，不交给「本纪」。",
			"圣人不是练出来的等级。鸿钧、三清、女娲之所以为圣，是因为他们站在道被说出来的那一层。你最多走到门缝里，听见那句没说完的话。"
		]
	},
	{
		id: "cosmos",
		category: "宇宙",
		title: "混沌、鸿蒙、开天",
		paragraphs: [
			"混沌没有边。清与浊挤在同一处，像一个还没决定醒不醒的梦。梦里的搏动不是谁的心跳，是混沌自己的。大多数光亮一下就灭。灭不是死，是没有把「在」坚持到下一搏。",
			"鸿蒙是混沌第一次被说中的瞬间。没有形状，只有「原来可以分开」这一个意思。它很短，短到后来的人只能用一个词纪念它。",
			"开天是盘古把这个意思做成斧。第一斧没有光，先有痛。他必须站在裂口里，用身体当界，界一松，两边就会重新合上。所以他没有休息。倒下也是开：呼吸成风，血成海，骨成山，双眼成日后的日月。灵识大部分沉进土里，一小部分留在风里，像一句没有说完的话。后来一切修行，都是在找这句话。"
		]
	},
	{
		id: "layers",
		category: "宇宙",
		title: "天地如何分层",
		paragraphs: [
			"清气往上折，折得住的有三十三层，称三十三天。层是台阶，不是宝座。越高越清，也越不适合血肉久留。",
			"紫霄宫不在任何一层里。它在层之上，鸿钧讲道的地方。宫不占地方，可所有地方都能看见它的影子。影子比宫更有名。",
			"洪荒大地是盘古的身体。山的脉络有的像肋骨，有的像脊。不周山最直，所以后来最容易折。海所以咸，因为最初那不是水，是还没冷却的生命。",
			"幽冥是浊气沉到最深处的结果。早期没有六条路，没有判官，只有后土式的沉默：容纳，不评价。封神以后，人才开始把幽冥写成衙门。本纪仍把它看成大地的最底。",
			"世界的边没有被斧消灭。斧只是在混沌身上开了一间屋子。边上仍是那张旧床。走出量劫的人，有时会回到床边，但不一定睡得着。"
		]
	},
	{
		id: "eras",
		category: "时间",
		title: "纪元",
		paragraphs: [
			"混沌纪：只有搏动和不肯散的灵。没有年。年是斧声之后才被补上的词。",
			"开天纪：盘古站在裂口里的全部时间。他走了很久，久到星辰有了位置，然后倒下。天地从此有内外，有内外就有门。",
			"龙汉：讲道前后的大动荡。龙、凤、麒麟这些更老的神兽在此纪的余波里把最亮的鳞与羽收起来，退进深海与火山。退不是灭，是不再参与「谁来代表天地」。",
			"巫妖纪：十二祖巫与妖庭争天的样子。仗打了很多年。真正改写天地的只有一下：共工撞折不周。",
			"人纪的前夜：女娲抟土、炼石、人学会火与符号。香火在这一纪末尾聚拢。",
			"封神：空白的榜出现。气运重新被写成名字。本纪把此后的人世交给史。"
		]
	},
	{
		id: "dao",
		category: "法则",
		title: "道、因果、量劫",
		paragraphs: [
			"道不是命令，是一种「原来如此」。鸿钧讲道，是让已经存在的东西认出自己。道怕吵。吵不是声音大，是心里有算计。",
			"因果是你做过的事留在世界上的形状。它不记你的借口。压过斧、听过气、撕过榜、捞过泥人，都会留下。有的因果是门，有的因果是债。",
			"量劫不是天外来的惩罚。是气运堵了。强者扩张到天装不下，天地就用一次断裂来换气。龙汉是老神兽退出的那一次，巫妖是天柱折断的那一次，封神是名字被固定成职位的那一次。劫可以躲，躲的代价通常是把劫整个留给别人。"
		]
	},
	{
		id: "qi",
		category: "法则",
		title: "气运与香火",
		paragraphs: [
			"气运是「被世界允许」的程度。紫霄灯里溢出来的紫气，是它最早的形状。它可以借，可以抢，可以守，很难凭空制造。",
			"妖庭把气运做成日月与钟。钟一响，万物的形会短暂记起自己该归哪一类。礼与刑是同一声。",
			"人族的气运方式不同。他们会死，所以必须把经验交给下一个自己。被想念聚拢的气往上走，就成为香火。香火很香，香到天上的旧强者会饿。饿，是封神的真正起因。不是善恶，是一种新的食物出现了，而旧的嘴还没学会不吃。",
			"护住香火，不是因为弱者神圣，是因为「连续」比「完整」更难得。神魔太完整，完整的东西不生长，只扩张。"
		]
	},
	{
		id: "realm",
		category: "法则",
		title: "修为",
		paragraphs: [
			"此世没有金木水火土的灵根抽签。你的根是开天前的那一次应答：以道、以力、以形、或以愿。根决定你起初擅长什么，不决定你后来站在哪一边。",
			"境界只是道行的厚薄，不是身份：混沌灵、炼气、筑基、金丹、元婴、化神、炼虚、合体、大乘、准圣。炼虚，是触到盘古没说完的那一句。准圣是门缝。门后面的混元与圣人，不在可以堆出来的数字里。",
			"闭关能把时间烧成道行，但世界不会等你。你出关时，巫妖的仗已经开了。道躯会在扛天、角力和以身入火时损毁。道躯尽了，这一生就不能再选，只能散回混沌。"
		]
	},
	{
		id: "beasts",
		category: "众生",
		title: "先天神魔与龙凤麒麟",
		paragraphs: [
			"先天神魔是混沌裂开时自己站住的存在。盘古是其中最大的一个，大到不能留下自己。其余的，有的成了后来的大能，有的在龙汉里散了。",
			"龙族、凤族、麒麟比巫妖都老。它们见过门还没有出现的时候。龙汉之后，它们拒绝再为「谁代表天地」流血。北冥有鲲鹏，老得不愿站队，既不入妖庭，也不与祖巫称兄弟。",
			"这些古老的族还在。只是你在巫妖与封神里很少再看见它们最亮的样子。"
		]
	},
	{
		id: "wu",
		category: "众生",
		title: "巫族与十二祖巫",
		paragraphs: [
			"巫族不修飞升。他们觉得把身体修到能扛天，就是道。外物——钟、香火、甚至太聪明的悟——在他们看来都有点取巧。你要么扛得住，要么被天压扁。",
			"十二祖巫从盘古不同的部位里醒过来，一醒就是完整的。他们称兄弟。兄弟的意思不是温存，是：这种存在方式，只此十二人。",
			"帝江无面目，混沌还留在身上，居中。句芒主木与春，在东。祝融是火，在南，火到可以重写一片林。蓐收主金与秋，在西。共工是水，不肯承认岸。玄冥是水的暗面与冬，在北。后土最静，静到后来的死都想埋进她的沉默。天吴是海的水伯。翕兹守时间的缝，不爱被看见。强良是凶与力的形状。烛九阴照着地下的阴。奢比尸站在尸与生的边界上。",
			"十二人若同时站定，天会被他们的身体接成一座阵。阵在没有名字的时候最可怕。后人称它都天。也正因他们不会转弯，天柱将折时，他们会把折当成角力。"
		]
	},
	{
		id: "yao",
		category: "众生",
		title: "妖族",
		paragraphs: [
			"妖不是后来才有的。山精、鸟魂、河里一段不肯散的光，早就各自活着。它们散。帝俊把散的收成了朝。",
			"帝俊座下有许多太阳。不是比喻。那些日是他的子，也是他的兵，也是天亮的理由。太一管月与海，冷，准，不多话。东皇太一带着钟。",
			"妖庭华美，华美到巫族觉得恶心。巫族觉得美是多余的，多余就会在大战里先死。妖庭觉得巫族粗陋，粗陋的东西不配决定天地的样子。两边都没错到可以悔改，也都对到可以开战。"
		]
	},
	{
		id: "ren",
		category: "众生",
		title: "人族",
		paragraphs: [
			"女娲造人，不全是因为寂寞。更早的理由是天地缺一口不一样的气：会老、会死、会把经验交给下一个自己。弱，但是连续。",
			"泥是盘古血水流过的土。人睁开眼的第一件事是冷，第二件事是寻找旁边还有没有同样会冷的。会找同类，才有族。女娲说过：不要先教会他们跪。",
			"火比神赐的光更好用，因为它会灭，所以必须有人守。伏羲把鸟迹、龟纹和自己的手画成八种符号，让人可以在事情发生之前谈论事情。神农把死过的错误记下，使下一个不必用命去买同一课。",
			"人族不会立刻成为天地的主人。他们只是在补天和封神之后，获得一段不必每晚防着神魔的睡眠。睡眠里他们开始种地、吵架、立约、背叛、再立约。这就是史的开始。"
		]
	},
	{
		id: "saints",
		category: "势力",
		title: "紫霄与三清",
		paragraphs: [
			"鸿钧是盘古把世界说了一半之后，剩下那一半终于被说出来的声音。他不创造。他讲。紫霄的座位有数，不是小气，是有的灵听得见，有的灵只想把听见的抢走。门开着。开着的门比关上的门更难进。",
			"讲道散后是三个方向。老子往西，看着将生的人，话很少，怕话太满，人就只照着话活。元始上昆仑，立规矩。规矩护得住苗，也挡得住不该被挡的风。玉虚不收抢来的道。通天下血海，收的不是最正的，是最多的。他不忍心看门外的灵永远在门外。最多，就有了阵；阵一成，个人的道容易变成阵的一部分。",
			"三清是后人叫的。当时只是西、上、与海。女娲不入这三门。她在底下捏泥。泥的事，座位讨论不到。"
		]
	},
	{
		id: "camps",
		category: "势力",
		title: "巫、妖、人、榜",
		paragraphs: [
			"巫族的中心在不周一带，以十二祖巫为骨。他们没有香火财政，只有身体。妖庭的中心在东海扶桑，以帝俊、太一、东皇钟为秩序。两边的战争不是一场决斗，是两种「天地该是什么样」的互不服。",
			"人族一开始没有势力。他们有火塘。火塘后来变成部落，部落在三皇手里慢慢有了符号、草药和约。香火是他们唯一让天上饿的东西。",
			"封神榜是一次残酷的重新分配：把一部分大能的位子固定成封号、职责和不能再随意下界吞食的枷锁。它也是阴谋。所有秩序在失去自由的人眼里都是阴谋。空白的榜比写满的榜更可怕，因为任何名字都还来得及被叫到。",
			"你不必入任何一门。独行在此世是合法的。只是门一旦出现，不进门本身也是一种站队。"
		]
	},
	{
		id: "geo",
		category: "山河",
		title: "山河总势",
		paragraphs: [
			"西北天高，因为不周曾经撑在那里。折了以后，天倾西北，水往东南泄，地也陷向东南。女娲补了天，没有把地填平。平的世界没有海，没有海就会忘记自己曾经是血。",
			"昆仑在西，高，适合戒律。血海在北境的暗处，通天立教的地方，剑意比水先冷。东海有扶桑，日从那里出去。娲皇宫不在天上，在人将生的土旁边。幽冥在一切土的下面。蓬莱在海里，很美，本纪的大事很少走到那里，隐去的人有时经过。",
			"三十三天叠在大地上空。紫霄在更上。世界的边在这一切之外，仍是混沌。详细的一地一志，在「山河」里。"
		]
	},
	{
		id: "treasure",
		category: "法宝",
		title: "物与意",
		paragraphs: [
			"此世真正厉害的往往还不是器，是意。诛仙在很长一段时间里没有剑，只有意。东皇钟可以不离妖庭，而一缕钟声仍会落进别人的识海。",
			"先天之物来自开天本身：混沌气、盘古骨、不周石、紫霄溢出来的紫气。它们记得斧子以前或天柱还直的时候。投入补天炉，石的性子会软一点，软到能盖住所有人的天，而不只是盖住宝座。",
			"后天之物与人有关。息壤会自己长，适合捏进生命。香火不是法宝，可它比许多法宝更会改命，因为它来自别人的晚饭。",
			"抢来的道，昆仑不要。吞下的混沌，会在你安静的时候继续饿。物不会替你选择，它只是让你的选择更重。"
		]
	},
	{
		id: "howto",
		category: "凡例",
		title: "正史与入世",
		paragraphs: [
			"「本纪」是可以读完的正史，十四章，五卷，从混沌到封神余响。它不随你的选择改字。",
			"「入世」是第二人称的一生。你应答混沌，然后穿过与正史相同的大事件。选择改的是你的道行、气运、杀伐、仁德、心魔、道躯，以及你站在谁旁边。",
			"「天书」就是你正在读的这套设定，与游戏是同一个世界，不另起炉灶。「山河」是地志。「我」是这一世的身体、物、因果，以及你抄得下来的生平。",
			"大能的胜负已写在本纪里。你的自由是：在这些胜负之间，你是谁，你护谁，你把命用在哪一击，以及你允许自己怎样结束。"
		]
	},
	{
		id: "six",
		category: "凡例",
		title: "灵识六相",
		paragraphs: [
			"道行：你听懂并留下了多少。它决定境界。没有听过盘古的气，或没有在紫霄真正入座，再厚也只是堆，很难走到混元那扇门。",
			"气运：世界允不允许你。妖庭、紫气、旁观而不死，都会动它。",
			"杀伐：力与伤的语言。巫族听得懂。过了，就会变成嗜好。",
			"仁德：你把谁从水里捞起来、有没有把炉火让给所有人的天。人族认这个，不认威。",
			"心魔：吞噬、白拿、越洗越深的那一部分。它重到一定程度，会替你把人生说完。证道的门不收它。",
			"道躯：你还能不能再承受一次。扛斧、角力、扛天、以身入火，都在用它。尽了就散。散不是羞辱，是这一击比你的「在」更重。",
			"没有唯一的最优生路。证道、扛天、日月之侧、守火、入魔、隐去、上榜、或只留下空白，都是写完的一生。因果若自行落定，会偏向你活得最像的那一种；你仍可以在最后亲手改口。"
		]
	}
];
var LAYERS = [
	{
		name: "紫霄宫",
		note: "讲道处。不在三十三天之内，在其上看见一切层的影子。"
	},
	{
		name: "三十三天",
		note: "清气折成的台阶。越高越清，越不适合血肉久留。"
	},
	{
		name: "洪荒大地",
		note: "盘古所化。西北曾被不周撑起，折后倾而漏水。"
	},
	{
		name: "幽冥",
		note: "浊气的最底。后土的沉默。此时还不是衙门。"
	}
];
var PLACES = [
	{
		id: "chaos",
		name: "混沌",
		region: "未开",
		summary: "没有边的黑，黑里有极慢的搏动。",
		detail: "清浊未分之处。大多数灵在这里亮一下就回去了。你是不肯散的那一粒。斧落之后，混沌没有消失，它退到屋子外边，仍像一张旧床。"
	},
	{
		id: "earth",
		name: "初成天地",
		region: "洪荒",
		summary: "盘古倒下的第一阵风。",
		detail: "呼吸刚刚变成风，血刚刚汇成海，骨刚刚想起自己可以是山。星辰开始有位置。这时拾骨、追气、入海，都会被天地记住。"
	},
	{
		id: "zixiao",
		name: "紫霄宫",
		region: "天",
		summary: "三十三天之上，鸿钧讲道的影子。",
		detail: "宫不占地方，可所有地方都能看见它。座位有数，门却开着。座上的人学习安静，门外的人还握着一口饿、一掌力或一口混沌。灯里会溢紫气。"
	},
	{
		id: "thirty-three",
		name: "三十三天",
		region: "天",
		summary: "清气叠起来的台阶。",
		detail: "不是宝座，是分层。大能在这里往来，血肉不宜久站。封神之后，许多空着的位子会被写成官职。本纪里你更多次只是仰头看见它。"
	},
	{
		id: "kunlun",
		name: "昆仑",
		region: "洪荒",
		summary: "西方高处。元始立规矩的山。",
		detail: "玉虚的门看你的因果，不看你的礼物是否贵重。抢来的道进不去。你可以跪受戒律，可以只借山修行，也可以看一眼就走。高处的篱笆护苗，也挡风。"
	},
	{
		id: "bloodsea",
		name: "血海",
		region: "洪荒",
		summary: "通天立教处。剑意比海先冷。",
		detail: "这里收得最多。最多就有阵，阵会把个人收成阵的一部分。有人来接诛仙的意，有人只学阵，有人以为能把心魔洗掉，结果把魔洗深。"
	},
	{
		id: "buzhou",
		name: "不周山",
		region: "洪荒",
		summary: "最直的一根天骨。直的东西容易折。",
		detail: "十二祖巫在这一带用身体讲道理。共工败于太阳之一后，用头与这根骨头争一个道理。山折，天倾西北，天河倒灌。折声很短，短过开天之斧。"
	},
	{
		id: "east",
		name: "东海妖庭",
		region: "洪荒",
		summary: "扶桑、众日、太一的月、东皇的钟。",
		detail: "帝俊把散居的精魂收成朝。华美，近乎残忍。钟是礼也是刑。你可以借一缕钟声，可以在树下长自己的真形，也可以把一丝温热偷偷送去人将生的地方。"
	},
	{
		id: "wahuan",
		name: "娲皇宫",
		region: "人境",
		summary: "不在天上。在泥与火旁边。",
		detail: "女娲抟土、炼五色石的地方。宫门对三清的座位之争关着。这里讨论的是冷、是同类、是天的洞要不要只盖住宝座。炉火吃的是「肯被烧」。"
	},
	{
		id: "youming",
		name: "幽冥",
		region: "下",
		summary: "地的最底，后土的沉默。",
		detail: "浊气沉到不能再沉的地方。此时没有奈何桥的繁文。死者若有，也只是被大地容纳。封神之后人们才开始在这里修衙门。你此生或许只远远知道它在。"
	},
	{
		id: "penglai",
		name: "蓬莱",
		region: "海",
		summary: "海中仙山。大事很少在这里发生。",
		detail: "很美，美到不适合做量劫的战场。龙汉后退走的一些老灵会经过。若你最终隐去，未必定居，但风会提一句这个名字。"
	},
	{
		id: "tribes",
		name: "人族火塘",
		region: "人境",
		summary: "会灭的火，所以必须有人守。",
		detail: "最早的职位不是官，是「你若睡了，大家就冷」。符号、草药、约，都从火塘边长出来。香火也是。天上的饿，是从这口锅开始的。"
	},
	{
		id: "board",
		name: "封神台",
		region: "人境",
		summary: "竖着一块还没写字的榜。",
		detail: "空白比写满可怕。撕、护、入、走，没有一种干净。字比人硬。一旦写上，名字就不再只属于你。"
	},
	{
		id: "edge",
		name: "世界的边",
		region: "未开",
		summary: "屋子之外，混沌那张旧床。",
		detail: "闭关的人在边附近把时间烧成道行。走出量劫的人回到这里。散尽的人也会被风送回这张床，小到不能再选。"
	}
];
function placeById(id) {
	return PLACES.find((place) => place.id === id) ?? null;
}
var retreat = {
	id: "retreat",
	text: "先闭关，再出去",
	sub: "把时间烧成道行，世界不会等你",
	to: "retreat",
	delta: {
		dao: 22,
		life: -10
	},
	addFlags: ["retreated"],
	record: "你闭关，让世界先走一步。"
};
var SCENES = [
	{
		id: "awaken",
		era: "混沌纪",
		title: "未名",
		place: "chaos",
		paragraphs: [
			"你没有名字。名字是后来的事。此刻只有一片浓得发沉的黑，黑里有温，温里有一声极慢的心跳——不是你的，是混沌自己的。",
			"你是其中一缕不肯散的灵识。四周无数同类刚刚亮起，又灭了。你偏偏还在。",
			"有什么东西从黑里探出来，像问，又像认。此世没有灵根可抽。你的根，就是这一次应答。"
		],
		choices: [
			{
				id: "dao",
				text: "以道应之",
				sub: "把「在」听成一句还没说完的话",
				to: "cleave",
				delta: {
					dao: 18,
					virtue: 8,
					qi: 2
				},
				setOrigin: "dao",
				setName: "玄澄",
				record: "你以道应混沌，道号{{name}}。"
			},
			{
				id: "wu",
				text: "以力应之",
				sub: "用不肯散的那一点，去顶住四周的回收",
				to: "cleave",
				delta: {
					kill: 16,
					dao: 8,
					demon: 2
				},
				setOrigin: "wu",
				setName: "刑岳",
				record: "你以力应混沌，道号{{name}}。"
			},
			{
				id: "yao",
				text: "以形应之",
				sub: "先让自己有一个轮廓，哪怕轮廓会变",
				to: "cleave",
				delta: {
					qi: 16,
					kill: 6,
					dao: 6
				},
				setOrigin: "yao",
				setName: "照黎",
				record: "你以形应混沌，道号{{name}}。"
			},
			{
				id: "ren",
				text: "以愿应之",
				sub: "还不知道要护谁，只知道不想只剩自己",
				to: "cleave",
				delta: {
					virtue: 16,
					qi: 10,
					dao: 6
				},
				setOrigin: "ren",
				setName: "薪禾",
				record: "你以愿应混沌，道号{{name}}。"
			}
		]
	},
	{
		id: "cleave",
		era: "开天纪",
		title: "斧落",
		place: "chaos",
		paragraphs: [
			"盘古从混沌里站起来的时候，你第一次懂得什么叫大。他不是山。山还没有。他是把天地从彼此身上撕开的那只手。",
			"斧光一落，没有光，先有痛。清的往上走，浊的往下坠。你被气流掀起来，几乎重新散掉。",
			"裂口需要有人待在里面。他用身体当界。界一松，两边就会重新合上。"
		],
		asides: [
			{
				requires: [{
					kind: "origin",
					id: "dao"
				}],
				text: "你听见斧不是兵器，是一个决定。决定比铁更响。"
			},
			{
				requires: [{
					kind: "origin",
					id: "wu"
				}],
				text: "你的骨像被喊了一声。那一声的意思是：能扛的，上来。"
			},
			{
				requires: [{
					kind: "origin",
					id: "yao"
				}],
				text: "形在这阵风里站不住。你只好先变成更薄的东西，贴着光走。"
			},
			{
				requires: [{
					kind: "origin",
					id: "ren"
				}],
				text: "你忽然怕。不是怕自己散，是怕这一斧之后，再没有「旁边」。"
			}
		],
		choices: [
			{
				id: "help",
				text: "扑上斧脊，替他压住裂口",
				sub: "温度会留下，道躯会裂",
				to: "fall",
				delta: {
					virtue: 10,
					dao: 12,
					kill: 4,
					life: -28
				},
				addFlags: ["bore-axe"],
				record: "你扑上斧脊，替盘古压住那道裂口。"
			},
			{
				id: "swallow",
				text: "在裂口里吞下一口混沌",
				sub: "夜会留在体内，不肯消化",
				to: "fall",
				delta: {
					kill: 10,
					demon: 14,
					dao: 10,
					life: -8
				},
				addItems: ["chaos-qi"],
				addFlags: ["swallowed"],
				record: "你吞下飞溅的混沌，从此心里有一口夜。"
			},
			{
				id: "watch",
				text: "贴着未裂的暗处，只看",
				sub: "看也会留下印子，只是印子很轻",
				to: "fall",
				delta: {
					qi: 10,
					virtue: 2,
					dao: 4
				},
				addFlags: ["watcher"],
				record: "你只是看。开天在你灵上留下一道浅印。"
			}
		]
	},
	{
		id: "fall",
		era: "开天纪",
		title: "身化山河",
		place: "earth",
		paragraphs: [
			"盘古走了很久。久到星辰有了位置。然后他倒下。",
			"呼吸变成风，骨骼化作山脊，血液涌成江海。一只眼热得将要成为日，一只眼冷得将要成为月。你站在新世界的第一阵风里，灵识几乎被这具太大的尸体撑裂。",
			"他的最后一口气里有半句话。风把它吹向西方。海还烫着。有的骨还没有冷。"
		],
		asides: [
			{
				requires: [{
					kind: "flag",
					id: "bore-axe"
				}],
				text: "斧脊上的温度还在你肩里。你知道那不是恩赐，是亏欠，也是道骨。"
			},
			{
				requires: [{
					kind: "flag",
					id: "swallowed"
				}],
				text: "腹中那口混沌不肯安静。它记得未开之前，并且开始饿。"
			},
			{
				requires: [{
					kind: "flag",
					id: "watcher"
				}],
				text: "你看得太清，清到几乎没有参加。气运却因此没被斧震碎。"
			}
		],
		choices: [
			{
				id: "bone",
				text: "取一片未冷的骨",
				sub: "山的祖形，也很沉",
				to: "lecture",
				delta: {
					dao: 8,
					kill: 4
				},
				addItems: ["pangu-bone"],
				addFlags: ["bone"],
				record: "你取走一块未冷的盘古骨。"
			},
			{
				id: "listen",
				text: "循最后一口气，去听那半句",
				sub: "道行会厚起来，厚得几乎站不住",
				to: "lecture",
				delta: {
					dao: 18,
					virtue: 6
				},
				addFlags: ["listened-breath"],
				record: "你追着盘古最后一口气，听见半句没说完的话。"
			},
			{
				id: "blood",
				text: "随血入海",
				sub: "海会接受你，也会记住你的饿",
				to: "lecture",
				delta: {
					demon: 6,
					kill: 8
				},
				addFlags: ["blood-sea"],
				record: "你随盘古之血入海，海记住了你。"
			}
		]
	},
	{
		id: "lecture",
		era: "龙汉",
		title: "紫霄",
		place: "zixiao",
		paragraphs: [
			"不知过了几万载。紫霄宫凭空立在三十三天之上。鸿钧的声音不大，可每个字都像把天地重新说了一遍。",
			"山在改形状，海在改深浅。道不是命令。道是一种「原来如此」。",
			"座位有数。门却开着。开着的门比关上的门更难进。灯里溢出一缕轻得几乎不是东西的紫气。"
		],
		asides: [{
			requires: [{
				kind: "statMin",
				stat: "dao",
				value: 18
			}],
			text: "那些字落到你已经有的缝里。你听得见座位为什么有数。"
		}, {
			requires: [{
				kind: "statMax",
				stat: "dao",
				value: 17
			}],
			text: "你听得断续。断续也是听。只是紫气看了一眼你的手，没有落下。"
		}],
		choices: [
			{
				id: "sit",
				text: "入座，听到灯芯熄灭",
				sub: "紫气肯认你这一次",
				requires: [{
					kind: "statMin",
					stat: "dao",
					value: 18
				}],
				visibility: "hide",
				to: "road",
				delta: {
					dao: 22,
					qi: 6,
					virtue: 4
				},
				addItems: ["purple-qi"],
				addFlags: ["heard-hongjun"],
				record: "你在紫霄入座，接到一缕紫气。"
			},
			{
				id: "partial",
				text: "坐在末座，能听多少是多少",
				sub: "断续的道，仍比不听多一口",
				requires: [{
					kind: "statMax",
					stat: "dao",
					value: 17
				}],
				visibility: "hide",
				to: "road",
				delta: {
					dao: 8,
					virtue: 2
				},
				addFlags: ["heard-partial"],
				record: "你在末座断续而听，紫气没有落到你手上。"
			},
			{
				id: "outside",
				text: "立在门外，与神魔对峙",
				sub: "不承认自己进不去",
				to: "road",
				delta: {
					kill: 10,
					demon: 8
				},
				addFlags: ["outside"],
				record: "你立在紫霄门外，没有把手里的东西放下。"
			},
			{
				id: "down",
				text: "不去。循着泥与火的气息往下",
				sub: "座位讨论不到泥土",
				to: "road",
				delta: {
					virtue: 10,
					qi: 2
				},
				addFlags: ["sought-clay"],
				record: "你离开紫霄的影子，循泥与火向下。"
			}
		]
	},
	{
		id: "road",
		era: "龙汉",
		title: "道分",
		place: "zixiao",
		paragraphs: [
			"讲道散了。三个方向同时变成门：西边老子不多话，昆仑上规矩立起来，血海里有人在笑，笑意干净，也很危险。",
			"女娲没有入这三门。她在更下面捏泥。",
			"道本身不分。分的是走路的人。你该为自己找一个落脚，或承认你哪儿也不进。"
		],
		choices: [
			{
				id: "kunlun",
				text: "上昆仑",
				sub: "高处的篱笆护苗，也挡风",
				requires: [{
					kind: "or",
					any: [
						{
							kind: "anyFlag",
							ids: ["heard-hongjun", "listened-breath"]
						},
						{
							kind: "statMin",
							stat: "virtue",
							value: 8
						},
						{
							kind: "origin",
							id: "dao"
						}
					]
				}],
				visibility: "lock",
				to: "kunlun",
				delta: {
					dao: 6,
					virtue: 2
				},
				addFlags: ["faction-kunlun"],
				record: "你走向昆仑。"
			},
			{
				id: "jie",
				text: "赴血海",
				sub: "门外的位子，他那里都有",
				requires: [{
					kind: "or",
					any: [
						{
							kind: "anyFlag",
							ids: [
								"blood-sea",
								"outside",
								"swallowed"
							]
						},
						{
							kind: "statMin",
							stat: "kill",
							value: 12
						},
						{
							kind: "statMin",
							stat: "demon",
							value: 8
						}
					]
				}],
				visibility: "lock",
				to: "bloodsea",
				delta: {
					demon: 2,
					kill: 4
				},
				addFlags: ["faction-jie"],
				record: "你走向血海。"
			},
			{
				id: "wu",
				text: "去不周，见祖巫",
				sub: "他们用身体讲道理",
				requires: [{
					kind: "or",
					any: [{
						kind: "origin",
						id: "wu"
					}, {
						kind: "statMin",
						stat: "kill",
						value: 8
					}]
				}],
				visibility: "lock",
				to: "witch",
				delta: {
					kill: 6,
					dao: 2
				},
				addFlags: ["faction-wu"],
				record: "你走向不周山下的祖巫。"
			},
			{
				id: "yao",
				text: "去东海妖庭",
				sub: "日月会给你一个可被归类的形",
				requires: [{
					kind: "or",
					any: [{
						kind: "origin",
						id: "yao"
					}, {
						kind: "statMin",
						stat: "qi",
						value: 12
					}]
				}],
				visibility: "lock",
				to: "yaoting",
				delta: {
					qi: 6,
					dao: 2
				},
				addFlags: ["faction-yao"],
				record: "你走向东海妖庭。"
			},
			{
				id: "ren",
				text: "哪儿也不入，沿着将生的人烟走",
				sub: "弱还没有出生，气味已经有了",
				to: "clay",
				delta: { virtue: 6 },
				addFlags: ["faction-ren"],
				record: "你谁的门也不进，走向未生的人。"
			}
		]
	},
	{
		id: "kunlun",
		era: "龙汉",
		title: "玉虚",
		place: "kunlun",
		paragraphs: [
			"昆仑的风很薄。薄风里，元始天尊并不看你的脸。他看的是你身上的因果。",
			"「昆仑不收抢来的道。」",
			"这句话不是考验。是山的材质。你若把吞噬来的东西献上去，门会自己窄掉。"
		],
		choices: [
			{
				id: "disciple",
				text: "跪听戒律，把杀心按进规矩里",
				sub: "篱笆会护你，也会问你挡了谁的风",
				to: "war",
				delta: {
					virtue: 12,
					demon: -6,
					dao: 12
				},
				addFlags: ["kunlun-disciple"],
				record: "你受昆仑戒律，杀心被按进规矩。"
			},
			{
				id: "guest",
				text: "只借山门修行，不入门墙",
				sub: "道行涨得快，名分是空的",
				to: "war",
				delta: {
					dao: 16,
					qi: 4
				},
				addFlags: ["kunlun-guest"],
				record: "你借昆仑修行，没有入门。"
			},
			{
				id: "leave",
				text: "看一眼规矩，转身离开",
				sub: "门记住了你，你没有记住门",
				to: "war",
				delta: { qi: 6 },
				addFlags: ["left-kunlun"],
				record: "你在昆仑门前停了一停，然后离开。"
			},
			retreat
		]
	},
	{
		id: "bloodsea",
		era: "龙汉",
		title: "诛仙",
		place: "bloodsea",
		paragraphs: [
			"通天教主笑了一声。血海里浮着剑，剑还没有名字，可意已经够了。",
			"「万物都该有座。」他说。干净。危险。",
			"海接受所有进不了紫霄的灵。接受是温暖的，也是有牙齿的。阵在海面上若隐若现，个人的轮廓在阵里会变得很好用，也好消失。"
		],
		choices: [
			{
				id: "sword",
				text: "接过那缕诛仙剑意",
				sub: "意比剑先伤人",
				to: "war",
				delta: {
					kill: 14,
					demon: 10,
					dao: 6
				},
				addItems: ["zhuxian"],
				addFlags: ["jie-sword"],
				record: "你接了诛仙剑意。剑还没有，意已经有了。"
			},
			{
				id: "array",
				text: "只学阵，不学杀",
				sub: "阵会留你，也会用你",
				to: "war",
				delta: {
					dao: 14,
					kill: 4
				},
				addFlags: ["jie-array"],
				record: "你在血海学阵，没有先学杀。"
			},
			{
				id: "stain",
				text: "下海，想把心魔洗掉",
				sub: "海不帮人洗。海帮魔加深",
				to: "war",
				delta: {
					demon: 14,
					kill: 4
				},
				addFlags: ["stained"],
				record: "你在血海里洗心，把魔洗得更深。"
			},
			retreat
		]
	},
	{
		id: "witch",
		era: "巫妖",
		title: "十二",
		place: "buzhou",
		paragraphs: [
			"祖巫不讲道理。他们用身体讲。",
			"帝江没有面目。祝融一呼，附近的林像被重写。共工看海的眼神，像在看一个还不肯承认他的岸。后土静得让你想把自己埋进去休息——那不是慈悲，是容纳。",
			"十二人同时看你的时候，天像被他们接成一座还没有名字的阵。"
		],
		choices: [
			{
				id: "wrestle",
				text: "上前与他们角力",
				sub: "证明你扛得住。证明很贵",
				to: "war",
				delta: {
					kill: 16,
					dao: 4,
					life: -24
				},
				addFlags: ["wu-wrestled"],
				record: "你与祖巫角力，道躯发出山裂一样的声音。"
			},
			{
				id: "blood",
				text: "不比胜负，学他们的血怎么承重",
				sub: "力写成血，不写进口诀",
				to: "war",
				delta: {
					dao: 10,
					kill: 10
				},
				addItems: ["wu-blood"],
				addFlags: ["wu-blood"],
				record: "你学了巫血。承重从此是身体的事。"
			},
			{
				id: "warn",
				text: "告诉他们：太直的天柱，会先折",
				sub: "不会转弯的人未必爱听",
				to: "war",
				delta: {
					virtue: 10,
					dao: 6
				},
				addFlags: ["warned-zhou"],
				record: "你警告祖巫，不周太直，直则易折。"
			},
			retreat
		]
	},
	{
		id: "yaoting",
		era: "巫妖",
		title: "日月",
		place: "east",
		paragraphs: [
			"帝俊的日很多。太一的月很冷。妖庭华美得近乎残忍，美到你觉得自己若不够好看，就会被当成尚未归类的东西。",
			"东皇太一的钟没有离手。可你已经能想象它响起来的样子：万物短暂地记起自己该归哪一类。",
			"扶桑树下，形是一种恩，也是一种户籍。"
		],
		choices: [
			{
				id: "bell",
				text: "向东皇求钟声一响",
				sub: "礼与刑是同一声",
				to: "war",
				delta: {
					qi: 14,
					dao: 6
				},
				addItems: ["bell"],
				addFlags: ["heard-bell"],
				record: "东皇钟应了你一响。形被归过一次类。"
			},
			{
				id: "form",
				text: "在扶桑下自己长出真形",
				sub: "不入户籍，也可以有轮廓",
				to: "war",
				delta: {
					dao: 14,
					kill: 6
				},
				addFlags: ["true-form"],
				record: "你在扶桑下长出自己的真形，没有先跪。"
			},
			{
				id: "steal",
				text: "把一丝妖丹的温热，送往人将生之处",
				sub: "朝会少一口，泥会暖一点",
				to: "war",
				delta: {
					virtue: 12,
					qi: -2
				},
				addFlags: ["stole-for-humans"],
				record: "你从妖庭取了一丝温热，送去尚未出生的人。"
			},
			retreat
		]
	},
	{
		id: "clay",
		era: "人纪前夜",
		title: "薪与泥",
		place: "wahuan",
		paragraphs: [
			"世界还没有人。只有女娲掌心里一小团湿泥。泥是盘古的血流过的土，闻起来像雨前。",
			"她看了你一眼。那一眼里没有收徒的意思。",
			"「你若护他们，就不要先教会他们跪。」"
		],
		asides: [{
			requires: [{
				kind: "flag",
				id: "sought-clay"
			}],
			text: "你是循着这股气味来的。气味比紫霄的灯更近。"
		}],
		choices: [
			{
				id: "help",
				text: "助她抟土",
				sub: "慢，像在道歉。泥会暖",
				to: "war",
				delta: {
					virtue: 14,
					dao: 8
				},
				addItems: ["xirang"],
				addFlags: ["helped-nuwa"],
				record: "你助女娲抟土，掌心留下会自己长的息壤。"
			},
			{
				id: "mix",
				text: "把一件先天之物的温度，掺进泥里",
				sub: "人会因此做一个很长的梦",
				requires: [{
					kind: "anyItem",
					ids: [
						"pangu-bone",
						"chaos-qi",
						"purple-qi"
					]
				}],
				visibility: "lock",
				to: "war",
				delta: {
					virtue: 8,
					dao: 10
				},
				removeOneOf: [
					"pangu-bone",
					"chaos-qi",
					"purple-qi"
				],
				addFlags: ["blood-in-clay"],
				record: "你把先天之物的一丝温度掺进泥里。"
			},
			{
				id: "watch",
				text: "只远远看着",
				sub: "怕一看就负责",
				to: "war",
				delta: { qi: 8 },
				addFlags: ["watched-creation"],
				record: "你远观造人，没有把手伸出去。"
			},
			retreat
		]
	},
	{
		id: "retreat",
		era: "龙汉",
		title: "闭关",
		place: "edge",
		paragraphs: [
			"你在世界的边坐下。混沌像一张旧床，就在身后，你没有躺。",
			"时间在这里可以被烧。烧完，道行厚了一层，道躯却薄了。薄是因为你不在场的时候，天地仍在互相撕。",
			"出关的风里已经有血腥。不是一处的血。是巫与妖都觉得自己才是天该有的样子。"
		],
		asides: [{
			requires: [{
				kind: "flag",
				id: "retreated"
			}],
			text: "没有人来叫你。这正是闭关的好处，也是它的债。"
		}],
		choices: [{
			id: "out",
			text: "出关",
			sub: "仗已经开了",
			to: "war",
			record: "你出关。道行还在，世界已经在打。"
		}]
	},
	{
		id: "war",
		era: "巫妖",
		title: "战起",
		place: "buzhou",
		paragraphs: [
			"巫妖的仗不是一天打起来的。是天不够高，地不够厚，而两边都觉得自己才是天地该有的样子。",
			"龙与凤已经把最亮的鳞羽收进深海和火山。北冥的鲲鹏连看都不看。剩下的噪音，全是「谁来代表天地」。",
			"你站在将裂的风里。不周山还直着。直，是一种预兆。"
		],
		asides: [
			{
				requires: [{
					kind: "flag",
					id: "kunlun-disciple"
				}],
				text: "昆仑的戒律还在你舌尖上，像一片薄冰。冰问你：这一战，规矩站在哪边。"
			},
			{
				requires: [{
					kind: "flag",
					id: "left-kunlun"
				}],
				text: "你没有进昆仑的门。可高处的风仍认得你的肩。"
			},
			{
				requires: [{
					kind: "flag",
					id: "faction-jie"
				}],
				text: "血海的味道洗不掉。阵在你识海里自己在转。"
			},
			{
				requires: [{
					kind: "flag",
					id: "faction-wu"
				}],
				text: "你的骨头开始习惯承重。天一低，骨就应。"
			},
			{
				requires: [{
					kind: "flag",
					id: "heard-bell"
				}],
				text: "钟声在远处，一下。它提醒你：形还在，户籍也还在。"
			},
			{
				requires: [{
					kind: "flag",
					id: "faction-ren"
				}],
				text: "泥的气味比香火更早。你闻得到。人也快了。"
			},
			{
				requires: [{
					kind: "flag",
					id: "retreated"
				}],
				text: "你迟到了。迟到的人若还想劝架，声音会很小。"
			},
			{
				requires: [{
					kind: "flag",
					id: "bore-axe"
				}],
				text: "每当天暗一寸，你肩上的旧伤就热一下。"
			}
		],
		choices: [
			{
				id: "wu",
				text: "站到巫族一侧",
				sub: "用扛，不用辩",
				to: "collapse",
				delta: {
					kill: 12,
					demon: 4
				},
				addFlags: ["side-wu"],
				record: "巫妖战起，你站到巫族一侧。"
			},
			{
				id: "yao",
				text: "站到妖庭一侧",
				sub: "护住日月的轨道",
				to: "collapse",
				delta: {
					qi: 8,
					kill: 8
				},
				addFlags: ["side-yao"],
				record: "巫妖战起，你站到妖庭一侧。"
			},
			{
				id: "peace",
				text: "两边都劝，去拦不周",
				sub: "直的东西听不见小声",
				requires: [{
					kind: "or",
					any: [
						{
							kind: "statMin",
							stat: "virtue",
							value: 12
						},
						{
							kind: "anyFlag",
							ids: [
								"warned-zhou",
								"kunlun-disciple",
								"helped-nuwa"
							]
						},
						{
							kind: "origin",
							id: "ren"
						}
					]
				}],
				visibility: "lock",
				to: "collapse",
				delta: {
					virtue: 10,
					dao: 8
				},
				addFlags: ["side-peace"],
				record: "你试图劝住这一战，人拦在不周之前。"
			},
			{
				id: "ren",
				text: "先去人将生的河边，把火种藏好",
				sub: "战报不写这件事",
				to: "collapse",
				delta: {
					virtue: 12,
					dao: 4
				},
				addFlags: ["side-ren"],
				record: "战起时你没有选边，你去把人的火种藏好。"
			}
		]
	},
	{
		id: "collapse",
		era: "巫妖",
		title: "不周折",
		place: "buzhou",
		paragraphs: [
			"共工一头撞上不周山。不是你拦得住的。他不接受败，不接受的方式很巫：用头。",
			"山折的声音很短。短过开天之斧。斧是开，这一声是缺。",
			"天倾西北，水不是雨，是天河漏了。日的轨迹乱了。有人在笑，笑到一半喉间全是天河。有人在白，白得比月更甚，因为他们用来证明「天归我管」的轨道碎了。"
		],
		asides: [
			{
				requires: [{
					kind: "flag",
					id: "side-wu"
				}],
				text: "祖巫里有人仍想再撞一次，把折撞回直。你知道那是同一种病。"
			},
			{
				requires: [{
					kind: "flag",
					id: "side-yao"
				}],
				text: "妖庭的一支日沉了。帝俊没有哭。他在数还剩几轮天光。"
			},
			{
				requires: [{
					kind: "flag",
					id: "side-peace"
				}],
				text: "你劝过。劝在折声里小得像一粒沙子。沙子也是你曾经在场的证明。"
			},
			{
				requires: [{
					kind: "flag",
					id: "side-ren"
				}],
				text: "你藏好的那点火还在。水正朝它漫过去。"
			},
			{
				requires: [{
					kind: "flag",
					id: "warned-zhou"
				}],
				text: "你说过。说中的预言不会让你高兴。"
			}
		],
		choices: [
			{
				id: "hold",
				text: "扛住塌下来的一角天",
				sub: "巫的语言。道躯会记住",
				to: "mend",
				delta: {
					virtue: 10,
					kill: 8,
					dao: 12,
					life: -30
				},
				addItems: ["buzhou-stone"],
				addFlags: ["held-sky"],
				record: "不周折时，你扛住塌下来的一角天。"
			},
			{
				id: "loot",
				text: "趁乱取一块还烫的天石",
				sub: "缺处最容易长出私心",
				to: "mend",
				delta: {
					demon: 12,
					qi: 10,
					dao: 4
				},
				addItems: ["buzhou-stone"],
				addFlags: ["looted"],
				record: "天倾时你取走一块不周石。"
			},
			{
				id: "save",
				text: "先去救将被水冲走的泥人",
				sub: "战报不记。本纪会记",
				to: "mend",
				delta: {
					virtue: 14,
					dao: 6
				},
				addFlags: ["saved-clay"],
				record: "你从天河水里捞起被冲走的泥人。"
			}
		]
	},
	{
		id: "mend",
		era: "人纪前夜",
		title: "补天",
		place: "wahuan",
		paragraphs: [
			"女娲炼石。五色石的光把洪荒照得像一件尚未晾干的陶器。",
			"青木、赤火、黄金、白水、玄土必须同时在，石才肯承认自己是天的一部分。她喂了炉。仍差一点。差的是「肯被烧」。",
			"石若全是圣人的，补上的天就只认圣人，不认下面的人。炉边其实还缺一个小角色，或一块来历太早的东西。"
		],
		choices: [
			{
				id: "offer",
				text: "把你手里最重的一件物投入炉中",
				sub: "石会软一点，软到能盖住所有人",
				requires: [{
					kind: "anyItem",
					ids: [
						"buzhou-stone",
						"xirang",
						"pangu-bone"
					]
				}],
				visibility: "lock",
				to: "incense",
				delta: {
					virtue: 12,
					dao: 16
				},
				removeOneOf: [
					"buzhou-stone",
					"xirang",
					"pangu-bone"
				],
				addFlags: ["offered-stone"],
				record: "你把一件先天之物投入补天炉。"
			},
			{
				id: "flame",
				text: "以自身灵识入火，助她定石",
				sub: "肯被烧的那一点，就是差的那一点",
				to: "incense",
				delta: {
					virtue: 12,
					dao: 10,
					demon: -4,
					life: -26
				},
				addFlags: ["entered-flame"],
				record: "你把灵识探进补天火里。"
			},
			{
				id: "aside",
				text: "袖手。这是圣人的劫",
				sub: "此后的雨会与你无关",
				to: "incense",
				delta: {
					qi: 8,
					demon: 8
				},
				addFlags: ["stood-aside"],
				record: "补天时你袖手。雨后来正常了，与你无关。"
			}
		]
	},
	{
		id: "incense",
		era: "封神",
		title: "空白的榜",
		place: "board",
		paragraphs: [
			"人族立起来了。他们学会火，因为火会灭，所以必须有人守。他们把鸟迹画成符号，把尝草的死记成不必再死一次的知识。",
			"香火一点点攒，像细雨，终于连成河。河太香。香到天上的旧强者开始饿。",
			"封神台竖起来的那天，榜上一个字都没有。空白比写满更可怕——谁的名字都可以被写上去。写上去的名字，不再只属于自己。"
		],
		asides: [
			{
				requires: [{
					kind: "flag",
					id: "helped-nuwa"
				}],
				text: "你抟过的那些泥，有的已经会在吃饭时想起温暖。气往上走，成为香。"
			},
			{
				requires: [{
					kind: "flag",
					id: "saved-clay"
				}],
				text: "你从水里拽回来的那几个，还活着。他们不认识你的道号，认识你的手。"
			},
			{
				requires: [{
					kind: "flag",
					id: "stood-aside"
				}],
				text: "你没有参与补天。榜看起来因此更像别人的事。它不是。"
			}
		],
		choices: [
			{
				id: "tear",
				text: "撕榜",
				sub: "保住不被书写，也放出更多饿",
				to: "final",
				delta: {
					kill: 12,
					demon: 10,
					dao: 8
				},
				addFlags: ["tore-board"],
				record: "你撕了空白的封神榜。碎片还会长回去。"
			},
			{
				id: "shield",
				text: "护住人族香火，拒不上榜",
				sub: "站在弱的一边，要站很久",
				to: "final",
				delta: {
					virtue: 14,
					dao: 6
				},
				addItems: ["incense"],
				addFlags: ["shielded-humans"],
				record: "你护住香火，拒绝把名字交给榜。"
			},
			{
				id: "enter",
				text: "入局，换一个能改字的位置",
				sub: "你以为你改字。字也会改你",
				to: "final",
				delta: {
					qi: 10,
					dao: 8
				},
				addFlags: ["entered-board"],
				record: "你走入封神局，站到墨迹旁边。"
			},
			{
				id: "walk",
				text: "远走世界的边，不看这一劫",
				sub: "把自己保住，把劫留给别人",
				to: "final",
				delta: {
					qi: 14,
					dao: 6
				},
				addFlags: ["walked-away"],
				record: "你走出量劫，回到混沌那张旧床的边上。"
			}
		]
	},
	{
		id: "final",
		era: "封神",
		title: "你的道",
		place: "board",
		resolve: true,
		paragraphs: [
			"大事件已经发生完了。本纪不会为你改一个字。",
			"剩下的是缝。缝里只有你还肯不肯承认：这一生你最像谁，你最护过谁，你的饿有没有大过你的听。",
			"若有多条路同时亮着，那不是系统仁慈，是你活成了几种人。因果若自行落定，会偏向最沉的那一种。你也可以在最后改口。"
		],
		asides: [
			{
				requires: [{
					kind: "flag",
					id: "tore-board"
				}],
				text: "榜在你手里碎过。碎片会自己长回去，可你的手记住了撕的感觉。"
			},
			{
				requires: [{
					kind: "flag",
					id: "shielded-humans"
				}],
				text: "香火认你的袖口，不认你的名。"
			},
			{
				requires: [{
					kind: "flag",
					id: "entered-board"
				}],
				text: "你已经站在墨迹旁边。差一步，就是字。"
			},
			{
				requires: [{
					kind: "flag",
					id: "walked-away"
				}],
				text: "你走远过。远方的混沌像一张旧床，床很熟，也有点冷。"
			},
			{
				requires: [{
					kind: "flag",
					id: "listened-breath"
				}],
				text: "那半句话还在。它终于等你决定要不要听完。"
			}
		],
		choices: []
	},
	{
		id: "end-dao",
		era: "余响",
		title: "听完的人",
		place: "edge",
		paragraphs: [
			"{{name}}走到混元之门前，没有跪。",
			"门只开了一线。线外不是权力，是盘古没说完的那句话。你听完了。风从西方来，和开天最后那口气是同一个方向。",
			"你没有变成鸿钧。鸿钧是那句话被世界公然说出来的声音。你只是终于可以站在这句话里面，而不散。",
			"昆仑的规矩、血海的阵、巫的骨、妖的形，都在门外变成很小的家具。你认得它们。你只是不再需要被它们代表。",
			"本纪仍不写你的名字。风会写。写在以后每一个肯把「在」坚持到下一搏的灵上。"
		],
		asides: [
			{
				requires: [{
					kind: "flag",
					id: "bore-axe"
				}],
				text: "肩上的温度终于不是亏欠。它是你听懂那句话的耳朵。"
			},
			{
				requires: [{
					kind: "flag",
					id: "offered-stone"
				}],
				text: "补天的火在识海里成了一线金。金不耀眼，只是天不再只认圣人。"
			},
			{
				requires: [{
					kind: "flag",
					id: "shielded-humans"
				}],
				text: "香火不来拜你。它们只是不再那么怕。"
			}
		],
		choices: [],
		ending: {
			name: "听完的人",
			seal: "道"
		}
	},
	{
		id: "end-wu",
		era: "余响",
		title: "扛天者",
		place: "buzhou",
		paragraphs: [
			"{{name}}没有成圣。你成为了重量本身。",
			"十二祖巫仍是十二。你不是第十三个兄弟。兄弟这个词他们不外借。可天在不周折过之后，确实多了一个还肯用身体说话的存在。",
			"人看你，会怕。妖看你，会怒。你不解释。解释是转弯，而你选择的语言里，转弯很少。",
			"只是你若曾经警告过直的东西会折，你的扛就会多一分留白。留白不是软。是你终于允许天不必每寸都由你顶着。",
			"都天之阵没有喊你入列。你自己就是一根较晚竖起的柱。柱会旧。你打算在旧掉之前，把该承的承完。"
		],
		asides: [{
			requires: [{
				kind: "flag",
				id: "warned-zhou"
			}],
			text: "你说过的那句话还在。所以你扛的时候，知道自己在补一个错误，不是在证明蛮力光荣。"
		}, {
			requires: [{
				kind: "flag",
				id: "wu-wrestled"
			}],
			text: "角力留下的裂还在响。响一声，天就稳一分，你就薄一分。"
		}],
		choices: [],
		ending: {
			name: "扛天者",
			seal: "巫"
		}
	},
	{
		id: "end-yao",
		era: "余响",
		title: "日月同座",
		place: "east",
		paragraphs: [
			"帝俊看{{name}}的眼神，终于变成看同类。",
			"你未必称皇。侧座空着，空了很久，像一口为「还没归类的光」留的碗。你坐下的时候，扶桑的叶子没有欢呼。它们只是把阴影让开一点。",
			"太一仍不多话。他把月的冷分了你一线，使你在华美里不至于盲。东皇的钟若再响，你已经知道那是礼，也是刑，便不再把归类当成羞辱。",
			"巫族还是觉得美是多余的。你不与他们争。你只把轨道守住，让天光按应当的数目升起。数目若太多，你会亲手按下去。这是妖庭的慈悲，也很残忍。"
		],
		asides: [{
			requires: [{
				kind: "flag",
				id: "stole-for-humans"
			}],
			text: "人族火塘里有一丝不该属于他们的温。帝俊知道。他没有追。这是你坐上侧座的真正聘礼。"
		}, {
			requires: [{
				kind: "flag",
				id: "true-form"
			}],
			text: "你的形是自己长的，不是户籍发给的。所以座可以坐，也可以走。"
		}],
		choices: [],
		ending: {
			name: "日月同座",
			seal: "妖"
		}
	},
	{
		id: "end-ren",
		era: "余响",
		title: "守火人",
		place: "tribes",
		paragraphs: [
			"人族不给{{name}}立神位。",
			"他们给你留一碗饭，和一夜守火的班。你发现这比封号重。火会灭。灭了，大家就冷。这是此世最早的职位，也是你最后爱上的职位。",
			"女娲说过不要先教会他们跪。你记得。所以你把符号、草药、约，都放在他们手里，不放在香案上。有人还是会跪。你把他们扶起来的次数，比你修行的次数多。",
			"天上仍有饿。你守着的这口锅很小，小到不够喂神魔。够喂一夜的孩子。本纪把这种小写成余响。余响有时比轴心更长。",
			"你老了。人的老是你向他们借的。借来的老里，你第一次懂了连续：一个可以死去的自己，把火交给下一个不会跪着接的手。"
		],
		asides: [{
			requires: [{
				kind: "flag",
				id: "helped-nuwa"
			}],
			text: "有的人的掌纹里有你的温度。他们不知道。不知道就对了。"
		}, {
			requires: [{
				kind: "flag",
				id: "saved-clay"
			}],
			text: "被你从天河里拽起的那几个，后来成了会给别人让火的人。"
		}],
		choices: [],
		ending: {
			name: "守火人",
			seal: "人"
		}
	},
	{
		id: "end-demon",
		era: "余响",
		title: "饥饿",
		place: "chaos",
		paragraphs: [
			"{{name}}还在。可「你」已经是那口饥饿的回声。",
			"混沌气、血海、白拿的天石、撕榜时放出来的饿，最后在同一个地方会合。会合之后就不需要再伪装成道号。",
			"你仍能说话。说出来的每个字都在找吃的。昆仑的门为你窄过，人族的火在你靠近时会矮下去。不是他们残忍。是你的在场本身就是一口嘴。",
			"本纪没有骂你。它只是把你放回第一章：有的光亮一下，就重新变成混沌的一部分。你比它们多坚持了很久。久到足够把「在」活成「吞」。",
			"若还有一星不肯只是饿的东西，它已经小到叫不出{{name}}。"
		],
		asides: [
			{
				requires: [{
					kind: "flag",
					id: "swallowed"
				}],
				text: "开天时那一口，终于把你从里面吃完了。"
			},
			{
				requires: [{
					kind: "flag",
					id: "jie-sword"
				}],
				text: "剑意还在。它不再问你砍谁。"
			},
			{
				requires: [{
					kind: "flag",
					id: "tore-board"
				}],
				text: "榜的碎片在你胃里长成新的空白。空白仍会写字，写的都是饿。"
			}
		],
		choices: [],
		ending: {
			name: "饥饿",
			seal: "魔"
		}
	},
	{
		id: "end-hidden",
		era: "余响",
		title: "旧床",
		place: "edge",
		paragraphs: [
			"{{name}}走到世界边上，没有躺下，也没有回去。",
			"身后是洪荒那间屋子。屋里的榜正在长字，火塘正在换班，昆仑的篱笆和血海的阵仍在各说各的完整。你都听见。你选择不成为其中任何一个句子的主语。",
			"这不光荣。走的人保住了自己，把劫留给了别人。本纪早写过这句话。你既然走到这里，就连这句责备一起收下，不必再辩。",
			"蓬莱的风偶尔来认你。你不去定居。定居会变成另一种门。",
			"你仍是当初不肯散的那一粒。只是你把「在」用在了屋子外面。外面很静。静是你付过账的。"
		],
		asides: [{
			requires: [{
				kind: "flag",
				id: "retreated"
			}],
			text: "闭关是你第一次练习不在场。这一次，你把练习做成了一生。"
		}, {
			requires: [{
				kind: "flag",
				id: "watcher"
			}],
			text: "开天时你就在看。看到最后，你仍是看的那一个。看完了，也是一种到底。"
		}],
		choices: [],
		ending: {
			name: "旧床",
			seal: "隐"
		}
	},
	{
		id: "end-board",
		era: "余响",
		title: "被写成字",
		place: "board",
		paragraphs: [
			"{{name}}的名字落了墨。",
			"你原想站在墨迹旁边，把别人的字改轻一点。字没有跟你商量。它把你的道号收成封号，把你的选择收成职责，把你下界的自由收成一道不许随意饥饿的枷。",
			"枷有用。人族因此多了几夜完整的睡眠。你因此少了把自己再活成别种东西的可能。",
			"有人谢你。谢的是职位，不是{{name}}。你分得清。分得清，是你还没完全被写成官的证明，也很痛。",
			"字比人硬。风口过去以后，字还在。你在。你在字里。"
		],
		asides: [{
			requires: [{
				kind: "flag",
				id: "kunlun-disciple"
			}],
			text: "元始的算计应验了一部分。你恨过。后来恨变成值班。"
		}, {
			requires: [{
				kind: "flag",
				id: "faction-jie"
			}],
			text: "通天的门下多了一个你这样的名字。他仍觉得万物该有座。座现在是你的笼子，也是你的地址。"
		}],
		choices: [],
		ending: {
			name: "被写成字",
			seal: "榜"
		}
	},
	{
		id: "end-free",
		era: "余响",
		title: "空白",
		place: "earth",
		paragraphs: [
			"本纪在{{name}}应该署名的地方，留下一块空白。",
			"空白不是失败。榜上的空白可怕，是因为它等着吃人。你这块空白只是形状像你的选择：你听过一些，扛过一些，护过一些，也放过一些。没有一种厚到盖住别的。",
			"天地没有因此奖你，也没有罚你。雨正常的时候，你站在雨里，知道正常里有女娲的火，有不周的缺，有人族的锅。",
			"你仍会老，或仍不会。这不重要。重要的是你没有把「在」交给一口饿，也没有把它交成一个官职。",
			"后来说书的人讲到开天，偶尔会停一下，好像缝里有谁。他们叫不出名字。叫不出，就对了。"
		],
		choices: [],
		ending: {
			name: "空白",
			seal: "余"
		}
	},
	{
		id: "end-fallen",
		era: "中断",
		title: "散尽",
		place: "edge",
		paragraphs: [
			"{{name}}把道躯用尽了。",
			"不是败。是这一击比你的「在」更重。斧、角力、倾天、炉火——你答应过太多次用自己当界。界可以松。松了，两边的世界还在，你先回去了。",
			"风把你送向混沌那张旧床。床上还有许多只亮过一下的光。你比它们亮得久。久到有人若留心，会在本纪的缝里看见一道提前结束的划痕。",
			"划痕没有名字。可它是热的。热会残留很短的一会儿。"
		],
		asides: [
			{
				requires: [{
					kind: "flag",
					id: "bore-axe"
				}],
				text: "最早的热，是斧脊上的。你从那里开始支付。"
			},
			{
				requires: [{
					kind: "flag",
					id: "wu-wrestled"
				}],
				text: "祖巫没有嘲你。他们懂这种散法。"
			},
			{
				requires: [{
					kind: "flag",
					id: "held-sky"
				}],
				text: "你扛过的那一角，在你散了之后仍暂时不落。暂时，就是你换来的全部。"
			},
			{
				requires: [{
					kind: "flag",
					id: "entered-flame"
				}],
				text: "补天的火里有你。所以雨正常的那一点里，有你被烧掉的名字。"
			}
		],
		choices: [],
		ending: {
			name: "散尽",
			seal: "陨"
		}
	}
];
function assertStory() {
	const ids = /* @__PURE__ */ new Set();
	for (const scene of SCENES) {
		if (ids.has(scene.id)) throw new Error(`duplicate scene ${scene.id}`);
		ids.add(scene.id);
	}
	for (const scene of SCENES) {
		if (scene.resolve) {
			if (scene.choices.length > 0) throw new Error(`${scene.id} resolve should have no baked choices`);
			continue;
		}
		if (scene.ending) {
			if (scene.choices.length > 0) throw new Error(`${scene.id} ending has choices`);
			continue;
		}
		if (scene.choices.length === 0) throw new Error(`${scene.id} has no choices`);
		const choiceIds = /* @__PURE__ */ new Set();
		for (const choice of scene.choices) {
			if (choiceIds.has(choice.id)) throw new Error(`duplicate choice ${scene.id}/${choice.id}`);
			choiceIds.add(choice.id);
			if (choice.to !== "@best" && !ids.has(choice.to)) throw new Error(`${scene.id}/${choice.id} -> missing ${choice.to}`);
			for (const itemId of [...choice.addItems ?? [], ...choice.removeOneOf ?? []]) if (!ITEMS[itemId]) throw new Error(`unknown item ${itemId}`);
		}
	}
	if (!ids.has("awaken") || !ids.has("final") || !ids.has("end-fallen")) throw new Error("missing required scenes");
}
assertStory();
function sceneById(id) {
	return SCENES.find((scene) => scene.id === id);
}
var STAT_CAP = {
	dao: 400,
	qi: 160,
	kill: 160,
	virtue: 160,
	demon: 100,
	life: 100
};
var INITIAL = {
	version: 1,
	screen: "title",
	started: false,
	name: "",
	origin: null,
	sceneId: "awaken",
	stats: {
		dao: 0,
		qi: 0,
		kill: 0,
		virtue: 0,
		demon: 0,
		life: 100
	},
	items: [],
	flags: [],
	log: [],
	seen: [],
	novelIndex: 0,
	sound: true,
	pastLives: []
};
function fresh() {
	return structuredClone(INITIAL);
}
function meetsCond(state, cond) {
	switch (cond.kind) {
		case "statMin": return state.stats[cond.stat] >= cond.value;
		case "statMax": return state.stats[cond.stat] <= cond.value;
		case "item": return state.items.includes(cond.id);
		case "anyItem": return cond.ids.some((id) => state.items.includes(id));
		case "flag": return state.flags.includes(cond.id);
		case "notFlag": return !state.flags.includes(cond.id);
		case "origin": return state.origin === cond.id;
		case "anyFlag": return cond.ids.some((id) => state.flags.includes(id));
		case "or": return cond.any.some((child) => meetsCond(state, child));
		case "and": return cond.all.every((child) => meetsCond(state, child));
		default: return false;
	}
}
function choiceOpen(state, choice) {
	return (choice.requires ?? []).every((cond) => meetsCond(state, cond));
}
function lockReason(state, choice) {
	if (choiceOpen(state, choice)) return null;
	for (const cond of choice.requires ?? []) if (!meetsCond(state, cond)) return reasonFor(state, cond);
	return "此路未开";
}
function reasonFor(state, cond) {
	switch (cond.kind) {
		case "statMin": return "尚未够到";
		case "statMax": return "心性过重";
		case "item": return `缺少${ITEMS[cond.id]?.name ?? "物"}`;
		case "anyItem": return "手中没有能投入的物";
		case "flag":
		case "notFlag":
		case "anyFlag": return "因果未至";
		case "origin": return "根骨不合";
		case "or": return "此门未开";
		case "and": {
			const failed = cond.all.find((child) => !meetsCond(state, child));
			return failed ? reasonFor(state, failed) : "此路未开";
		}
		default: return "此路未开";
	}
}
function qualDao(state) {
	return state.stats.dao >= 96 && state.stats.virtue >= 36 && state.stats.demon < 34 && (state.flags.includes("heard-hongjun") || state.flags.includes("listened-breath"));
}
function qualWu(state) {
	return state.stats.kill >= 36 && [
		"side-wu",
		"faction-wu",
		"wu-blood",
		"wu-wrestled"
	].some((flag) => state.flags.includes(flag));
}
function qualYao(state) {
	return state.stats.qi >= 26 && [
		"side-yao",
		"faction-yao",
		"heard-bell",
		"true-form"
	].some((flag) => state.flags.includes(flag));
}
function qualRen(state) {
	return state.stats.virtue >= 52 && [
		"helped-nuwa",
		"saved-clay",
		"shielded-humans",
		"blood-in-clay",
		"stole-for-humans",
		"side-ren"
	].some((flag) => state.flags.includes(flag));
}
function qualDemon(state) {
	return state.stats.demon >= 40;
}
function qualHidden(state) {
	return state.flags.includes("walked-away") && state.stats.demon < 32;
}
function qualBoard(state) {
	return state.flags.includes("entered-board");
}
function endingChoice(id, text, sub, record) {
	return {
		id,
		text,
		sub,
		to: id,
		record,
		visibility: "hide"
	};
}
function bestEnding(state) {
	if (state.stats.life <= 0) return "end-fallen";
	if (qualDemon(state)) return "end-demon";
	if (qualDao(state)) return "end-dao";
	if (qualRen(state)) return "end-ren";
	if (qualWu(state)) return "end-wu";
	if (qualYao(state)) return "end-yao";
	if (qualHidden(state)) return "end-hidden";
	if (qualBoard(state)) return "end-board";
	return "end-free";
}
function rawChoices(state) {
	const scene = sceneById(state.sceneId);
	if (!scene) return [];
	if (scene.ending) return [];
	if (!scene.resolve) return scene.choices;
	const list = [];
	if (qualDao(state)) list.push(endingChoice("end-dao", "走向混元之门", "以所闻证自己，不证权位", "你走到混元之门前，没有跪。"));
	if (qualWu(state)) list.push(endingChoice("end-wu", "以巫骨立于天地之间", "不成圣，成为重量", "你选择继续用身体说话。"));
	if (qualYao(state)) list.push(endingChoice("end-yao", "坐上妖庭空着的那一侧", "形终于被认作同类", "你在日月之侧坐下。"));
	if (qualRen(state)) list.push(endingChoice("end-ren", "留在人族的火旁", "一碗饭，一夜班", "你留下守火，不立神位。"));
	if (qualDemon(state)) list.push(endingChoice("end-demon", "让心魔把你说完", "饿已经比道号更大", "你让饥饿替你收束这一生。"));
	if (qualHidden(state)) list.push(endingChoice("end-hidden", "走出这一劫，不再回头", "把自己留在屋子外面", "你留在世界边上，不回去做句子的主语。"));
	if (qualBoard(state)) list.push(endingChoice("end-board", "把名字写进榜里", "字会改你", "你让名字落墨。"));
	list.push({
		id: "fate",
		text: "任因果自行落定",
		sub: "不抢结局，看这一生最像什么",
		to: "@best",
		record: "你松开手，让这一生自己收束。"
	});
	return list;
}
function visibleChoices(state) {
	return rawChoices(state).filter((choice) => choice.visibility !== "hide" || choiceOpen(state, choice)).map((choice) => ({
		choice,
		open: choiceOpen(state, choice),
		reason: lockReason(state, choice)
	}));
}
function clampStat(key, value) {
	return Math.max(0, Math.min(STAT_CAP[key], value));
}
function fill(text, state) {
	const name = state.name || "未名";
	return text.replaceAll("{{name}}", name);
}
function cleanName(raw) {
	return raw.replace(/\s+/g, "").slice(0, 8);
}
function applyChoice(state, choice, nameOverride) {
	const scene = sceneById(state.sceneId);
	if (!scene || scene.ending) return state;
	if (!choiceOpen(state, choice)) return state;
	const next = {
		...state,
		stats: { ...state.stats },
		items: [...state.items],
		flags: [...state.flags],
		log: [...state.log],
		seen: [...state.seen]
	};
	if (choice.setOrigin) next.origin = choice.setOrigin;
	if (choice.setName) next.name = choice.setName;
	const override = nameOverride ? cleanName(nameOverride) : "";
	if (override) next.name = override;
	if (choice.delta) for (const key of Object.keys(choice.delta)) {
		const amount = choice.delta[key];
		if (typeof amount !== "number") continue;
		next.stats[key] = clampStat(key, next.stats[key] + amount);
	}
	for (const itemId of choice.addItems ?? []) if (!next.items.includes(itemId)) next.items.push(itemId);
	if (choice.removeOneOf) {
		const hit = choice.removeOneOf.find((itemId) => next.items.includes(itemId));
		if (hit) next.items = next.items.filter((itemId) => itemId !== hit);
	}
	for (const flag of choice.addFlags ?? []) if (!next.flags.includes(flag)) next.flags.push(flag);
	if (!next.seen.includes(scene.id)) next.seen.push(scene.id);
	const record = fill(choice.record ?? choice.text, next);
	next.log.push({
		sceneId: scene.id,
		title: scene.title,
		choice: record
	});
	let to = choice.to === "@best" ? bestEnding(next) : choice.to;
	if (next.stats.life <= 0) to = "end-fallen";
	const dest = sceneById(to);
	if (!dest) return state;
	next.sceneId = dest.id;
	if (!next.seen.includes(dest.id)) next.seen.push(dest.id);
	return next;
}
function deltaHint(delta) {
	if (!delta) return "";
	const labels = {
		dao: "道行",
		qi: "气运",
		kill: "杀伐",
		virtue: "仁德",
		demon: "心魔",
		life: "道躯"
	};
	return Object.keys(delta).filter((key) => typeof delta[key] === "number" && delta[key] !== 0).map((key) => {
		const amount = delta[key] ?? 0;
		const sign = amount > 0 ? "+" : "";
		return `${labels[key]}${sign}${amount}`;
	}).join(" ");
}
function lifeText(state) {
	const origin = state.origin ? ORIGINS[state.origin].name : "未选根骨";
	const scene = sceneById(state.sceneId);
	const lines = [
		`《${state.name || "未名"}》`,
		`${origin} · ${realmOf(state.stats.dao).name}`,
		"",
		...state.log.map((line) => `${line.title}：${line.choice}`)
	];
	if (scene?.ending) lines.push("", `归处：${scene.ending.name}`);
	return lines.join("\n");
}
function archiveLife(state) {
	if (!state.started && state.log.length === 0) return null;
	if (state.log.length === 0 && !state.origin) return null;
	const scene = sceneById(state.sceneId);
	return {
		name: state.name || "未名",
		origin: state.origin,
		ending: scene?.ending?.name ?? "未竟",
		seal: scene?.ending?.seal ?? "止",
		lines: state.log.map((line) => `${line.title}：${line.choice}`)
	};
}
function flagLabel(flag) {
	return FLAG_LABEL[flag] ?? flag;
}
function memoryStorage() {
	const mem = /* @__PURE__ */ new Map();
	return {
		get length() {
			return mem.size;
		},
		clear: () => mem.clear(),
		getItem: (key) => mem.get(key) ?? null,
		key: (index) => [...mem.keys()][index] ?? null,
		removeItem: (key) => {
			mem.delete(key);
		},
		setItem: (key, value) => {
			mem.set(key, value);
		}
	};
}
function browserStorage() {
	if (typeof window === "undefined") return memoryStorage();
	return {
		get length() {
			return localStorage.length;
		},
		clear: () => localStorage.clear(),
		key: (index) => localStorage.key(index),
		getItem: (key) => {
			try {
				return localStorage.getItem(key);
			} catch {
				return null;
			}
		},
		setItem: (key, value) => {
			try {
				const prev = localStorage.getItem(key);
				if (prev) localStorage.setItem(`${key}-bak`, prev);
				localStorage.setItem(key, value);
			} catch {}
		},
		removeItem: (key) => {
			try {
				localStorage.removeItem(key);
			} catch {}
		}
	};
}
function sanitize(persisted) {
	const base = fresh();
	if (!persisted || typeof persisted !== "object") return base;
	const raw = persisted;
	const stats = {
		...base.stats,
		...raw.stats ?? {}
	};
	const next = {
		...base,
		...raw,
		version: 1,
		stats,
		items: Array.isArray(raw.items) ? raw.items.filter((item) => typeof item === "string") : [],
		flags: Array.isArray(raw.flags) ? raw.flags.filter((flag) => typeof flag === "string") : [],
		log: Array.isArray(raw.log) ? raw.log : [],
		seen: Array.isArray(raw.seen) ? raw.seen.filter((id) => typeof id === "string") : [],
		pastLives: Array.isArray(raw.pastLives) ? raw.pastLives.slice(-8) : [],
		novelIndex: typeof raw.novelIndex === "number" ? raw.novelIndex : 0,
		sound: raw.sound !== false,
		name: typeof raw.name === "string" ? raw.name : "",
		sceneId: typeof raw.sceneId === "string" ? raw.sceneId : "awaken",
		screen: raw.screen ?? "title",
		started: Boolean(raw.started),
		origin: raw.origin ?? null
	};
	if (!sceneById(next.sceneId)) next.sceneId = "awaken";
	return next;
}
var useSave = create()(persist((set, get) => ({
	...INITIAL,
	hydrated: false,
	setHydrated: (value) => set({ hydrated: value }),
	setScreen: (screen) => set({ screen }),
	begin: () => {
		if (!get().started) {
			set({
				started: true,
				screen: "play",
				sceneId: "awaken",
				seen: ["awaken"]
			});
			return;
		}
		set({ screen: "play" });
	},
	choose: (choice, nameOverride) => {
		set(applyChoice(get(), choice, nameOverride));
	},
	setNovelIndex: (index) => set({ novelIndex: index }),
	setSound: (sound) => set({ sound }),
	rename: (name) => set({ name: cleanName(name) }),
	restart: () => {
		const cur = get();
		const archived = archiveLife(cur);
		const pastLives = archived ? [...cur.pastLives, archived].slice(-8) : cur.pastLives;
		set({
			...fresh(),
			hydrated: true,
			screen: "play",
			started: true,
			sceneId: "awaken",
			seen: ["awaken"],
			novelIndex: cur.novelIndex,
			sound: cur.sound,
			pastLives
		});
	}
}), {
	name: "honghuang-ji-save",
	version: 1,
	skipHydration: true,
	storage: createJSONStorage(browserStorage),
	partialize: (state) => {
		const { hydrated: _hydrated, setHydrated: _a, setScreen: _b, begin: _c, choose: _d, setNovelIndex: _e, setSound: _f, rename: _g, restart: _h, ...data } = state;
		return data;
	},
	merge: (persisted, current) => {
		const data = sanitize(persisted);
		return {
			...current,
			...data,
			hydrated: current.hydrated
		};
	}
}));
function CodexView() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto w-full max-w-3xl px-4 py-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-gold",
					children: "天书"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-serif text-3xl",
					children: "这一方世界的全部设定"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-dim",
					children: "与《混沌本纪》、与你的入世，是同一套因果。不必打通关才许阅读。"
				})
			]
		}), CODEX_CATEGORIES.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-sm tracking-widest text-gold",
				children: category
			}), CODEX.filter((entry) => entry.category === category).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "entry",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-dim",
					children: "展开"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "copy pb-4",
					children: entry.paragraphs.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: paragraph }, paragraph.slice(0, 24)))
				})]
			}, entry.id))]
		}, category))]
	});
}
var REGIONS = [
	"未开",
	"天",
	"洪荒",
	"人境",
	"海",
	"下"
];
function LandView() {
	const sceneId = useSave((state) => state.sceneId);
	const seen = useSave((state) => state.seen);
	const started = useSave((state) => state.started);
	const currentPlace = sceneById(sceneId)?.place;
	const visited = new Set(seen.map((id) => sceneById(id)?.place).filter((place) => Boolean(place)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto w-full max-w-3xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-gold",
					children: "山河"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-serif text-3xl",
					children: "地志"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-dim",
					children: "大事件发生在这些地方。你改变不了山折与否，只能决定自己站在哪一层风里。"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-6 grid gap-2",
				children: LAYERS.map((layer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border border-line-dark bg-raised px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-lg text-gold",
						children: layer.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm leading-relaxed text-dim",
						children: layer.note
					})]
				}, layer.name))
			}),
			REGIONS.map((region) => {
				const places = PLACES.filter((place) => place.region === region);
				if (places.length === 0) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-sm tracking-widest text-gold",
						children: region
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid gap-3",
						children: places.map((place) => {
							const here = started && currentPlace === place.id;
							const been = visited.has(place.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border border-line-dark px-4 py-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-serif text-xl",
											children: place.name
										}), here ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-gold",
											children: "你在此处"
										}) : been ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-dim",
											children: "曾至"
										}) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-gold",
										children: place.summary
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-dim",
										children: place.detail
									})
								]
							}, place.id);
						})
					})]
				}, region);
			})
		]
	});
}
var NOVEL_PREFACE = ["《混沌本纪》不是某一位仙的传。它是这一方天地从「没有名字」到「名字开始伤人」的记录。", "盘古仍会倒下，不周仍会折，女娲仍会补天，榜仍会出现。正史不改字。入世的那一缕灵，走在字与字的缝里。"];
var CHAPTERS = [
	{
		id: "c1",
		volume: "卷一 · 混沌",
		title: "不散",
		paragraphs: [
			"混沌没有边。边是后来的人怕无边，才发明的词。",
			"那时没有天，也没有地。清与浊挤在同一处，像两股不肯分开的水，又像一个还没决定醒不醒的梦。梦里有声音，声音并不说话。它只是在，并且因为在，便有了极慢的搏动。",
			"搏动里偶尔亮起一粒光。光不是星。星需要夜，夜需要天已经分开。这些光只是「肯停留的东西」。大多数停留不住。它们亮一下，便重新变成混沌的一部分，连自己曾经亮过都不记得。",
			"有一粒记得。",
			"它记不住形状，因为形状也还没有。它只记得一种不肯散的劲：四周都在往回收，它偏要留在原来的那一点上。这一点后来被叫作灵。当时没有人叫它。",
			"灵的四周，同类生了又灭。灭不是死。死需要曾经活过。它们只是没有把「在」坚持到下一搏。",
			"很久以后，有人把这一段写成：鸿蒙未判，道在其中。写的人已经有了笔，有了简，有了怕被忘掉的心。他不知道自己写的那粒光，当时连怕都没有。它只是不散。",
			"不散，便成了后来一切故事的缝。"
		]
	},
	{
		id: "c2",
		volume: "卷一 · 混沌",
		title: "斧",
		paragraphs: [
			"盘古不是被生出来的。混沌太满，满到必须有一个「向外」的动作，那个动作自己长成了人的样子。人字在那时也不对。他没有同类。他只是站起来了。",
			"斧比他先完成。也可以说斧就是他的决定：要把挤在一起的清与浊，改成上下。",
			"第一斧落下的时候，没有光。光要等清气走远了才有地方停。先有的是痛。混沌痛，是因为被撕开的东西都会痛。盘古痛，是因为他必须站在裂口里，用身体当界。界一松，两边就会重新合上。",
			"所以他没有休息。休息是世界安定以后才有的奢侈。",
			"斧声一下一下，像后来的年。每一下，天高一点，地厚一点，他的身体也薄一点。薄不是虚弱。他把自己交出去，交到刚分开的两边里，好让两边记住彼此曾经相连。",
			"暗处有极小的灵。有的扑到斧脊上，被震得几乎散掉，却把那一下温度记住了。有的吞下飞溅的混沌，从此心里永远有一口没消化的夜。有的只是看。看，也会在灵上留下印子。",
			"本纪不写这些小灵的名字。它们当时也没有。"
		]
	},
	{
		id: "c3",
		volume: "卷一 · 混沌",
		title: "倒下也是开",
		paragraphs: [
			"盘古走到不能再走的那一步，天地已经有了。他若继续站着，自己就成了多余的柱子。柱子会旧，旧了会歪。他选择倒下。",
			"呼吸散开，变成风。风第一次从东吹到西，是因为他的最后一口气是朝西去的。",
			"血汇成海。海所以咸，是因为那不是水，是还没冷却的生命。",
			"骨作山。山的脉络有的地方像肋骨，有的地方像一根不肯弯的脊。不周山最直。直的东西后来最容易折。",
			"双眼分开。一只极热，悬挂在高处，成为日的前身；一只极冷，沉到西边，成为月的前身。那时候日还没有决定自己是一颗还是许多颗。妖庭的故事还在后面。",
			"头发变成森林。筋变成道路。人还没学会走，道路已经先在了。灵识没有完全灭。很大的一部分沉进了土，很小的一部分留在风里，像一句没有说完的话。后来所有修行，说到底都是在找这句没说完的话。",
			"有人拾走一块未冷的骨。有人追着那口气跑。有人跟着血走进海里，海接受了他们，也记住了他们的饿。",
			"天地从此有了内外。有内外，就有了门。"
		]
	},
	{
		id: "c4",
		volume: "卷二 · 讲道",
		title: "紫霄",
		paragraphs: [
			"不知几万载。载这个字也是后来补上的。当时只觉得，山已经长出了纹路，海已经学会了潮。",
			"三十三天一层层叠起来，像有人把清气折成了台阶。最高处不是天。最高处是一个忽然出现的宫。宫不占地方，可所有地方都能看见它的影子。影子的名字叫紫霄。",
			"宫里坐着鸿钧。",
			"没有人见他从哪里来。比较接近的说法是：盘古把世界说了一半，鸿钧是剩下那一半终于被说出来的声音。他不创造。他讲。讲，是让已经存在的东西认出自己。",
			"第一句话很短。短到门外的神魔以为自己没听见。再听，才发现山在跟着那句话改形状，海在跟着那句话改深浅。道不是命令。道是一种「原来如此」。",
			"他讲了很久。久到灯花可以再开一次天。讲完之前，谁也不知道自己是在听道，还是在被道听。"
		]
	},
	{
		id: "c5",
		volume: "卷二 · 讲道",
		title: "座上与门外",
		paragraphs: [
			"来听的太多。宫里的座位却有数。有数不是小气。是有的灵听得见，有的灵只想把听见的东西抢走。",
			"座上的人后来被叫作圣人、准圣、大能。当时他们只是一群终于安静下来的光。安静很重要。道怕吵。吵不是声音大，是心里有算计。",
			"门外也站着许多。他们不是不配。他们是还没决定要不要放下手里的东西：一口混沌，一掌巫力，一口饿。鸿钧并不赶他们。他让门开着。开着的门比关上的门更难进，因为你得自己承认你进不去。",
			"有的小灵坐在末座，听得断续。断续也是听。只是灯里溢出来的那缕紫气，不肯落到还抓着别的东西的手上。",
			"也有人在门外笑。笑的那位后来立了截教。他觉得万物都该有座，不该只有几个人有座。这个想法干净，也很危险。干净的危险比脏的危险难防。"
		]
	},
	{
		id: "c6",
		volume: "卷二 · 讲道",
		title: "分道",
		paragraphs: [
			"讲道结束的时候，世界第一次出现了派。",
			"老子往西去。他看着将生未生的人，像看着一种还很软的可能。他不多说话。话太满，人就会照着话活，不再照着自己活。",
			"元始上昆仑。昆仑高，高处适合立规矩。规矩是好东西，也是篱笆。篱笆护得住苗，也挡得住不该被挡的风。玉虚看因果。抢来的道，山门不收。",
			"通天下血海。他收的不是最正的，是最多的。最多，就有了阵。阵一成，个人的道就容易变成阵的一部分。他知道，可他还是收。因为他不忍心看门外那些灵永远在门外。",
			"女娲没有入这三门。她在底下捏泥。泥的事，紫霄宫的座位讨论不到。",
			"三清之名是后人叫的。当时只是三个方向：西、上、与海。",
			"小灵们也各自选。选昆仑的，把杀心按进戒律里。选血海的，让剑意先于名字长出来。选巫的，用身体去量天有多高。选妖的，向日月借一个形。还有的谁也不选，顺着泥与火的气味往下走，去看一种尚未诞生的弱。",
			"本纪把这一段叫作分道。道本身不分。分的是走路的人。"
		]
	},
	{
		id: "c7",
		volume: "卷三 · 巫妖",
		title: "身体里的天",
		paragraphs: [
			"巫族不修飞升。他们觉得把身体修到能扛天，就是道。",
			"十二祖巫从盘古的不同部位里醒过来，一醒就是完整的。帝江没有面目，混沌还留在他身上。祝融是火，火到可以重写一片林。共工是水，水到不肯承认岸。后土最静，静到众生后来都想葬在她的沉默里。其余的，木与春，金与秋，海，时间的缝，凶，阴，以及尸与生的边界，各占一种不讲理。",
			"他们称兄弟。兄弟的意思不是温存，是：我们这种存在方式，只此十二人。",
			"巫族看不起借外物的修法。钟是外物，香火是外物，甚至太漂亮的悟在他们看来也有点取巧。你要么扛得住，要么被天压扁。没有第三种故事。",
			"这种干净让他们强大，也让他们不会转弯。天柱将折的时候，不会转弯的人会把折当成一种角力。",
			"十二人若同时站定，天会被他们的身体接成一座阵。阵没有名字的时候最可怕。后人称它都天。本纪记下这个可能，是为了说明：他们不是十二个蛮夫，他们是一种完整到不能商量的天。"
		]
	},
	{
		id: "c8",
		volume: "卷三 · 巫妖",
		title: "妖庭",
		paragraphs: [
			"妖不是后来才有的。山精、鸟魂、河里一段不肯散的光，早就各自活着。它们散。帝俊把散的收成了朝。",
			"他座下有许多太阳。不是比喻。那些日是他的子，也是他的兵，也是天亮的理由。太一管月与海，冷，准，不多话。东皇太一带着钟。钟一响，万物的形会短暂地记起自己该归哪一类。钟是礼，也是刑。",
			"妖庭华美。华美到巫族觉得恶心。巫族觉得美是多余的，多余就会在大战里先死。妖庭觉得巫族粗陋，粗陋的东西不配决定天地的样子。",
			"两边都没错到可以悔改，也都对到可以开战。",
			"龙族那时还在。凤也在。麒麟不多，但在。它们比巫妖都老，老到不愿意再站队。北冥的鲲鹏更老，老到朝与阵的请帖都像幼童的游戏。龙汉余波之后，这些古老的活物把最亮的鳞与羽收起来，退进深海与火山。退不是灭。是不再参与「谁来代表天地」这种很吵的问题。"
		]
	},
	{
		id: "c9",
		volume: "卷三 · 巫妖",
		title: "不周",
		paragraphs: [
			"仗打了很多年。年里全是名字，名字里全是仇。本纪若把每场都写下，简会不够用，恨却一点不会少。",
			"真正改写天地的只有一下。",
			"共工与太阳之一相撞，败相已成。他不接受败。不接受的方式很巫：用头。不周山当时还直着，直着承担西北的天。共工一头撞上去，像跟盘古留下的骨头争一个道理。",
			"山折了。",
			"天倾西北，地陷东南。水从缺口里倒下来，不是雨，是天河漏了。日的轨迹乱了，月也冷得发暗。妖庭损失的不只是脸面，是他们赖以证明「天归我管」的那些星辰轨道。巫族损失的则是一句一直被相信的话：我们扛得住。",
			"山折的声音很短。短过斧。斧是开，这一声是缺。",
			"缺处后来长出许多小事：有人去扛塌下来的一角，有人去捡还烫的石头，有人先跑向还很软的泥，把它们从水里捞起来。这些事不进大能的战报。战报只写胜负。本纪写漏出来的水，和被水冲走又被拽回来的泥。"
		]
	},
	{
		id: "c10",
		volume: "卷四 · 人",
		title: "泥",
		paragraphs: [
			"女娲造人，不是因为寂寞这么简单。寂寞是后人能理解的理由。更早的理由是：天地缺一口不一样的气。",
			"神魔太完整。完整的东西不生长，只扩张。巫妖一战证明了扩张会把天撞出洞。女娲要一种会老、会死、会把经验交给下一个自己的存在。弱，但是连续。",
			"泥是盘古血水流过的土。她用手抟。抟这个动作很慢，慢到像在道歉。有的小灵把气息借给泥，泥就暖一点。有的把一块不该那么早离开天地的东西掺进去，人因此会做一个很长的梦。有的远远看着，怕一看就会爱上，一爱就要负责。",
			"人睁开眼的第一件事不是修炼。是冷。第二件事是寻找旁边还有没有同样会冷的。女娲看见这一眼，知道成了。会找同类的生物，才有族。",
			"她说：不要先教会他们跪。",
			"这句话许多大能没听见。听见的，后来也不一定做得到。"
		]
	},
	{
		id: "c11",
		volume: "卷四 · 人",
		title: "五色石",
		paragraphs: [
			"天的洞不会自己长好。女娲炼石。",
			"五色不是装饰。青木、赤火、黄金、白水、玄土，五种气必须同时在，石才肯承认自己是天的一部分，而不是一块更漂亮的石头。",
			"炉火要用自己的道去喂。她喂。仍差一点。差的那一点，是「肯被烧」。圣人可以炼石，可石若全是圣人的，天补上以后就只认圣人，不认下面的人。",
			"所以炉边若有一块来自不周的碎石，一块会自己长的息壤，一根尚未把冷学完的盘古骨，或者一个愿意把灵识探进火里的小角色，石的性子就会软一点。软到能盖住所有人的天，而不只是盖住宝座。",
			"也有人袖手。他们说这是圣人的劫。本纪不骂他们。本纪只记下：袖手的人此后看雨，总会觉得雨与自己无关。",
			"补天之后，雨正常了。正常是一种伟大。人很少歌颂正常。他们歌颂英雄。女娲并不计较。她看了看新补的天，像看一件补过的衣裳：能穿，就好。",
			"地的东南仍低着。低着，水才有地方去，江河才肯流。她没有把地也填平。平的世界没有海，没有海的世界会忘记自己曾经是血。"
		]
	},
	{
		id: "c12",
		volume: "卷四 · 人",
		title: "薪火",
		paragraphs: [
			"人学会了火。火比神魔赐的光更好用，因为它会灭，所以必须有人守着。守火的人被叫作第一批有职位的人。职位不是官。是「你若睡了，大家就冷」。",
			"伏羲看鸟的脚印、看龟、看自己的手，画出八种符号。符号让人可以在事情发生之前谈论事情。这是巫妖都轻视的能力。他们习惯事情直接发生在身上。人把事情变成可以传递的形，于是单个的人可以死，族却能比神魔的记忆更长。",
			"神农尝草。尝到死过几回，又被族人用别的草拽回来。死在人这里不是终结，是一个被记下的错误。错误被记下，就不再需要下一个用命去买同样的知识。",
			"香火是这时起来的。不是人故意献媚。是他们吃饭时会想起「让我们能吃饭的那些名字」，一想，气就往上走。气运本是散的，被想念聚拢，就成了香。",
			"香很香。香到天上有人开始饿。",
			"饿，是封神的真正起因。不是善，不是恶。是一种新的食物出现了，而旧的强者还没学会不吃。"
		]
	},
	{
		id: "c13",
		volume: "卷五 · 榜",
		title: "空白的榜",
		paragraphs: [
			"榜立起来的那天，上面一个字都没有。",
			"空白比写满更可怕。写满了，至少知道谁已死定。空白意味着：任何名字都还来得及被叫到。",
			"有人说这是气运的重新分配。巫妖之战把旧的气运撞碎了，碎片若任由强者抢，人族会在长成之前被抢干净。榜是一种残酷的秩序：把一部分大能的位子固定下来，换成封号，换成职责，也换成不能再随意下界吞食的枷锁。",
			"有人说这是阴谋。自然是。所有秩序在失去自由的人眼里都是阴谋。通天的弟子很多会上去。元始的算计很多会应验。老子大概早已出关，不看。女娲闭了宫门。她把该做的做完了，不愿再看孩子们的名字被写成官职。",
			"小灵们在榜前各有选择。撕，护，入，走。没有一种是干净的。撕的人保住了「不被书写」，也放出了更多饿。护的人要站在弱的一边，站很久。入的人以为自己能从榜内部把字改轻一点，后来才知道字会改人。走的人保住了自己，也把这一劫整个留给别人。",
			"本纪都不嘲讽。嘲讽是站在结局里向过程扔石头。"
		]
	},
	{
		id: "c14",
		volume: "卷五 · 榜",
		title: "余响",
		paragraphs: [
			"榜终于有了字。有的字是英雄，有的字只是当时站错了风口。风口过去，字还在。字比人硬。",
			"人族没有因此立刻成为天地的主人。他们只是获得了一段不必每晚防着神魔的睡眠。睡眠很短。短睡眠里，他们开始种地、吵架、立约、背叛、再立约。三皇以后是五帝，五帝以后是另一种更吵的东西，叫作史。",
			"史不是本纪。本纪写天地如何开，如何缺，如何被补，如何开始用名字伤人。史写人如何在被补好的天底下，自己把自己写满。",
			"混沌还在世界边上。它没有被斧完全消灭。斧只是在它身上开了一间屋子。屋子叫洪荒。屋子里的人、巫、妖、仙，都是暂时的家具。家具有时会以为自己是屋子。",
			"若有一缕当初不肯散的灵，走到这一卷的末尾还在，它该知道三件事。",
			"第一，道不为你证，你证的只是你自己。",
			"第二，护住弱的，不是因为弱者神圣，是因为连续比完整更难得。",
			"第三，名字一旦写上榜，就不再只属于你。所以在那之前，把你的名字用在你真正认得的人身上。",
			"本纪到此。",
			"后面的路，交给入世的那一位。"
		]
	}
];
function NovelView() {
	const index = useSave((state) => state.novelIndex);
	const setNovelIndex = useSave((state) => state.setNovelIndex);
	const safe = Math.min(CHAPTERS.length - 1, Math.max(0, index));
	const chapter = CHAPTERS[safe];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto w-full max-w-3xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-gold",
						children: NOVEL_NAME
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-serif text-3xl text-fog",
						children: "正史"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 max-w-2xl text-sm leading-relaxed text-dim",
						children: NOVEL_PREFACE.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: line }, line))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-3",
				children: CHAPTERS.map((item, itemIndex) => {
					const current = itemIndex === safe;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setNovelIndex(itemIndex),
						className: current ? "shrink-0 bg-cinnabar px-3 py-2 font-serif text-sm text-paper" : "shrink-0 border border-line-dark px-3 py-2 font-serif text-sm text-fog",
						"aria-current": current ? "true" : void 0,
						children: item.title
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "manuscript rise p-5 md:p-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-cinnabar",
						children: chapter.volume
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-serif text-3xl",
						children: chapter.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "copy mt-6",
						children: chapter.paragraphs.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: paragraph }, paragraph))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-3 border-t border-line pt-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-ink",
								disabled: safe === 0,
								onClick: () => setNovelIndex(safe - 1),
								children: "上一章"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-ink",
								disabled: safe === CHAPTERS.length - 1,
								onClick: () => setNovelIndex(safe + 1),
								children: "下一章"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "self-center text-sm text-fg/70",
								children: [
									safe + 1,
									" / ",
									CHAPTERS.length
								]
							})
						]
					})
				]
			}, chapter.id)
		]
	});
}
var ctx = null;
function context() {
	if (typeof window === "undefined") return null;
	const WebAudio = window.AudioContext;
	if (!WebAudio) return null;
	if (!ctx) ctx = new WebAudio();
	return ctx;
}
function unlockSound() {
	const audio = context();
	if (audio?.state === "suspended") audio.resume();
}
function playChoice(enabled) {
	if (!enabled) return;
	const audio = context();
	if (!audio) return;
	if (audio.state === "suspended") audio.resume();
	const now = audio.currentTime;
	const osc = audio.createOscillator();
	const gain = audio.createGain();
	osc.type = "sine";
	osc.frequency.setValueAtTime(392, now);
	osc.frequency.exponentialRampToValueAtTime(523.25, now + .18);
	gain.gain.setValueAtTime(1e-4, now);
	gain.gain.exponentialRampToValueAtTime(.035, now + .02);
	gain.gain.exponentialRampToValueAtTime(1e-4, now + .38);
	osc.connect(gain);
	gain.connect(audio.destination);
	osc.start(now);
	osc.stop(now + .4);
}
function LifeCopy() {
	const state = useSave();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const text = lifeText(state);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "btn-ink",
		onClick: () => setOpen(true),
		children: "抄录此生"
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 grid place-items-center bg-ink/80 px-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "copy-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "manuscript max-h-[80vh] w-full max-w-lg overflow-auto p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "copy-title",
					className: "font-serif text-2xl",
					children: "此生抄本"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					readOnly: true,
					value: text,
					className: "mt-4 h-56 w-full border border-line bg-paper-deep p-3 font-serif text-sm leading-relaxed text-fg"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-primary",
							onClick: () => {
								navigator.clipboard?.writeText(text).then(() => setNote("已抄到剪贴板")).catch(() => setNote("复制未成，可直接选取上面的字"));
							},
							children: "复制"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-ink",
							onClick: () => setOpen(false),
							children: "合上"
						}),
						note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "self-center text-sm",
							children: note
						}) : null
					]
				})
			]
		})
	}) : null] });
}
function RestartButton({ label, ink = false }) {
	const restart = useSave((state) => state.restart);
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: ink ? "btn-ink" : "btn-ghost",
		onClick: () => setOpen(true),
		children: label
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 grid place-items-center bg-ink/80 px-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "restart-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "manuscript w-full max-w-md p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "restart-title",
					className: "font-serif text-2xl",
					children: "弃此生"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-serif text-base leading-relaxed",
					children: "这一世会收进前尘。道号、物与因果都让位，本纪的阅读进度还在。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-primary",
						onClick: () => {
							setOpen(false);
							restart();
						},
						children: "确认重开"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-ink",
						onClick: () => setOpen(false),
						children: "留下"
					})]
				})
			]
		})
	}) : null] });
}
var CAP = {
	dao: 160,
	qi: 80,
	kill: 80,
	virtue: 80,
	demon: 80,
	life: 100
};
function StatList({ stats }) {
	const realm = realmOf(stats.dao);
	const upcoming = nextRealm(stats.dao);
	const span = upcoming ? upcoming.min - realm.min : 1;
	const daoPct = upcoming ? Math.min(100, (stats.dao - realm.min) / span * 100) : 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-serif text-lg text-gold",
						children: realm.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-dim",
						children: upcoming ? `距${upcoming.name}` : "门缝之外"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-relaxed text-dim",
					children: realm.line
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "meter mt-2",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${daoPct}%` } })
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-x-4 gap-y-3",
				children: STAT_ORDER.map((key) => {
					const value = stats[key];
					const pct = Math.min(100, value / CAP[key] * 100);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-xs text-dim",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: STAT_LABEL[key] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-fog",
							children: value
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: key === "life" || key === "demon" ? "meter meter-life mt-1" : "meter mt-1",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${pct}%` } })
					})] }, key);
				})
			}),
			stats.life < 30 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-cinnabar",
				children: "道躯残损。再硬扛一次，可能就散了。"
			}) : null
		]
	});
}
function PlayView() {
	const state = useSave();
	const choose = useSave((save) => save.choose);
	const begin = useSave((save) => save.begin);
	const sound = useSave((save) => save.sound);
	const scene = sceneById(state.sceneId);
	const [draft, setDraft] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		document.getElementById("scene-top")?.scrollIntoView({ block: "start" });
	}, [state.sceneId]);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			const target = event.target;
			if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
			const index = Number(event.key) - 1;
			if (!Number.isInteger(index) || index < 0 || !scene || scene.ending) return;
			const pick = visibleChoices(state).filter((item) => item.open)[index];
			if (!pick) return;
			event.preventDefault();
			unlockSound();
			playChoice(sound);
			choose(pick.choice, scene.id === "awaken" ? draft : void 0);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		choose,
		draft,
		scene,
		sound,
		state
	]);
	if (!state.started || !scene) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto w-full max-w-xl px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "manuscript p-6 md:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl",
					children: "尚未入世"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "copy mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "混沌里还有一缕不肯散的灵。正史已经写完，缝还空着。" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-primary mt-6",
					onClick: () => begin(),
					children: "踏入混沌"
				})
			]
		})
	});
	const place = placeById(scene.place);
	const asides = (scene.asides ?? []).filter((aside) => (aside.requires ?? []).every((cond) => meetsCond(state, cond)));
	const options = visibleChoices(state);
	let openIndex = 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_17rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			id: "scene-top",
			className: "manuscript rise p-5 md:p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs tracking-widest text-cinnabar",
					children: [scene.era, place ? ` · ${place.name}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-serif text-3xl md:text-4xl",
					children: scene.ending?.name ?? scene.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "copy mt-6",
					children: scene.paragraphs.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: fill(paragraph, state) }, paragraph))
				}),
				asides.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid gap-3",
					children: asides.map((aside) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "aside",
						children: fill(aside.text, state)
					}, aside.text))
				}) : null,
				scene.id === "awaken" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-8 block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-faint",
						children: "道号，可留空"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: draft,
						maxLength: 8,
						onChange: (event) => setDraft(event.target.value),
						placeholder: "不取则随根骨赐号",
						className: "mt-2 w-full border-0 border-b border-line bg-transparent py-2 font-serif text-lg text-fg outline-none placeholder:text-faint"
					})]
				}) : null,
				scene.ending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-col items-start gap-4 border-t border-line pt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "seal",
							"aria-hidden": "true",
							children: scene.ending.seal
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-serif text-lg",
							children: ["归处 · ", scene.ending.name]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestartButton, {
								ink: true,
								label: "再入混沌"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifeCopy, {})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-widest text-cinnabar",
							children: "抉择"
						}),
						options.map((item) => {
							const indexLabel = item.open ? String(++openIndex) : "—";
							const hint = deltaHint(item.choice.delta);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "choice",
								disabled: !item.open,
								onClick: () => {
									if (!item.open) return;
									unlockSound();
									playChoice(sound);
									choose(item.choice, scene.id === "awaken" ? draft : void 0);
									if (scene.id === "awaken") setDraft("");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-serif text-cinnabar tabular-nums",
									children: indexLabel
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-serif text-lg leading-snug",
											children: item.choice.text
										}),
										item.choice.sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-sm leading-relaxed opacity-80",
											children: item.choice.sub
										}) : null,
										item.open && hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-xs tracking-wide text-cinnabar",
											children: hint
										}) : null,
										!item.open && item.reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-xs",
											children: item.reason
										}) : null
									]
								})]
							}, item.choice.id);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden text-xs text-faint md:block",
							children: "数字键亦可抉择"
						})
					]
				})
			]
		}, scene.id), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "hidden lg:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky top-20 border border-line-dark bg-raised p-4 text-fog",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Identity, {})
			})
		})]
	});
}
function Identity() {
	const name = useSave((state) => state.name);
	const origin = useSave((state) => state.origin);
	const stats = useSave((state) => state.stats);
	const originInfo = origin ? ORIGINS[origin] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-serif text-xl text-gold",
			children: name || "未名"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-dim",
			children: originInfo ? `${originInfo.seal} · ${originInfo.name}` : "根骨未定"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatList, { stats })
		})
	] });
}
function SelfView() {
	const state = useSave();
	const rename = useSave((save) => save.rename);
	const setSound = useSave((save) => save.setSound);
	const [draft, setDraft] = (0, import_react.useState)(state.name);
	const origin = state.origin ? ORIGINS[state.origin] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto grid w-full max-w-3xl gap-6 px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-gold",
					children: "我"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-serif text-3xl",
					children: state.name || "未名"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-dim",
					children: [
						origin ? `${origin.name} · ${origin.line}` : "尚未应答混沌。",
						" ",
						state.started ? realmOf(state.stats.dao).name : ""
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border border-line-dark bg-raised p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatList, { stats: state.stats })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "manuscript p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-xl",
					children: "道号"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 flex flex-wrap gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						rename(draft);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: draft,
						maxLength: 8,
						onChange: (event) => setDraft(event.target.value),
						className: "min-h-12 min-w-40 flex-1 border-0 border-b border-line bg-transparent font-serif text-lg text-fg outline-none",
						"aria-label": "道号"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "btn-ink",
						children: "改定"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "manuscript p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-xl",
					children: "所携"
				}), state.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-serif leading-relaxed",
					children: "身无外物。"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-3",
					children: state.items.map((id) => {
						const item = ITEMS[id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-lg",
							children: item?.name ?? id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed opacity-80",
							children: item?.lore
						})] }, id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "manuscript p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-xl",
						children: "因果"
					}),
					state.flags.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-serif leading-relaxed",
						children: "因果尚薄。"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-wrap gap-2",
						children: state.flags.map((flag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border border-line px-2 py-1 text-sm",
							children: flagLabel(flag)
						}, flag))
					}),
					state.log.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-5 grid gap-2 border-t border-line pt-4",
						children: state.log.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm leading-relaxed",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-cinnabar",
								children: line.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", line.choice] })]
						}, `${line.sceneId}-${index}`))
					}) : null
				]
			}),
			state.pastLives.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-xl text-fog",
				children: "前尘"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-3",
				children: state.pastLives.map((life, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border border-line-dark px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-serif text-lg",
						children: [
							life.seal,
							" · ",
							life.name,
							" · ",
							life.ending
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-dim",
						children: life.lines[life.lines.length - 1]
					})]
				}, `${life.name}-${index}`))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "btn-ghost",
						onClick: () => setSound(!state.sound),
						children: ["钟声", state.sound ? "开" : "关"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifeCopy, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestartButton, { label: "弃此生重开" })
				]
			})
		]
	});
}
var DOCK = [
	{
		id: "play",
		label: "入世",
		icon: ScrollText
	},
	{
		id: "novel",
		label: "本纪",
		icon: BookOpen
	},
	{
		id: "codex",
		label: "天书",
		icon: Library
	},
	{
		id: "land",
		label: "山河",
		icon: Compass
	},
	{
		id: "self",
		label: "我",
		icon: UserRound
	}
];
function GameApp() {
	(0, import_react.useEffect)(() => {
		useSave.persist.rehydrate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {});
}
function Shell() {
	const screen = useSave((state) => state.screen);
	const setScreen = useSave((state) => state.setScreen);
	const name = useSave((state) => state.name);
	const stats = useSave((state) => state.stats);
	const started = useSave((state) => state.started);
	const scene = sceneById(useSave((state) => state.sceneId));
	if (screen === "title") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 border-b border-line-dark bg-ink/90 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "font-serif text-xl text-gold",
						onClick: () => setScreen("title"),
						children: APP_NAME
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-right text-sm text-dim",
						children: started ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fog",
							children: name || "未名"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", scene?.ending?.name ?? realmOf(stats.dao).name] })] }) : "尚未入世"
					})]
				}), screen === "play" && started ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-line-dark px-4 py-2 lg:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactStats, {})
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				screen === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayView, {}) : null,
				screen === "novel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NovelView, {}) : null,
				screen === "codex" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodexView, {}) : null,
				screen === "land" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandView, {}) : null,
				screen === "self" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelfView, {}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "dock",
				"aria-label": "章节",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mx-auto grid w-full max-w-5xl grid-cols-5",
					children: DOCK.map((item) => {
						const Icon = item.icon;
						const current = screen === item.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: current ? "flex min-h-14 w-full flex-col items-center justify-center gap-1 text-gold" : "flex min-h-14 w-full flex-col items-center justify-center gap-1 text-dim",
							"aria-current": current ? "page" : void 0,
							onClick: () => setScreen(item.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								size: 18,
								strokeWidth: 1.5,
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs",
								children: item.label
							})]
						}) }, item.id);
					})
				})
			})
		]
	});
}
function CompactStats() {
	const stats = useSave((state) => state.stats);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "flex flex-wrap gap-x-3 gap-y-1 text-xs text-dim",
		children: STAT_ORDER.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			STAT_LABEL[key],
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular-nums text-fog",
				children: stats[key]
			})
		] }, key))
	});
}
function TitleScreen() {
	const started = useSave((state) => state.started);
	const begin = useSave((state) => state.begin);
	const setScreen = useSave((state) => state.setScreen);
	const past = useSave((state) => state.pastLives.length);
	const name = useSave((state) => state.name);
	const ending = sceneById(useSave((state) => state.sceneId))?.ending?.name;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "seal",
				"aria-hidden": "true",
				children: "洪"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-6 font-serif text-5xl text-fog md:text-6xl",
				children: APP_NAME
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-serif text-lg text-gold",
				children: NOVEL_NAME
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 max-w-md font-serif text-xl leading-relaxed text-fog",
				children: "斧声之前，你已不肯散。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-md text-sm leading-relaxed text-dim",
				children: "正史从混沌写到封神余响，天书是整套世界。入世不改大事件，只把你写成缝里的那一笔。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col items-start gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-primary",
						onClick: () => begin(),
						children: started ? "回到你的因果" : "踏入混沌"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "btn-ghost",
						onClick: () => setScreen("novel"),
						children: [
							"阅读《",
							NOVEL_NAME,
							"》"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-ghost",
						onClick: () => setScreen("codex"),
						children: "翻开天书"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-ghost",
						onClick: () => setScreen("land"),
						children: "看山河"
					}),
					started ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestartButton, { label: "弃此生重开" }) : null,
					started ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-dim",
						children: [
							"当前：",
							name || "未名",
							ending ? ` · ${ending}` : "",
							past > 0 ? ` · 已有${past}世前尘` : ""
						]
					}) : null
				]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
