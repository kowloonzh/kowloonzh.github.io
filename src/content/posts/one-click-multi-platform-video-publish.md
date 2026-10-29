---
description: "在 Claude Code 里用 social-auto-upload 的 Agent Skill，一句句对话完成安装、登录、文案审核和 B站/抖音/视频号/小红书四平台发布，附踩坑记录。"
title: "用 AI Agent 一键把视频发到 B站、抖音、视频号、小红书"
pubDatetime: 2026-10-30T00:00:39+08:00
---

> 我用 Claude 做了一条 10 分钟的中视频《程序员简史》，想同时发到 B站、抖音、视频号和小红书，顺便赶上最近很火的 **#vibe知识大赏** 话题。这篇记录我是怎么在 Claude Code 里，用一句句对话完成「安装工具 → 登录账号 → 打磨文案 → 四平台发布」的，也包括踩过的坑。

---

## 一、选工具：为什么是 social-auto-upload

先让 Claude 帮我调研了一圈「一键多平台发布」的方案，大致分三类：

| 类型 | 代表 | 适合 |
| --- | --- | --- |
| 国内客户端/网页 | 蚁小二、易媒助手、融媒宝 | 不想折腾、团队多账号管理 |
| 浏览器扩展 | MultiPost（开源） | 个人、免费、用浏览器已登录账号 |
| 开源脚本 | **social-auto-upload**、AiToEarn | 想自动化、批量、定时 |
| 海外 SaaS | Buffer、Postiz、Repurpose.io | 主要发 YouTube/TikTok/Instagram |

最后选了 [social-auto-upload](https://github.com/dreammis/social-auto-upload)，原因很简单：

- 支持抖音、B站、小红书、快手、视频号、YouTube 等 17 个平台
- 提供统一的 `sau` 命令行
- **自带 Agent Skill**：装进 Claude Code 之后，我可以直接用中文说「帮我把这个视频发到抖音」，Agent 会按 Skill 里的规范去调用 `sau` 命令

## 二、安装（一句话交给 Agent）

我在 Claude Code 里说：

> 帮我在本地安装一下 social-auto-upload，我想用 skill，以后就可以直接在 AI agent 会话里面操作发布了

Agent 实际做了这些事：

```bash
# 1. 克隆仓库
git clone --depth 1 https://github.com/dreammis/social-auto-upload.git ~/workspace/tools/social-auto-upload
cd ~/workspace/tools/social-auto-upload

# 2. 配置文件 + 虚拟环境 + 依赖（项目推荐 uv）
cp conf.example.py conf.py
uv venv -p 3.12
uv pip install -e .

# 3. 安装浏览器内核（国内用镜像）
PLAYWRIGHT_DOWNLOAD_HOST="https://npmmirror.com/mirrors/playwright" .venv/bin/patchright install chromium

# 4. 让 sau 全局可用
ln -sf "$PWD/.venv/bin/sau" ~/.local/bin/sau

# 5. 把 18 个 Skill 软链接进 Claude Code
for d in skills/*/; do ln -sfn "$PWD/$d" ~/.claude/skills/$(basename $d); done
```

几个细节：

- Skill 用**软链接**而不是复制，以后 `git pull` 一下，Skill 自动跟着更新。
- 登录信息（cookie）统一存在仓库的 `cookies/` 目录，和在哪个目录执行命令无关。
- 装完要**新开一个会话**，Skill 列表是在会话开始时加载的。

## 三、登录各平台账号

`--account` 后面的名字只是本地代号，一个代号对应一份 cookie 文件，一个平台可以登录多个账号。

我在会话里依次说「帮我登录小红书，账号名叫 井久」「帮我登录抖音……」，Agent 会以有界面模式启动登录：

```bash
sau xiaohongshu login --account 井久 --headed
sau douyin      login --account 井久 --headed
sau tencent     login --account 井久 --headed   # 视频号
```

弹出浏览器后用对应 App 扫码，登录完成后 Agent 会再跑一次 `sau <平台> check --account 井久` 确认 cookie 有效。

**B站是个例外**：它的登录必须在真正的交互式终端里进行。在 Claude Code 里用 `!` 前缀执行也会被拒绝。Agent 的解决办法是用 AppleScript 直接打开 macOS 的「终端」并执行登录命令：

```bash
osascript -e 'tell application "Terminal"
activate
do script "cd ~/workspace/tools/social-auto-upload && sau bilibili login --account 井久"
end tell'
```

> 小技巧：账号代号起错了也不用重新登录，cookie 文件名就是 `<平台>_<代号>.json`，直接改文件名即可。

## 四、找活动、定方案

### 1. 搞清楚要参加什么活动

我只记得「好像有个 AI vibe 大赏」，就让 Agent 去搜。结论是：

- 我说的是 **#vibe知识大赏**：用 AI 做知识科普视频的话题，抖音、小红书都有同名话题，参与方式就是**带上这个话题发布**，不用改标题。
- B站的「AI创造公开赛 S2」是另一回事，它要求做出**可运行、可交互的产品**，纯视频不符合，所以我没去报名。

### 2. 一条条确认发布信息

我让 Agent「一条条问我」，它依次确认了：

1. **视频文件**：Agent 先用 `ffprobe` 看了一眼，1920×1080 横屏，10 分 38 秒，548MB，字幕已经烧录在画面里
2. **平台**：B站、抖音、小红书、视频号
3. **时间**：确认文案后立即发布
4. **文案**：制作视频的 AI 已经写了一份 `publish.md`，交给发布 Agent 审核
5. **封面**：每个平台要的比例不一样
6. **B站分区**：Agent 用我的登录信息去 B站接口取了**实时**分区列表，最后选「知识 → 人文历史（tid 228）」

### 3. 文案审核：工具会悄悄截断标题

这一步很有价值。Agent 翻了上传器源码，发现各平台标题有硬上限，**超出部分会被直接截掉，不报错**：

| 平台 | 标题上限 | 原标题的问题 |
| --- | --- | --- |
| 小红书 | 20 字 | 37 个字符，会变成「以前Show me the code，现」 |
| 抖音 | 30 字 | 33 字，结尾会被截成「…埋下伏」 |
| 视频号短标题 | 6～16 字 | 逗号、全角问号会被自动去掉 |

另外：

- 文案里**没有 #vibe知识大赏**，等于白参加活动，四个平台都要补上。
- 简介末尾手写的 `#话题` 要挪到 `--tags` 参数里，否则在抖音、视频号上可能重复，还会弹出话题联想框。

### 4. 封面

| 平台 | 封面 |
| --- | --- |
| B站 | 16:9 |
| 抖音、视频号 | 4:3 横版 + 3:4 竖版 |
| 小红书 | 3:4 |

4:3 一开始是从 16:9 直接裁的，结果两边的人物被切掉一半。最后让 Agent 列了一份制作要求（1440×1080、标题放大、右下角不放重要内容），由制作视频的 AI **重新排版**了一张。

## 五、发布

我回复「发布」以后，Agent 按 **B站 → 抖音 → 视频号 → 小红书** 的顺序逐个发，每个平台确认成功后再发下一个。长文案先写进文件，避免命令行转义出问题：

```bash
sau bilibili upload-video --account 井久 \
  --file full_v7.mp4 \
  --title "程序员简史：从1804年的打孔卡到2026年的AI智能体，这份工作是怎么来的？" \
  --desc "$(cat desc_bili.txt)" --tid 228 \
  --tags "vibe知识大赏,程序员,计算机历史,科普,编程,AI,人工智能,..." \
  --thumbnail cover_16x9.png

sau douyin upload-video --account 井久 \
  --file full_v7.mp4 \
  --title "1202报警，登月差点失败！程序员200年前就埋下伏笔" \
  --desc "$(cat desc_douyin.txt)" \
  --tags "vibe知识大赏,程序员,计算机历史,科普,AI,编程,人工智能,涨知识" \
  --thumbnail-landscape cover_4x3.png --thumbnail-portrait cover_3x4.png \
  --declaration "内容由AI生成"

sau tencent upload-video --account 井久 \
  --file full_v7.mp4 \
  --title "程序员这份工作，是怎么来的？" --short-title "程序员这份工作是怎么来的" \
  --desc "$(cat desc_tencent.txt)" --tags "vibe知识大赏,程序员,..." \
  --thumbnail-landscape cover_4x3.png --thumbnail-portrait cover_3x4.png

sau xiaohongshu upload-video --account 井久 \
  --file full_v7.mp4 \
  --title "以前拼代码，现在拼表达｜程序员简史" \
  --desc "$(cat desc_xhs.txt)" --tags "vibe知识大赏,程序员,..." \
  --thumbnail cover_3x4.png
```

B站发完后，Agent 还去创作中心接口核对了一遍，标题、分区、标签都对，稿件进入审核。

### 发布结果

| 平台 | 结果 | 需要手动补的 |
| --- | --- | --- |
| B站 | ✅ 审核中 | AI 声明（工具不支持） |
| 抖音 | ✅ 发布成功，已勾选 AI 声明 | 检查封面 |
| 视频号 | ✅ 发布成功 | AI 标注、4:3 封面（页面超时，没设上） |
| 小红书 | ⚠️ 发出去了，但有问题 | 见下文 |

## 六、踩坑记录

### 坑 1：抖音短信验证码

抖音发布时弹出短信验证，第一次的验证码等太久过期了。正确做法是：

- Agent 停掉卡住的进程（这时还没点发布，不会重复发）后重新发起，程序会自动重新申请验证码
- 收到短信后我在对话里把验证码发给 Agent，Agent 把它写进仓库根目录的 `verify_code.txt`，程序读到后会自动填入并删除这个文件

### 坑 2：小红书原创被标成「来源转载」

日志里出现一行 `来源转载已声明（来源：）`。查源码发现，上传器**每次都会**勾选「来源转载」，而转载来源从来没有被赋过值。原创视频就这样被标成了转载，来源还是空的。

本地的临时修复是只在提供了转载来源时才执行这一步：

```python
# 只有显式提供转载来源时才声明「来源转载」，原创作品不应被标成转载
if getattr(self, "repost_source", ""):
    await self.check_original_declaration(page)
```

上游已经有人报过这个问题（[Issue #291](https://github.com/dreammis/social-auto-upload/issues/291)），修复 [PR #295](https://github.com/dreammis/social-auto-upload/pull/295) 还没合并。用小红书发布的朋友注意一下。

已经发出去的笔记要去 App 里手动改：内容类型声明改成「AI 合成」，再删掉自动加话题失败留下的半截文字「#编」「#历」。

### 坑 3：小红书账号被风控

发完以后，个人主页看不到笔记，昵称被重置成「小红薯xxxx」，还提示「该账号疑似存在风险」。原因大概是这几件事叠在一起：

- 新设备扫码登录后，马上用自动化浏览器发了一条 548MB 的长视频
- 这个账号还没实名认证

**最后完成实名认证就解除了。** 建议：

- 用工具发小红书之前，先把**实名认证**做好
- 发完之后少用脚本访问创作中心，查看结果在 App 里看就行
- 笔记在「审核中」时主页是看不到的，只有创作中心能看到，不要误以为没发出去

### 坑 4：其他小问题

- 小红书添加话题时，有些话题联想框不弹出，那个话题会被跳过
- 抖音、视频号、小红书的封面弹窗偶尔会超时，工具会用视频首帧代替，**发完一定要检查封面**
- 只有抖音支持自动勾选 AI 声明，B站、小红书、视频号都要手动补

## 七、总结

整个过程下来，我几乎没碰命令行，都是用对话完成的：

1. 「帮我安装 social-auto-upload，用 skill」
2. 「帮我登录 XX，账号名叫 井久」
3. 「帮我看看怎么参加 vibe知识大赏」
4. 「你一条条问我」
5. 「发布」

用下来的体会：

- **Agent + Skill 最省事的地方不是「一键」，而是它会帮你把关**：标题截断、封面比例、分区、活动规则、AI 声明这些容易漏的地方，它都能提前查出来。
- **自动化工具本质上是在模拟网页操作**，平台一改版就可能出问题。每个平台发完都要看一眼，**看到平台返回成功才算真的发出去了**。
- **小红书风控最严**，新账号建议先实名认证，或者干脆手动发。

工具：[social-auto-upload](https://github.com/dreammis/social-auto-upload) · Agent：Claude Code
