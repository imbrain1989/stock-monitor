/**
 * 通用股票监控技能 - 手动查询脚本
 * 
 * 使用方法：
 * node skills/stock-monitor/scripts/query-price.js
 * 
 * 支持交互式输入股票名称和代码
 */

const readline = require('readline');

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 主函数
async function main() {
  console.log('📈 通用股票股价查询工具\n');
  console.log('─'.repeat(60));
  
  const stockName = await new Promise(resolve => {
    rl.question('请输入股票名称（例如：九安医疗）：', resolve);
  });
  
  const stockCode = await new Promise(resolve => {
    rl.question('请输入股票代码（例如：002432 或 sz002432）：', resolve);
  });
  
  rl.close();
  
  console.log('\n' + '─'.repeat(60));
  console.log(`\n股票：${stockName} (${stockCode})`);
  console.log('\n查询方式：');
  
  // 生成搜索 URL
  const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(stockName + '股价')}`;
  const directUrl = `https://quote.eastmoney.com/${stockCode.toLowerCase()}.html`;
  
  console.log('\n方法 1：通过百度搜索获取股价：');
  console.log(`  ${searchUrl}\n`);
  console.log('方法 2：直接访问东方财富网：');
  console.log(`  ${directUrl}\n`);
  console.log('或者运行以下命令：');
  console.log(`  browser.open ${searchUrl}`);
  console.log('  browser.snapshot\n');
  console.log('─'.repeat(60));
  console.log('\n提示：定时任务会自动执行查询并推送结果。');
  console.log('      此脚本仅用于测试和手动查询。\n');
  
  console.log('百度搜索特点：');
  console.log('  ✅ 整合多个财经平台数据');
  console.log('  ✅ 实时更新');
  console.log('  ✅ 一站式查询，无需跳转');
  console.log('  ✅ 包含新闻、股评等附加信息');
}

// 运行
main().catch(console.error);
