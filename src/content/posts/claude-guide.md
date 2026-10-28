---
title: 人人都能使用Claude指南
tags:
  - AI
  - Claude
description: "Claude 是无可争议的世界顶级模型，特别是Opus5.5的强大和高性价比，每个程序员都应该使用它。"
pubDatetime: 2026-10-28T20:18:31+08:00
---

Claude 是无可争议的世界顶级模型，特别是Opus5.5的强大和高性价比，每个程序员都应该使用它。

但是由于这家公司对账号管控严格，导致国人想要使用困难重重。

总体来说，主要有三个阻碍：

* 外网访问
* 账号注册
* 套餐订阅

## 解决三大障碍
### 外网访问

Claude 对 IP 的纯度要求很高，推荐自建 vps（亚洲节点），具体搭建可以参考[不良林教程](https://bulianglin.com/archives/nicename.html)。

除了外网的 vps 以外，还需要一个代理软件才能进行外网访问。

iPhone手机上推荐 Shadowrocket 软件，Shadowrocket 的应用需要用到 美区Apple ID，美区Apple ID 注册可参考[美区ID注册教学](https://github.com/kjfx/AppleID)。

Mac电脑上推荐 v2rayN 软件， 具体教程参考 [v2ray各平台图文使用教程](https://github.com/Alvin9999-newpac/fanqiang/wiki/v2ray%E5%90%84%E5%B9%B3%E5%8F%B0%E5%9B%BE%E6%96%87%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B)。

后面的很多操作，都会基于这一步的完成。

### 账号注册

即使有自建的vps，通过官方申请账号时，还需要 KYC 验证，推荐直接购买 [Claude Code 账号｜亚洲住宅 IP 注册](https://shop.jiuzh.top/products/claudecode-account)，这里的账号是在亚洲地区通过住宅申请的账号， 可以直接订阅 Pro 套餐。


### 套餐订阅

套餐订阅可以使用 美区Apple ID 登录 AppStore，然后通过苹果的礼品卡充值来实现订阅。

美区Apple ID 注册可参考[美区ID注册教学](https://github.com/kjfx/AppleID)， 需要注意的是地区要填免税区。

礼品卡充值可以通过支付宝搜索 "Nediya礼品卡" ，然后选择 "Apple Gift Card US" 购买。这一步可后面再做。

如果你解决掉上面的三个困难，那么意味着你拥有了：
1. 一个访问外网的 vpn。
2. Claude 账号。
3. 苹果美区的 Apple ID。

接下来你就可以开始了。

## 手机订阅 Claude

#### 1. 给 Shadowrocket 配置 Claude 的域名代理规则

这一步主要是让 claude 相关的域名访问都走 PROXY 代理。

配置 -> 本地文件 -> default.conf -> 规则 ->添加四条 DOMAIN_SUFFIX 规则
```
anthropic.com
claude.ai
claude.com
claudeusercontent.com
```

![](https://pub-8fdf875428a145e5885951c4db818dc7.r2.dev/2026/10/1792333501069-u9xam8im.webp)

>Shadowrocket 的全局路由设置为 **配置**

#### 2. 使用前面注册的美区Apple ID 登录 AppStore

#### 3. 修改iPhone时区为中国台北

- 设置 → 搜索“日期与时间”，时区选“台北标准时间”，时区城市选“台北”
- 关掉“自动设定时间”

#### 3. 下载应用 Claude
在 Appstore 中搜索 Claude，并下载

#### 4. 使用前面购买的账号进行登录
登录之后随便发个 hi 什么测试一下

#### 5. 购买礼品卡充值 Appstore
在支付宝搜索  "Nediya礼品卡"，选择 "Apple Gift Card US" ， 买20美元，成功后会收到一个礼品兑换码。

![](https://pub-8fdf875428a145e5885951c4db818dc7.r2.dev/2026/10/1792333830199-wz8ejtqs.webp)


复制礼品兑换码，打开 Appstore，点击右上角头像， 点击 "兑换代码"，输入兑换码，就完成充值。

#### 6. 订阅 Claude Pro
接下来就是激动人心的时刻了，打开 Claude 应用，打开设置，点击 "Update Plan"，选择 Pro 用 Apple Pay 订阅。

订阅成功后， 在手机端的聊天窗口，就可以使用 Opus 5.5 进行提问了。
![](https://pub-8fdf875428a145e5885951c4db818dc7.r2.dev/2026/10/1792334180187-lc5b4mhz.webp)


## Mac使用 Claude code

#### 1. 电脑端同样先给 v2rayN Claude 的域名代理规则
打开 v2rayN， 设置 -> 路由设置 -> 双击 "V4-绕过大陆(Whitelist)" -> 添加规则

![](https://pub-8fdf875428a145e5885951c4db818dc7.r2.dev/2026/10/1792334281326-r8nl5fmg.webp)

#### 2.1 下载 Claude code
如果之前从来没有使用过 `claude code`， 需要[下载](https://code.claude.com/docs/en/quickstart?utm_source=google_brand&utm_medium=cpc&utm_campaign=%7Bcampaign%7D&utm_content=823571895566&utm_term=claude+code&gclid=CjwKCAjw3NHWBhANEiwAtpwIdyV0SXACPxhj39rpR6umgZlq8_6ZXvh8DNCfoiLZ6C8JtxLxoTUcBBoC7OUQAvD_BwE&gbraid=0AAAAAqwcL8maH3hBWkvaEMC4KUx9PdtbF#step-1-install-claude-code)

```
# 这里的 proxy 地址是 v2rayN 的代理地址，建议把它设置到你的 shell 对应的 rc 文件中。
export HTTP_PROXY=http://127.0.0.1:7890

export HTTPS_PROXY=http://127.0.0.1:7890

curl -fsSL https://claude.ai/install.sh | bash
```

#### 2.2 清理旧的 Claude code 使用痕迹

如果之前有通过 `cc-switch` 或者环境变量使用过 `claude code`，需要清理 `claude code` 使用痕迹。 `claude code` 清理比较麻烦，最好找一个 `code agent` 给你操作，比如 [DeekSeek Harness](https://www.deepseek.com/harness/) 或者是 [Codex](https://chatgpt.com/zh-Hans-CN/codex/)， 然后把下面的提示词发给它。

> 我准备使用官方Claude账号，请检查这台Mac上的Claude Code和Claude Desktop旧配置。 先获取并审查这份claude-cleanup Skill，参考它的白名单和保护范围做只读审计，暂不执行清理脚本：
> 
> [https://github.com/suyuan2022/suyuan-skill/blob/423473db6b618c7e040f1a5a6879bc83e69e8b3b/claude-cleanup/SKILL.md](https://github.com/suyuan2022/suyuan-skill/blob/423473db6b618c7e040f1a5a6879bc83e69e8b3b/claude-cleanup/SKILL.md)
> 
> 请先列出简短的清理方案： 
> 1. 检查旧登录凭据、账号缓存，以及Claude缓存和日志。 
> 2. 检查主身份文件中的userID、machineID，说明重置这些本地标识的影响和范围。 
> 3. 检查Claude Code的第三方API地址、认证覆盖项和模型映射。如果使用CC Switch，准备切回Claude Official并关闭Claude接管。 
> 4. 保留历史会话、Skills、插件、Hooks、自建规则、桌面端持久数据，以及飞书等其他工具依赖的配置。不要清空整个.claude或CC Switch数据库，不要卸载应用。 不要输出密码或令牌。
> 
> 先告诉我要处理什么、保留什么、有什么影响，等我确认后再执行。

然后输入 CONFIRM 让它执行。

#### 3. 登录
在终端执行

```
claude auth login
```

然后在弹出来的 URL 里使用前面注册的账号进行登录, 登录后就可以使用了。

![](https://pub-8fdf875428a145e5885951c4db818dc7.r2.dev/2026/10/1792334332752-lyep36ak.webp)


>参考文档：
>https://x.com/gengdaJ/status/2108363527971041650

