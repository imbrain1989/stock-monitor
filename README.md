# 通用股票监控技能 📈

**stock-monitor** - OpenClaw 通用股票股价定时推送技能

## 快速开始

### 安装定时任务

```bash
cd skills/stock-monitor
node scripts/setup-cron.js
```

脚本会交互式询问：
1. 股票名称（例如：九安医疗、贵州茅台）
2. 股票代码（例如：002432、sh600519）
3. 推送时间数量（默认 6 个时间点）

### 手动查询股价

```bash
node scripts/query-price.js
```

### 删除定时任务

```bash
node scripts/remove-cron.js
```

## 功能特性

- ✅ **任意 A 股支持**：输入股票名称和代码即可监控
- ✅ **6 个默认时间点**：覆盖完整交易时段
- ✅ **仅工作日执行**：自动跳过周末和节假日
- ✅ **飞书推送**：自动发送股价信息
- ✅ **百度搜索数据**：整合多个财经平台实时数据

## 默认推送时间

| 时间 | 说明 |
|------|------|
| 09:35 | 开盘后 5 分钟 |
| 10:30 | 上午盘中 |
| 11:30 | 上午收盘前 |
| 13:05 | 下午开盘后 |
| 14:00 | 下午盘中 |
| 15:00 | 收盘时 |

## 示例

### 监控贵州茅台

```bash
$ node scripts/setup-cron.js

📈 通用股票监控技能 - 定时任务安装程序

请输入股票名称（例如：九安医疗）：贵州茅台
请输入股票代码（例如：002432 或 sz002432）：600519

推送时间数量（默认 6 个，直接回车使用默认）：

─'─'.repeat(60)

股票：贵州茅台 (600519)
推送渠道：feishu
时区：Asia/Shanghai
任务数量：6 个
─'.─'.repeat(60)

[1/6] 创建任务：贵州茅台股价 -09:35
    Cron: 35 9 * * 1-5
    ✅ 已创建 (ID: job_xxx)

... (其他时间点)

✅ 安装完成！
```

### 监控多只股票

可以为每只股票运行一次安装脚本：

```bash
# 监控九安医疗
node scripts/setup-cron.js  # 输入：九安医疗，002432

# 监控贵州茅台
node scripts/setup-cron.js  # 输入：贵州茅台，600519

# 监控宁德时代
node scripts/setup-cron.js  # 输入：宁德时代，300750
```

## 管理命令

```bash
# 查看所有定时任务
cmd /c openclaw cron list

# 查看任务执行历史
cmd /c openclaw cron runs

# 禁用任务
cmd /c openclaw cron disable <任务 ID>

# 启用任务
cmd /c openclaw cron enable <任务 ID>

# 立即测试任务
cmd /c openclaw cron run <任务 ID>

# 删除单只股票的所有任务
node scripts/remove-cron.js  # 输入股票名称
```

## 自定义配置

### 修改推送时间

编辑 `scripts/setup-cron.js`：

```javascript
const DEFAULT_SCHEDULE_TIMES = [
  { hour: 9, minute: 30 },   // 09:30 - 开盘
  { hour: 11, minute: 30 },  // 11:30 - 上午收盘
  { hour: 15, minute: 0 },   // 15:00 - 下午收盘
];
```

### 修改推送渠道

编辑 `scripts/setup-cron.js`：

```javascript
const CHANNEL = 'feishu';  // 可选：feishu, telegram, whatsapp, discord
```

### 修改推送目标

编辑 `scripts/setup-cron.js`：

```javascript
const TARGET_USER = 'ou_xxx';  // 替换为你的飞书 open_id
```

## 故障排除

### 任务未执行

1. 检查任务状态：`cmd /c openclaw cron list`
2. 查看执行历史：`cmd /c openclaw cron runs`
3. 确保 Gateway 运行：`openclaw gateway status`

### 数据获取失败

1. 检查网络连接
2. 手动测试浏览器访问
3. 查看浏览器工具是否正常

## 依赖

- Node.js v16+
- OpenClaw 2026.3.0+
- browser 工具
- feishu 插件

## 文件结构

```
skills/stock-monitor/
├── SKILL.md              # 技能说明
├── package.json          # 项目配置
├── README.md             # 本文档
└── scripts/
    ├── setup-cron.js     # 安装脚本（交互式）
    ├── remove-cron.js    # 删除脚本（交互式）
    └── query-price.js    # 查询脚本（交互式）
```

## 许可证

MIT License

---

*📈 投资有风险，入市需谨慎。数据仅供参考，不构成投资建议。*
