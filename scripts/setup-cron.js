/**
 * 通用股票监控技能 - 定时任务安装脚本（CDP 增强版本）
 * 
 * 使用方法：
 * node skills/stock-monitor/scripts/setup-cron.js
 * 
 * 支持自定义股票名称、代码和推送时间
 * 使用 Chrome DevTools Protocol (CDP) 获取股价数据
 */

const { execSync } = require('child_process');
const readline = require('readline');

// 配置
const CHANNEL = 'feishu';
const TIMEZONE = 'Asia/Shanghai';
const TASK_TIMEOUT = 180; // 任务超时时间增加到 180 秒（CDP 需要更多时间）
const TARGET_USER = 'ou_3b363dce9bb583f7ec9f822e2b7a7880';

// 默认推送时间（可根据需要修改）
const DEFAULT_SCHEDULE_TIMES = [
  { hour: 9, minute: 35, name: '09:35' },
  { hour: 10, minute: 30, name: '10:30' },
  { hour: 11, minute: 30, name: '11:30' },
  { hour: 13, minute: 5, name: '13:05' },
  { hour: 14, minute: 0, name: '14:00' },
  { hour: 15, minute: 0, name: '15:00' },
];

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 执行命令
function execCommand(cmd) {
  try {
    const output = execSync(cmd, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 45000
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr 
    };
  }
}

// 生成 cron 表达式
function generateCron(hour, minute) {
  return `${minute} ${hour} * * 1-5`;
}

// 生成 CDP 增强的任务消息
function generateMessage(stockName, stockCode) {
  return `使用 Chrome DevTools Protocol (CDP) 查询${stockName} (${stockCode}) 当前股价。

操作步骤：
1. 尝试通过 CDP 协议连接到 Chrome 浏览器（端口 9222）
2. 访问百度搜索：https://www.baidu.com/s?wd=${encodeURIComponent(stockName + '股价')}
3. 等待页面完全加载（networkidle 状态）
4. 获取页面元素快照并定位股价信息
5. 提取股价数据（收盘价、涨跌幅、成交量等）
6. 如果 CDP 失败，自动回退到普通浏览器模式
7. 如果获取失败，自动重试最多 3 次（指数退避）
8. 将格式化后的股价信息通过飞书发送给用户

技术特性：
- 超时时间：180 秒
- 重试策略：指数退避，最多 3 次
- 回退机制：CDP 失败时自动使用普通浏览器
- 错误报告：详细的错误日志和状态信息

预期数据格式：
- 股票名称：${stockName}
- 股票代码：${stockCode}
- 当前价格：xx.xx 元
- 涨跌幅：±x.xx%
- 涨跌额：±x.xx 元
- 成交量：xx.xx 万手
- 总市值：xx.x 亿元
- 更新时间：YYYY-MM-DD HH:mm:ss`;
}

// 主函数
async function main() {
  console.log('📈 通用股票监控技能 - 定时任务安装程序（CDP 增强版本）\n');
  console.log('─'.repeat(60));
  
  // 交互式输入
  const stockName = await new Promise(resolve => {
    rl.question('请输入股票名称（例如：九安医疗）：', resolve);
  });
  
  const stockCode = await new Promise(resolve => {
    rl.question('请输入股票代码（例如：002432 或 sz002432）：', resolve);
  });
  
  const scheduleCount = await new Promise(resolve => {
    rl.question(`\n推送时间数量（默认${DEFAULT_SCHEDULE_TIMES.length}个，直接回车使用默认）：`, answer => {
      resolve(parseInt(answer) || DEFAULT_SCHEDULE_TIMES.length);
    });
  });
  
  rl.close();
  
  console.log('\n' + '─'.repeat(60));
  console.log(`股票：${stockName} (${stockCode})`);
  console.log(`推送渠道：${CHANNEL}`);
  console.log(`时区：${TIMEZONE}`);
  console.log(`任务超时：${TASK_TIMEOUT}秒`);
  console.log(`任务数量：${scheduleCount}个`);
  console.log('─'.repeat(60));
  
  const message = generateMessage(stockName, stockCode);
  const createdJobs = [];
  
  // 选择要创建的时间点
  const selectedTimes = DEFAULT_SCHEDULE_TIMES.slice(0, scheduleCount);
  
  selectedTimes.forEach((schedule, index) => {
    const cronExpr = generateCron(schedule.hour, schedule.minute);
    const jobName = `${stockName}股价-${schedule.name}`;
    
    console.log(`\n[${index + 1}/${selectedTimes.length}] 创建任务：${jobName}`);
    console.log(`    Cron: ${cronExpr}`);
    
    // 构建命令
    const cmd = `cmd /c openclaw cron add --name "${jobName}" --cron "${cronExpr}" --tz "${TIMEZONE}" --message "${message}" --announce --channel ${CHANNEL} --to ${TARGET_USER} --session isolated --timeout ${TASK_TIMEOUT}`;
    
    const result = execCommand(cmd);
    
    if (result.success) {
      const match = result.output.match(/"id":\s*"([^"]+)"/);
      const jobId = match ? match[1] : 'unknown';
      createdJobs.push({ name: jobName, id: jobId, schedule: schedule.name });
      console.log(`    ✅ 已创建 (ID: ${jobId})`);
    } else {
      console.log(`    ❌ 失败：${result.error}`);
      // 如果是权限问题，尝试使用备用方法
      if (result.error.includes('permission') || result.error.includes('unauthorized')) {
        console.log(`    🔄 尝试备用方法...`);
        const backupCmd = `cmd /c openclaw cron add --name "${jobName}" --cron "${cronExpr}" --tz "${TIMEZONE}" --message "${message}" --channel ${CHANNEL} --target user:${TARGET_USER} --session isolated --timeout ${TASK_TIMEOUT}`;
        const backupResult = execCommand(backupCmd);
        if (backupResult.success) {
          const match = backupResult.output.match(/"id":\s*"([^"]+)"/);
          const jobId = match ? match[1] : 'unknown';
          createdJobs.push({ name: jobName, id: jobId, schedule: schedule.name });
          console.log(`    ✅ 备用方法成功 (ID: ${jobId})`);
        }
      }
    }
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ 安装完成！\n');
  
  if (createdJobs.length > 0) {
    console.log('已创建的任务：');
    createdJobs.forEach(job => {
      console.log(`  • ${job.name} - ${job.schedule} (ID: ${job.id})`);
    });
    
    console.log(`\n📋 股票：${stockName} (${stockCode})`);
    console.log(`📊 推送时间：${selectedTimes.map(t => t.name).join(', ')}`);
    console.log('\n⚠️ 监控建议：');
    console.log('  重点关注 09:35 和 10:30 的执行情况');
    console.log('  如果失败，检查：');
    console.log('    1. Chrome CDP 端口状态（端口 9222）');
    console.log('    2. Feishu 授权状态');
    console.log('    3. 网络连接状态');
  }
  
  console.log('\n🔧 管理命令：');
  console.log('  查看任务列表：cmd /c openclaw cron list');
  console.log('  查看运行历史：cmd /c openclaw cron runs');
  console.log('  禁用任务：cmd /c openclaw cron disable <任务 ID>');
  console.log('  启用任务：cmd /c openclaw cron enable <任务 ID>');
  console.log('  手动执行：cmd /c openclaw cron run <任务 ID>');
  console.log('  删除任务：cmd /c openclaw cron rm <任务 ID>');
  console.log('═'.repeat(60));
}

// 运行
main().catch(console.error);
