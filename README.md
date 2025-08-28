# HNair Plus Route Monitor

这个项目用于监测海南航空Plus会员页面的变动，并自动保存变更内容。

## 功能特性

- 每日自动监测指定网页内容变动
- 检测依据：`className="biaotou"` 元素的文字内容
- 自动保存变动的网页HTML文件到 `original/` 目录
- 提取网页表格数据并转换为JSON格式保存到 `json/` 目录
- 维护最新的JSON文件副本 `json/latest.json`
- 使用GitHub Actions实现自动化监测

## 目录结构

```
hnair-plus-route/
├── original/           # 保存HTML文件
├── json/              # 保存JSON文件
│   └── latest.json    # 最新的JSON文件
├── .github/
│   └── workflows/
│       └── monitor.yml # GitHub Actions工作流
├── index.js           # 主程序
├── package.json       # 项目配置
├── last_content.txt   # 上次检测的内容（用于比较）
└── README.md          # 说明文档
```

## 本地运行

1. 安装依赖：
```bash
npm install
```

2. 运行监测脚本：
```bash
npm start
```

## GitHub Actions

项目配置了自动化工作流，每天上午9点（上海时间）自动运行监测脚本。

### 手动触发

可以在GitHub仓库的Actions页面手动触发工作流。

## 监测逻辑

1. 获取目标网页内容
2. 提取 `className="biaotou"` 元素的文字
3. 与上次保存的内容进行比较
4. 如果有变动：
   - 保存完整HTML到 `original/YYYYMMDD.html`
   - 提取表格数据转换为JSON保存到 `json/YYYYMMDD.json`
   - 更新 `json/latest.json`
   - 更新比较基准文件
5. 如果无变动：跳过处理

## 文件命名规则

- HTML文件：`YYYYMMDD.html` (如：20250828.html)
- JSON文件：`YYYYMMDD.json` (如：20250828.json)

## 注意事项

- 确保GitHub仓库有写入权限
- 监测时间基于UTC时区，已调整为上海时间上午9点
- 首次运行时会保存当前内容作为比较基准