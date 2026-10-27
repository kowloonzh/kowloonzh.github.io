---
title: 如何避免频繁报警同样的内容
pubDatetime: 2023-11-22T12:00:00+08:00
description: 用 Go 的 singleflight 对同一工单同一节点的失败告警做收敛，避免重复报警。
tags:
  - 编程
  - Go
---

## 背景
最近晚上总是频繁收到同一个工单的失败告警信息，很烦。


## 解决方法

本质上是需要对告警做一个收敛，如果是同一个工单同一个节点的失败告警，应该只发送一次就可以了。

我想到了 go 自带的同步原语 [golang/sync/singleflight](https://github.com/golang/sync/blob/cd5d95a43a6e21273425c7ae415d3df9ea832eeb/singleflight/singleflight.go#L33)，它提供了两个用于抑制相同处理的方法：

* golang/sync/singleflight.Group.Do — 同步等待的方法；
* golang/sync/singleflight.Group.DoChan — 返回 Channel 异步等待的方法；

## 实现
```
var sfg singleflight.Group

func ApplyNodePass() {
    // 业务代码...
    err := apply.ApplyNodePass(ctx, applyNo, nodeId)
    if err != nil {
			key := fmt.Sprintf("%s:%s", applyNo, nodeId)

			// 同一个工单同一个节点只发送一次报警
			sfg.Do(key, func() (interface{}, error) {
				go Alarm(ctx, "工单通过异常", "alarm detail here...")
				return nil, nil
			})

			// 两小时后释放 key
			time.AfterFunc(2*time.Hour, func() {
				sfg.Forget(key)
			})
}
```