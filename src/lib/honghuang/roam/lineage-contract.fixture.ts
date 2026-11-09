// Saved identifiers and effects before the narrative revision.
export const LEGACY_LINEAGE_CONTRACT = {
  dao: {
    faction: "chan",
    witness: "qingxing",
    art: "yuxu",
    chapters: [
      {
        place: "earth",
        gate: null,
        choices: [
          {
            id: "names",
            cost: null,
            effects: [
              {
                t: "karma",
                id: "lineage-dao-names",
              },
            ],
            ending: null,
          },
          {
            id: "breath",
            cost: null,
            effects: [
              {
                t: "karma",
                id: "lineage-dao-breath",
              },
            ],
            ending: null,
          },
        ],
      },
      {
        place: "kunlun",
        gate: "repair",
        choices: [
          {
            id: "measure",
            cost: null,
            effects: null,
            ending: null,
          },
          {
            id: "listen",
            cost: null,
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "edge",
        gate: null,
        choices: [
          {
            id: "return",
            cost: {
              good: "dew",
              count: 2,
            },
            effects: null,
            ending: null,
          },
          {
            id: "free",
            cost: {
              good: "dew",
              count: 2,
            },
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "kunlun",
        gate: "standing",
        choices: [
          {
            id: "order",
            cost: null,
            effects: [
              {
                t: "rep",
                id: "chan",
                n: 3,
              },
            ],
            ending: null,
          },
          {
            id: "wander",
            cost: null,
            effects: [
              {
                t: "rep",
                id: "jie",
                n: 3,
              },
            ],
            ending: null,
          },
        ],
      },
      {
        place: "edge",
        gate: "trial",
        choices: [
          {
            id: "hold",
            cost: null,
            effects: null,
            ending: null,
          },
          {
            id: "carry",
            cost: null,
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "kunlun",
        gate: null,
        choices: [
          {
            id: "open",
            cost: null,
            effects: null,
            ending: {
              name: "万灵有席",
              peace: true,
            },
          },
          {
            id: "keeper",
            cost: null,
            effects: null,
            ending: {
              name: "有名之门",
              peace: false,
            },
          },
        ],
      },
    ],
  },
  wu: {
    faction: "wu",
    witness: "pansheng",
    art: "wuxue",
    chapters: [
      {
        place: "buzhou",
        gate: null,
        choices: [
          {
            id: "shoulder",
            cost: null,
            effects: [
              {
                t: "karma",
                id: "lineage-wu-shoulder",
              },
            ],
            ending: null,
          },
          {
            id: "road",
            cost: null,
            effects: [
              {
                t: "karma",
                id: "lineage-wu-road",
              },
            ],
            ending: null,
          },
        ],
      },
      {
        place: "earth",
        gate: "repair",
        choices: [
          {
            id: "banks",
            cost: null,
            effects: null,
            ending: null,
          },
          {
            id: "teach",
            cost: null,
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "youming",
        gate: null,
        choices: [
          {
            id: "names",
            cost: {
              good: "ore",
              count: 2,
            },
            effects: null,
            ending: null,
          },
          {
            id: "rest",
            cost: {
              good: "ore",
              count: 2,
            },
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "buzhou",
        gate: "standing",
        choices: [
          {
            id: "stand",
            cost: null,
            effects: [
              {
                t: "rep",
                id: "wu",
                n: 3,
              },
            ],
            ending: null,
          },
          {
            id: "bridge",
            cost: null,
            effects: [
              {
                t: "rep",
                id: "yao",
                n: 3,
              },
            ],
            ending: null,
          },
        ],
      },
      {
        place: "buzhou",
        gate: "trial",
        choices: [
          {
            id: "brace",
            cost: null,
            effects: null,
            ending: null,
          },
          {
            id: "break",
            cost: null,
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "earth",
        gate: null,
        choices: [
          {
            id: "bridge",
            cost: null,
            effects: null,
            ending: {
              name: "两岸皆可渡",
              peace: true,
            },
          },
          {
            id: "mountain",
            cost: null,
            effects: null,
            ending: {
              name: "山骨可息",
              peace: false,
            },
          },
        ],
      },
    ],
  },
  yao: {
    faction: "yao",
    witness: "wuwei",
    art: "sunheart",
    chapters: [
      {
        place: "east",
        gate: null,
        choices: [
          {
            id: "true",
            cost: null,
            effects: [
              {
                t: "karma",
                id: "lineage-yao-true",
              },
            ],
            ending: null,
          },
          {
            id: "shadow",
            cost: null,
            effects: [
              {
                t: "karma",
                id: "lineage-yao-shadow",
              },
            ],
            ending: null,
          },
        ],
      },
      {
        place: "penglai",
        gate: "repair",
        choices: [
          {
            id: "route",
            cost: null,
            effects: null,
            ending: null,
          },
          {
            id: "signal",
            cost: null,
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "tribes",
        gate: null,
        choices: [
          {
            id: "meal",
            cost: {
              good: "salt",
              count: 2,
            },
            effects: null,
            ending: null,
          },
          {
            id: "pledge",
            cost: {
              good: "salt",
              count: 2,
            },
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "east",
        gate: "standing",
        choices: [
          {
            id: "court",
            cost: null,
            effects: [
              {
                t: "rep",
                id: "yao",
                n: 3,
              },
            ],
            ending: null,
          },
          {
            id: "free",
            cost: null,
            effects: [
              {
                t: "rep",
                id: "hearth",
                n: 3,
              },
            ],
            ending: null,
          },
        ],
      },
      {
        place: "east",
        gate: "trial",
        choices: [
          {
            id: "witness",
            cost: null,
            effects: null,
            ending: null,
          },
          {
            id: "burn",
            cost: null,
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "penglai",
        gate: null,
        choices: [
          {
            id: "sea",
            cost: null,
            effects: null,
            ending: {
              name: "千形共渡",
              peace: true,
            },
          },
          {
            id: "sun",
            cost: null,
            effects: null,
            ending: {
              name: "有约之名",
              peace: false,
            },
          },
        ],
      },
    ],
  },
  ren: {
    faction: "hearth",
    witness: "axin",
    art: "mudra",
    chapters: [
      {
        place: "tribes",
        gate: null,
        choices: [
          {
            id: "shift",
            cost: null,
            effects: [
              {
                t: "karma",
                id: "lineage-ren-shift",
              },
            ],
            ending: null,
          },
          {
            id: "stay",
            cost: null,
            effects: [
              {
                t: "karma",
                id: "lineage-ren-stay",
              },
            ],
            ending: null,
          },
        ],
      },
      {
        place: "tribes",
        gate: "repair",
        choices: [
          {
            id: "wide",
            cost: null,
            effects: null,
            ending: null,
          },
          {
            id: "craft",
            cost: null,
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "wahuan",
        gate: null,
        choices: [
          {
            id: "ground",
            cost: {
              good: "clay",
              count: 2,
            },
            effects: null,
            ending: null,
          },
          {
            id: "hands",
            cost: {
              good: "clay",
              count: 2,
            },
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "tribes",
        gate: "standing",
        choices: [
          {
            id: "council",
            cost: null,
            effects: [
              {
                t: "rep",
                id: "hearth",
                n: 3,
              },
            ],
            ending: null,
          },
          {
            id: "vow",
            cost: null,
            effects: [
              {
                t: "rep",
                id: "hearth",
                n: 3,
              },
            ],
            ending: null,
          },
        ],
      },
      {
        place: "tribes",
        gate: "trial",
        choices: [
          {
            id: "circle",
            cost: null,
            effects: null,
            ending: null,
          },
          {
            id: "seed",
            cost: null,
            effects: null,
            ending: null,
          },
        ],
      },
      {
        place: "wahuan",
        gate: null,
        choices: [
          {
            id: "many",
            cost: null,
            effects: null,
            ending: {
              name: "万家有后夜",
              peace: true,
            },
          },
          {
            id: "hearth",
            cost: null,
            effects: null,
            ending: {
              name: "薪火可相传",
              peace: false,
            },
          },
        ],
      },
    ],
  },
} as const;
