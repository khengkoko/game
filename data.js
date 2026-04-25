const levels = [
  {
    name: "🍜 餐厅",
    questions: [
      {
        text: "你要喝什么？",
        options: ["我吃水", "我要水", "我喝饭"],
        answer: 1,
        explanation: "水要用“喝”，不是“吃”"
      },
      {
        text: "你要吃什么？",
        options: ["我要米饭", "我要喝米饭", "我吃水"],
        answer: 0,
        explanation: "米饭要用“吃”"
      }
    ]
  },
  {
    name: "🛒 商店",
    questions: [
      {
        text: "我___商店买东西",
        options: ["在", "去"],
        answer: 1,
        explanation: "“去”表示动作方向"
      }
    ]
  }
];
