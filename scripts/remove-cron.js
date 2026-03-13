/**
 * 通用股票监控技能 - 定时任务删除脚本
 * 
 * 使用方法：
 * node skills/stock-monitor/scripts/remove-cron.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

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
      stdio: ['pipe', 'pipe', 'pipe']
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

// 获取任务列表
function getJobList() {
  const result = execCommand('cmd /c openclaw cron list --json');
  if (result.success) {
    try {
      const data = JSON.parse(result.output);
      return Array.isArray(data) ? data : (data.jobs || []);
    } catch (e) {
      return [];
    }
  }
  return [];
}

// 主函数
async function main() {
  console.log('📈 通用股票监控技能 - 定时任务删除程序\n');
  console.log('─'.repeat(60));
  
  const stockName = await new Promise(resolve => {
    rl.question('请输入要删除的股票名称（例如：九安医疗）：', resolve);
  });
  
  rl.close();
  
  const jobs = getJobList();
  const stockJobs = jobs.filter(job => 
    job.name && job.name.includes(stockName)
  );
  
  if (stockJobs.length === 0) {
    console.log(`\n✅ 未找到与"${stockName}"相关的定时任务`);
    return;
  }
  
  console.log(`\n找到 ${stockJobs.length} 个与"${stockName}"相关的定时任务：\n`);
  stockJobs.forEach((job, index) => {
    console.log(`[${index + 1}] ${job.name}`);
    console.log(`    ID: ${job.id}`);
    console.log(`    计划：${job.schedule?.expr || 'N/A'}`);
    console.log();
  });
  
  console.log('─'.repeat(60));
  console.log('准备删除这些任务...\n');
  
  let deletedCount = 0;
  let failedCount = 0;
  
  stockJobs.forEach(job => {
    console.log(`删除：${job.name} (${job.id})`);
    
    const cmd = `cmd /c openclaw cron rm ${job.id}`;
    const result = execCommand(cmd);
    
    if (result.success) {
      console.log(`    ✅ 已删除`);
      deletedCount++;
    } else {
      console.log(`    ❌ 失败：${result.error}`);
      failedCount++;
    }
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log('删除完成！\n');
  console.log(`成功：${deletedCount} 个`);
  console.log(`失败：${failedCount} 个`);
  console.log('═'.repeat(60));
}

// 运行
main().catch(console.error);
