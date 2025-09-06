# HNair Plus Route Monitor

这个项目用于监测海南航空Plus会员页面的变动，并自动保存变更内容。

## 功能特性

- 每日自动监测指定网页内容变动
- 检测依据：`className="biaotou"` 元素的文字内容
- 自动保存变动的网页HTML文件到 `original/` 目录
- 提取网页表格数据并转换为JSON格式保存到 `json/` 目录
- 维护最新的JSON文件副本 `json/latest.json`
- 使用GitHub Actions实现自动化监测
- **航班数据差异对比功能** - 可视化对比不同日期的航班数据变化

## 目录结构

```
hnair-plus-route/
├── original/           # 保存HTML文件
├── json/              # 保存JSON文件
│   └── latest.json    # 最新的JSON文件
├── .github/
│   └── workflows/
│       └── monitor.yml # GitHub Actions工作流
├── index.html         # 主页面 - 航线查询
├── diff.html          # 差异对比页面
├── index.js           # 主程序
├── package.json       # 项目配置
├── last_content.txt   # 上次检测的内容（用于比较）
└── README.md          # 说明文档
```

## 航班数据差异对比功能

### 功能概述
diff页面提供了强大的航班数据对比功能，可以直观地展示不同日期间的航班变化情况。

### 主要特性
- **文件选择**: 从json文件夹中选择任意两个JSON文件进行对比（自动排除latest.json）
- **智能分析**: 自动识别新增、删除和未变更的航班
- **可视化展示**: 使用不同颜色和图标清晰标识变更类型
- **响应式设计**: 完美适配桌面端、平板和手机设备
- **交互式界面**: 支持标签页切换，方便查看不同类型的变更

### 使用方法
1. 访问 `diff.html` 页面
2. 在第一个下拉框中选择基准文件
3. 在第二个下拉框中选择对比文件
4. 点击"开始对比"按钮
5. 查看对比结果：
   - **绿色区域**: 新增的航班
   - **红色区域**: 删除的航班
   - **蓝色区域**: 未变更的航班

### 对比逻辑
系统使用航班号、起飞机场、降落机场和起飞时间的组合作为航班的唯一标识，确保对比结果的准确性。

### 技术实现
- 前端使用原生JavaScript实现
- 采用现代CSS Grid和Flexbox布局
- 支持异步数据加载和错误处理
- 优化的用户体验和加载动画

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