---
title: LrC：RAW 自动匹配相机色彩
published: 2026-07-27
description: 将 RAW 默认值设为“相机设置”，让新导入的照片自动匹配相机色彩配置。
image: https://img.anruix.com/posts/lightroom-raw-color-match-cover.png
showCoverInPost: false
tags: [Lightroom, RAW, 色彩配置]
category: 后期制作
draft: false
lang: zh_CN
---

Lightroom 导入 RAW 照片时，默认会使用 **Adobe 颜色（Adobe Color）**。

Adobe 颜色是一套通用的色彩配置，但在部分相机上，它呈现的颜色和对比度可能与相机屏幕预览有较大差异。如果更喜欢相机原本的色彩风格，可以把 Lightroom 的 RAW 默认值改为 **相机设置**。

完成一次设置后，以后导入新的 RAW 照片时，Lightroom 会优先匹配拍摄时使用的相机色彩配置，不需要再逐张手动切换。

## 设置方法

### 1. 打开首选项

打开 Lightroom，在顶部菜单栏中依次点击 **编辑 → 首选项**。

![在“编辑”菜单中选择“首选项”](https://img.anruix.com/posts/01-lightroom-classic-open-preferences.png)

### 2. 找到 RAW 默认值设置

进入“首选项”窗口后，切换到顶部的 **预设** 页面。在 **原始图像默认设置** 区域中，可以找到用于控制 RAW 默认值的 **全局** 下拉选项。

![在“预设”页面找到“原始图像默认设置”](https://img.anruix.com/posts/02-lightroom-classic-raw-default-settings.png)

### 3. 改为“相机设置”

点击“全局”右侧的下拉菜单，将 **Adobe 默认设置** 改为 **相机设置**，最后点击右下角的 **确定**。

![将 RAW 全局默认值改为“相机设置”](https://img.anruix.com/posts/03-lightroom-classic-select-camera-settings.png)

## 设置完成后的效果

以后导入新的 RAW 照片时，Lightroom 会读取照片中记录的相机色彩模式，并尽量匹配对应的 **相机匹配配置文件**，而不是统一使用 Adobe 颜色。

例如，如果拍摄时使用了标准、自然、鲜艳、人像或风景等色彩模式，导入后 Lightroom 会尝试加载对应的相机色彩配置。

不同品牌和型号提供的配置文件名称可能有所不同，属于正常现象。

## 适用范围

这个方法不是某个相机品牌专属，而是 Lightroom 的通用 RAW 设置。

只要 Lightroom 支持该相机的 RAW 文件，并提供了对应的相机匹配配置，就可以使用。尼康、索尼、佳能、富士、松下等常见相机品牌都适用。

## 需要注意

:::note[关于“相机设置”]
这里的“相机设置”并不代表 Lightroom 会直接调用相机厂商的原厂 RAW 解码软件。

Lightroom 使用的仍然是 Adobe 提供的相机匹配配置，只是尽量接近相机拍摄时的色彩风格。因此，最终效果与相机直出 JPEG、相机屏幕预览或原厂软件相比，仍然可能存在少量差异。
:::

这项设置主要影响之后导入的 RAW 照片，之前已经调整过的照片通常不会被自动修改。
