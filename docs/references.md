# GitHub 相近项目与复用判断

核查日期：2026-10-07。以下是方向参考，不是本项目已引入的依赖。

| 项目 | 与魔法书的关系 | 许可核查 | 当前使用方式 |
| --- | --- | --- | --- |
| [mathigon/textbooks](https://github.com/mathigon/textbooks) | 最接近逐段互动教材；分离 content.md、functions.ts、styles.scss、hints.yaml | 仓库根目录未看到清晰的整体 LICENSE；不能从“公开源码”推断可自由复用全部教材 | 借鉴内容/交互/样式分离的结构；未复制正文、代码、图像 |
| [idyll-lang/idyll](https://github.com/idyll-lang/idyll) | 可交互文章，变量与图表联动；适合日后作者工具 | [MIT](https://github.com/idyll-lang/idyll/blob/master/LICENSE) | 借鉴数据驱动文章的思路；当前未引入依赖 |
| [ncase/trust](https://github.com/ncase/trust) | 可玩解释：故事推进、预测、实验和反馈 | 仓库 [CC0](https://github.com/ncase/trust)；第三方音乐/代码仍需查看各自来源 | 借鉴教学节奏，未复制素材 |
| [mathigon/fermat.js](https://github.com/mathigon/fermat.js) | 数论、组合、矩阵与统计等数学工具 | 仓库明确 MIT | 未来复杂数学可以引入；当前四个模型用原生 JS 独立实现 |
| [mathigon/boost.js](https://github.com/mathigon/boost.js) | 浏览器 DOM、手势、动画工具 | Mathigon [仓库列表](https://github.com/orgs/mathigon/repositories) 标为 MIT；引入前再锁定版本并保留该版本 LICENSE | 未来拖拽组件候选，当前未引入 |

## 取舍

推荐首版用独立的无依赖阅读引擎：快速验证“报纸上的实验”体验，容易审计和静态部署。读者可按知识块操作；作者通过结构化 JSON 编辑内容。

Idyll 更适合后续的作者端，因为它已解决不少交互文章的编排问题，但引入框架会增加工具链复杂度。Mathigon 教材结构适合参考，直接复用其教材及整体平台需另核查许可。Nicky Case 的贡献在于教学设计：先猜测、再操作、观察反馈、形成解释。

本版没有复制上述项目的任何代码或素材，不需要为“思想参考”伪造第三方依赖声明。如果以后实际借用，必须记录具体仓库、提交/版本、文件路径和原始许可，保留署名与 NOTICE。
