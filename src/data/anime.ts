// 本地番剧数据配置
export type AnimeItem = {
	title: string;
	status: "watching" | "completed" | "planned";
	rating: number;
	cover: string;
	description: string;
	episodes: string;
	year: string;
	genre: string[];
	studio: string;
	link: string;
	progress: number;
	totalEpisodes: number;
	startDate: string;
	endDate: string;
};

const localAnimeList: AnimeItem[] = [
	{
		title: "师兄啊师兄",
		status: "watching",
		rating: 7.8,
		cover: "https://m.ykimg.com/058400006943602E70A43D13AA321D68?x-oss-process=image/resize,w_312/interlace,1/quality,Q_70",
		description: "身患绝症的年轻人李长寿，意外重生在封神大战之前的上古时代，成了一个炼气士。为了修得长生不老且能在残酷的洪荒安身立命，他低调行事，凡事谋而后动，从不轻易步入危险之中，藏底牌，修遁术，炼丹毒，直到有一天，他的师傅突然给他收了个师妹回来，本想低调修行的李长寿被卷入了一场场冒险。不动稳如老狗，一动石破天惊，动后悄声走人，在打败邪恶敌人的同时，结交志同道合的朋友，实现自己的人生价值。",
		episodes: "143 episodes",
		year: "2023",
		genre: ["国风", "国风热血", "新国风热血"],
		studio: "玄机科技",
		link: "https://v.youku.com/v_show/id_XNjQ4MTAzMDgyOA==.html",
		progress: 127,
		totalEpisodes: 143,
		startDate: "2023",
		endDate: "",
	},

];

export default localAnimeList;
